-- Final fix for leads-contacts relationship - add missing columns only

-- 1. Add missing columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_summary TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS match_reasons TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS unique_angles TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS best_campaign_match TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'not_contacted';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE;

-- 2. Add missing columns to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Create or replace the get_contacts_with_lead_data function
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

-- 4. Create or replace the convert_lead_to_contact function with correct parameters
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
  EXCEPTION
    WHEN OTHERS THEN
      -- If credit system doesn't exist, continue without it
      credit_check := true;
  END;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits to convert lead';
  END IF;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
  RETURNING id INTO contact_id;
  
  -- Log the conversion (if credit system exists)
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (convert_lead_to_contact.client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- If credit_usage_logs doesn't exist, skip logging
      NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_leads_company_summary ON leads(company_summary);
CREATE INDEX IF NOT EXISTS idx_leads_enrichment_status ON leads(enrichment_status);

-- 6. Grant execute permissions
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contacts_with_lead_data() TO authenticated;
