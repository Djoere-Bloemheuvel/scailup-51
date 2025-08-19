-- Create convert_lead_to_contact and related functions
-- This migration adds the missing backend functions for lead-to-contact conversion

-- 1. Create contacts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
    RAISE NOTICE 'Creating contacts table...';
    CREATE TABLE contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL,
      client_id UUID NOT NULL,
      contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT fk_contacts_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      CONSTRAINT fk_contacts_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      CONSTRAINT unique_lead_per_client UNIQUE (lead_id, client_id)
    );
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Contacts table created successfully!';
  ELSE
    RAISE NOTICE 'Contacts table already exists';
  END IF;
END $$;

-- 2. Create RLS policies for contacts
CREATE POLICY IF NOT EXISTS "Users can view their own contacts" ON contacts
 FOR SELECT USING (
   client_id IN (
     SELECT c.id FROM clients c 
     JOIN users u ON c.id = u.client_id 
     WHERE u.id = auth.uid()
   )
 );

CREATE POLICY IF NOT EXISTS "Users can insert their own contacts" ON contacts
 FOR INSERT WITH CHECK (
   client_id IN (
     SELECT c.id FROM clients c 
     JOIN users u ON c.id = u.client_id 
     WHERE u.id = auth.uid()
   )
 );

CREATE POLICY IF NOT EXISTS "Users can update their own contacts" ON contacts
 FOR UPDATE USING (
   client_id IN (
     SELECT c.id FROM clients c 
     JOIN users u ON c.id = u.client_id 
     WHERE u.id = auth.uid()
   )
 );

CREATE POLICY IF NOT EXISTS "Users can delete their own contacts" ON contacts
 FOR DELETE USING (
   client_id IN (
     SELECT c.id FROM clients c 
     JOIN users u ON c.id = u.client_id 
     WHERE u.id = auth.uid()
   )
 );

-- 3. Create get_contacts_with_lead_data function
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

-- 4. Create convert_lead_to_contact function
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
    RAISE EXCEPTION 'Lead not found or invalid';
  END IF;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = convert_lead_to_contact.lead_id 
      AND client_id = convert_lead_to_contact.client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Check and use credits (if credit system exists)
  BEGIN
    SELECT check_and_use_credits('leads', 1, 'Convert lead to contact') INTO credit_check;
    IF NOT credit_check THEN
      RAISE EXCEPTION 'Insufficient credits to convert lead';
    END IF;
  EXCEPTION
    WHEN undefined_function THEN
      -- Credit system not available, continue without credit check
      credit_check := true;
  END;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
  RETURNING id INTO contact_id;
  
  -- Log the conversion (if credit_usage_logs table exists)
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (convert_lead_to_contact.client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  EXCEPTION
    WHEN undefined_table THEN
      -- credit_usage_logs table doesn't exist, skip logging
      NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create check_and_use_credits function (if it doesn't exist)
CREATE OR REPLACE FUNCTION check_and_use_credits(credit_type TEXT, amount INTEGER, description TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
  available_credits INTEGER;
  credit_balance_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if credit_balances table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_balances') THEN
    -- Credit system not available, return true to allow operation
    RETURN true;
  END IF;
  
  -- Get available credits
  SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
  FROM credit_balances cb
  WHERE cb.client_id = check_and_use_credits.client_id
    AND cb.credit_type = check_and_use_credits.credit_type
    AND cb.expires_at > NOW()
    AND cb.amount > 0;
  
  -- Check if enough credits are available
  IF available_credits < check_and_use_credits.amount THEN
    RETURN false;
  END IF;
  
  -- Use credits (deduct from oldest balance first)
  WITH credit_usage AS (
    SELECT cb.id, cb.amount,
           LEAST(cb.amount, check_and_use_credits.amount - COALESCE(
             (SELECT SUM(used.amount) FROM (
               SELECT cb2.amount
               FROM credit_balances cb2
               WHERE cb2.client_id = check_and_use_credits.client_id
                 AND cb2.credit_type = check_and_use_credits.credit_type
                 AND cb2.expires_at > NOW()
                 AND cb2.amount > 0
                 AND cb2.id < cb.id
               ORDER BY cb2.created_at ASC
             ) used
           ), 0)) as to_use
    FROM credit_balances cb
    WHERE cb.client_id = check_and_use_credits.client_id
      AND cb.credit_type = check_and_use_credits.credit_type
      AND cb.expires_at > NOW()
      AND cb.amount > 0
    ORDER BY cb.created_at ASC
    LIMIT 1
  )
  UPDATE credit_balances cb
  SET amount = cb.amount - cu.to_use
  FROM credit_usage cu
  WHERE cb.id = cu.id;
  
  -- Log the usage (if credit_usage_logs table exists)
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, used_at)
    VALUES (check_and_use_credits.client_id, check_and_use_credits.credit_type, check_and_use_credits.amount, check_and_use_credits.description, NOW());
  EXCEPTION
    WHEN undefined_table THEN
      -- credit_usage_logs table doesn't exist, skip logging
      NULL;
  END;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create bulk_convert_leads_to_contacts function
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(lead_ids UUID[], notes TEXT DEFAULT NULL)
RETURNS TABLE(lead_id UUID, success BOOLEAN, contact_id UUID, error_message TEXT) AS $$
DECLARE
  lead_id UUID;
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  total_leads INTEGER;
  available_credits INTEGER;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if credit_balances table exists and get available credits
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_balances') THEN
    SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
    FROM credit_balances cb
    WHERE cb.client_id = bulk_convert_leads_to_contacts.client_id
      AND cb.credit_type = 'leads'
      AND cb.expires_at > NOW()
      AND cb.amount > 0;
    
    total_leads := array_length(lead_ids, 1);
    
    IF available_credits < total_leads THEN
      RAISE EXCEPTION 'Insufficient credits: % available, % required', available_credits, total_leads;
    END IF;
  END IF;
  
  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is accessible
      SELECT EXISTS(
        SELECT 1 FROM leads 
        WHERE id = lead_id
          AND email IS NOT NULL 
          AND email != ''
      ) INTO lead_exists;
      
      IF NOT lead_exists THEN
        RETURN QUERY SELECT lead_id, false, NULL::UUID, 'Lead not found or invalid';
        CONTINUE;
      END IF;
      
      -- Check if contact already exists
      SELECT EXISTS(
        SELECT 1 FROM contacts 
        WHERE lead_id = lead_id 
          AND client_id = bulk_convert_leads_to_contacts.client_id
      ) INTO contact_exists;
      
      IF contact_exists THEN
        RETURN QUERY SELECT lead_id, false, NULL::UUID, 'Contact already exists for this lead';
        CONTINUE;
      END IF;
      
      -- Insert new contact
      INSERT INTO contacts (lead_id, client_id, notes, status)
      VALUES (lead_id, bulk_convert_leads_to_contacts.client_id, bulk_convert_leads_to_contacts.notes, 'active')
      RETURNING id INTO contact_id;
      
      -- Log the conversion (if credit_usage_logs table exists)
      BEGIN
        INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
        VALUES (bulk_convert_leads_to_contacts.client_id, 'leads', 1, 'Bulk converted lead to contact', contact_id);
      EXCEPTION
        WHEN undefined_table THEN
          -- credit_usage_logs table doesn't exist, skip logging
          NULL;
      END;
      
      RETURN QUERY SELECT lead_id, true, contact_id, NULL::TEXT;
      
    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY SELECT lead_id, false, NULL::UUID, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);

-- 8. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contacts_updated_at();

-- Migration completed successfully
SELECT 'Convert functions migration completed successfully!' as status; 