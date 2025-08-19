-- Fix Contacts-Leads Relationship
-- Run this in your Supabase SQL Editor to fix the relationship error

-- 1. First, check if contacts table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
    RAISE NOTICE 'Contacts table does not exist, creating it...';
    
    -- Create contacts table
    CREATE TABLE contacts (
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
      CONSTRAINT fk_contacts_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      
      -- Ensure unique lead per client
      CONSTRAINT unique_lead_per_client UNIQUE (lead_id, client_id)
    );
    
    -- Enable RLS
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
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
    
    -- Create indexes
    CREATE INDEX idx_contacts_client_id ON contacts(client_id);
    CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
    CREATE INDEX idx_contacts_contact_date ON contacts(contact_date);
    CREATE INDEX idx_contacts_status ON contacts(status);
    CREATE INDEX idx_contacts_created_at ON contacts(created_at);
    CREATE INDEX idx_contacts_updated_at ON contacts(updated_at);
    
    RAISE NOTICE 'Contacts table created successfully!';
  ELSE
    RAISE NOTICE 'Contacts table already exists';
  END IF;
END $$;

-- 2. Create or replace the get_contacts_with_lead_data function
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

-- 3. Create or replace the convert_lead_to_contact function
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
  
  -- Check and use credits
  SELECT check_and_use_credits('leads', 1, 'Convert lead to contact') INTO credit_check;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits to convert lead';
  END IF;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
  RETURNING id INTO contact_id;
  
  -- Log the conversion
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
  VALUES (convert_lead_to_contact.client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add some dummy contacts for testing (linked to djoere@scailup.io)
DO $$
DECLARE
  test_client_id UUID;
  test_lead_ids UUID[];
  i INTEGER;
BEGIN
  -- Get client_id for djoere@scailup.io
  SELECT c.id INTO test_client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.email = 'djoere@scailup.io'
  LIMIT 1;
  
  IF test_client_id IS NOT NULL THEN
    -- Get some existing leads
    SELECT ARRAY_AGG(id) INTO test_lead_ids
    FROM leads
    WHERE email IS NOT NULL
    LIMIT 10;
    
    -- Insert dummy contacts
    FOR i IN 1..ARRAY_LENGTH(test_lead_ids, 1) LOOP
      INSERT INTO contacts (lead_id, client_id, notes, status, contact_date)
      VALUES (
        test_lead_ids[i],
        test_client_id,
        CASE 
          WHEN i % 3 = 0 THEN 'Interesse in premium pakket'
          WHEN i % 3 = 1 THEN 'Follow-up nodig voor demo'
          ELSE 'Nieuwe prospect - eerste contact'
        END,
        CASE 
          WHEN i % 4 = 0 THEN 'converted'
          WHEN i % 4 = 1 THEN 'inactive'
          ELSE 'active'
        END,
        NOW() - (i || ' days')::INTERVAL
      )
      ON CONFLICT (lead_id, client_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Added % dummy contacts for testing', ARRAY_LENGTH(test_lead_ids, 1);
  ELSE
    RAISE NOTICE 'Test client not found, skipping dummy data';
  END IF;
END $$;

-- 5. Verify the relationship works
SELECT 
  'Relationship test' as test_name,
  COUNT(*) as contacts_count,
  COUNT(DISTINCT c.lead_id) as unique_leads,
  COUNT(DISTINCT l.id) as leads_found
FROM contacts c
LEFT JOIN leads l ON c.lead_id = l.id;

RAISE NOTICE 'Contacts-Leads relationship fix completed successfully!'; 