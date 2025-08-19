-- Fix Convert Leads to Contact Functions
-- Copy and paste this entire file into your Supabase SQL Editor

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
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
  RETURNING id INTO contact_id;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create check_and_use_credits function (simplified version)
CREATE OR REPLACE FUNCTION check_and_use_credits(credit_type TEXT, amount INTEGER, description TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- For now, always return true (credit system can be implemented later)
  -- This allows the convert function to work without requiring a full credit system
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);

-- 7. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contacts_updated_at();

-- 8. Test the functions
DO $$
BEGIN
  RAISE NOTICE 'Testing functions...';
  
  -- Test if functions exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'convert_lead_to_contact') THEN
    RAISE NOTICE '✅ convert_lead_to_contact function exists';
  ELSE
    RAISE NOTICE '❌ convert_lead_to_contact function missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_contacts_with_lead_data') THEN
    RAISE NOTICE '✅ get_contacts_with_lead_data function exists';
  ELSE
    RAISE NOTICE '❌ get_contacts_with_lead_data function missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_and_use_credits') THEN
    RAISE NOTICE '✅ check_and_use_credits function exists';
  ELSE
    RAISE NOTICE '❌ check_and_use_credits function missing';
  END IF;
  
  RAISE NOTICE 'Convert functions setup completed!';
END $$; 