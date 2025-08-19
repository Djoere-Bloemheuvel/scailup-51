-- Restore Contact Conversion Migration
-- This migration restores the contact conversion functionality
-- while maintaining full Lovable compatibility

-- 1. Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  client_id UUID NOT NULL,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add foreign key constraints
  CONSTRAINT fk_contacts_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_contacts_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 2. Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for contacts
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 4. Create indexes for contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);

-- 5. Create the convert_lead_to_contact function
CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM leads 
    WHERE id = convert_lead_to_contact.lead_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or not accessible';
  END IF;
  
  -- Check if contact already exists for this lead and client
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = convert_lead_to_contact.lead_id
      AND client_id = convert_lead_to_contact.client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Check if we have enough leads credits (1 credit per conversion)
  credit_check := check_and_use_credits('leads', 1, 'Lead to contact conversion');
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient leads credits for conversion';
  END IF;
  
  -- Create contact record
  INSERT INTO contacts (lead_id, client_id, notes, status, contact_date, created_at, updated_at)
  VALUES (lead_id, client_id, notes, 'active', NOW(), NOW(), NOW())
  RETURNING id INTO contact_id;
  
  -- Update lead status if the column exists
  BEGIN
    UPDATE leads SET
      contact_status = 'contact',
      contact_date = NOW(),
      updated_at = NOW()
    WHERE id = lead_id;
  EXCEPTION WHEN undefined_column THEN
    -- Column doesn't exist yet, skip the update
    NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create or update the check_and_use_credits function
CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
  available_credits INTEGER;
  module_id UUID;
  balance_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Get module_id for lead_engine
  SELECT id INTO module_id
  FROM modules
  WHERE slug = 'lead_engine'
  LIMIT 1;
  
  IF module_id IS NULL THEN
    RAISE EXCEPTION 'Lead engine module not found';
  END IF;
  
  -- Check available credits
  SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
  FROM credit_balances cb
  WHERE cb.client_id = check_and_use_credits.client_id
    AND cb.credit_type = check_and_use_credits.credit_type
    AND cb.module_id = module_id
    AND cb.expires_at > NOW();
  
  -- If enough credits, use them
  IF available_credits >= amount THEN
    -- Find the oldest balance with enough credits (FIFO)
    SELECT cb.id INTO balance_id
    FROM credit_balances cb
    WHERE cb.client_id = check_and_use_credits.client_id
      AND cb.credit_type = check_and_use_credits.credit_type
      AND cb.module_id = module_id
      AND cb.expires_at > NOW()
      AND cb.amount >= check_and_use_credits.amount
    ORDER BY cb.expires_at ASC
    LIMIT 1;
    
    IF balance_id IS NULL THEN
      RETURN FALSE;
    END IF;
    
    -- Deduct credits
    UPDATE credit_balances SET
      amount = amount - check_and_use_credits.amount,
      updated_at = NOW()
    WHERE id = balance_id;
    
    -- Log usage
    INSERT INTO credit_usage_logs (client_id, module_id, credit_type, amount, description, used_at, created_at)
    VALUES (client_id, module_id, credit_type, amount, description, NOW(), NOW());
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Ensure default leads credits exist for existing clients
INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  m.id,
  'leads',
  100, -- Default 100 leads credits
  NOW() + INTERVAL '3 months',
  NOW(),
  NOW()
FROM clients c
CROSS JOIN modules m
WHERE m.slug = 'lead_engine'
  AND NOT EXISTS (
    SELECT 1 FROM credit_balances cb 
    WHERE cb.client_id = c.id 
      AND cb.module_id = m.id 
      AND cb.credit_type = 'leads'
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_balances_leads_type ON credit_balances(credit_type) WHERE credit_type = 'leads';
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_leads_type ON credit_usage_logs(credit_type) WHERE credit_type = 'leads';

-- 9. Test the functions
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  -- Test if functions compile correctly
  SELECT check_and_use_credits('leads', 0, 'test') INTO test_result;
  RAISE NOTICE 'Contact conversion functions restored successfully';
END;
$$; 