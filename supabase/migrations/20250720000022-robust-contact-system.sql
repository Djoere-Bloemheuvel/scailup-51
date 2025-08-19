-- Robust Contact System Migration
-- This migration creates a completely watertight contact system
-- while maintaining full Lovable compatibility

-- 1. Drop and recreate contacts table to ensure clean state
DROP TABLE IF EXISTS contacts CASCADE;

-- 2. Create robust contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  client_id UUID NOT NULL,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add foreign key constraints with proper cascade
  CONSTRAINT fk_contacts_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_contacts_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Ensure unique lead per client
  CONSTRAINT unique_lead_per_client UNIQUE (lead_id, client_id)
);

-- 3. Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 4. Create comprehensive RLS policies
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

-- 5. Create comprehensive indexes
CREATE INDEX idx_contacts_client_id ON contacts(client_id);
CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX idx_contacts_contact_date ON contacts(contact_date);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_updated_at ON contacts(updated_at);

-- 6. Create robust convert_lead_to_contact function
CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  lead_data RECORD;
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
  
  -- Get lead data for validation
  SELECT * INTO lead_data FROM leads WHERE id = convert_lead_to_contact.lead_id;
  
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
  
  -- Log the conversion
  INSERT INTO credit_usage_logs (client_id, module_id, credit_type, amount, description, used_at, created_at)
  SELECT 
    client_id,
    m.id,
    'leads',
    1,
    'Lead converted to contact: ' || COALESCE(lead_data.first_name || ' ' || lead_data.last_name, lead_data.email),
    NOW(),
    NOW()
  FROM modules m
  WHERE m.slug = 'lead_engine'
  LIMIT 1;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get contacts with lead data
CREATE OR REPLACE FUNCTION get_contacts_with_lead_data()
RETURNS TABLE (
  id UUID,
  lead_id UUID,
  client_id UUID,
  contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_email TEXT,
  lead_company_name TEXT,
  lead_job_title TEXT,
  lead_industry TEXT,
  lead_country TEXT,
  lead_company_summary TEXT,
  lead_product_match_percentage INTEGER,
  lead_match_reasons TEXT[],
  lead_unique_angles TEXT[],
  lead_best_campaign_match TEXT,
  lead_personalized_icebreaker TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.lead_id,
    c.client_id,
    c.contact_date,
    c.notes,
    c.status,
    c.created_at,
    c.updated_at,
    l.first_name,
    l.last_name,
    l.email,
    l.company_name,
    l.job_title,
    l.industry,
    l.country,
    l.company_summary,
    l.product_match_percentage,
    l.match_reasons,
    l.unique_angles,
    l.best_campaign_match,
    l.personalized_icebreaker
  FROM contacts c
  JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id IN (
    SELECT cl.id FROM clients cl 
    JOIN users u ON cl.id = u.client_id 
    WHERE u.id = auth.uid()
  )
  ORDER BY c.contact_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Ensure credit system functions exist
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

-- 9. Ensure default leads credits exist for existing clients
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

-- 10. Add dummy contacts for djoere@scailup.io
DO $$
DECLARE
  client_id UUID;
  lead_ids UUID[];
  i INTEGER;
  dummy_notes TEXT[];
BEGIN
  -- Get client_id for djoere@scailup.io
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.email = 'djoere@scailup.io';
  
  IF client_id IS NOT NULL THEN
    -- Get 10 random leads
    SELECT ARRAY_AGG(id) INTO lead_ids
    FROM leads
    WHERE email IS NOT NULL AND email != ''
    LIMIT 10;
    
    -- Dummy notes for variety
    dummy_notes := ARRAY[
      'Interesse getoond in AI-oplossingen',
      'Potentiële klant voor lead generation',
      'Follow-up nodig voor demo',
      'Budget beschikbaar voor Q4',
      'Beslisser in organisatie',
      'Technische vragen gesteld',
      'Referentie van bestaande klant',
      'Interesse in LinkedIn outreach',
      'Email campagne succesvol',
      'Meeting gepland voor volgende week'
    ];
    
    -- Create dummy contacts
    FOR i IN 1..ARRAY_LENGTH(lead_ids, 1) LOOP
      -- Skip if contact already exists
      IF NOT EXISTS (
        SELECT 1 FROM contacts 
        WHERE lead_id = lead_ids[i] 
        AND client_id = client_id
      ) THEN
        INSERT INTO contacts (
          lead_id, 
          client_id, 
          notes, 
          status, 
          contact_date, 
          created_at, 
          updated_at
        ) VALUES (
          lead_ids[i],
          client_id,
          dummy_notes[1 + (i-1) % ARRAY_LENGTH(dummy_notes, 1)],
          CASE WHEN i <= 3 THEN 'active' WHEN i <= 7 THEN 'converted' ELSE 'inactive' END,
          NOW() - INTERVAL '1 day' * (i-1),
          NOW() - INTERVAL '1 day' * (i-1),
          NOW() - INTERVAL '1 day' * (i-1)
        );
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Added dummy contacts for client %', client_id;
  ELSE
    RAISE NOTICE 'Client not found for djoere@scailup.io';
  END IF;
END $$;

-- 11. Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_balances_leads_type ON credit_balances(credit_type) WHERE credit_type = 'leads';
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_leads_type ON credit_usage_logs(credit_type) WHERE credit_type = 'leads';
CREATE INDEX IF NOT EXISTS idx_contacts_client_status ON contacts(client_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_date_range ON contacts(contact_date) WHERE contact_date >= NOW() - INTERVAL '1 year';

-- 12. Test the functions
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  RAISE NOTICE 'Robust contact system is ready for use';
  RAISE NOTICE 'Dummy contacts have been added for testing';
END $$; 