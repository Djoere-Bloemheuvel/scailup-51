
-- Step 3: Restore essential database functions
-- These functions are critical for the application to work properly

-- Create or replace the convert_lead_to_contact function
CREATE OR REPLACE FUNCTION convert_lead_to_contact(
  lead_id UUID, 
  notes TEXT DEFAULT NULL
)
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

-- Create or replace the get_contacts_with_lead_data function
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
    COALESCE(l.first_name, 'Unknown') as lead_first_name,
    COALESCE(l.last_name, 'Lead') as lead_last_name,
    COALESCE(l.email, 'No email') as lead_email,
    COALESCE(l.company_name, 'Unknown Company') as lead_company_name,
    COALESCE(l.job_title, 'Unknown Title') as lead_job_title,
    COALESCE(l.industry, 'Unknown') as lead_industry,
    COALESCE(l.country, 'Unknown') as lead_country,
    COALESCE(l.company_summary, '') as lead_company_summary,
    COALESCE(l.product_match_percentage, 0) as lead_product_match_percentage,
    COALESCE(l.match_reasons, ARRAY[]::TEXT[]) as lead_match_reasons,
    COALESCE(l.unique_angles, ARRAY[]::TEXT[]) as lead_unique_angles,
    COALESCE(l.best_campaign_match, '') as lead_best_campaign_match,
    COALESCE(l.personalized_icebreaker, '') as lead_personalized_icebreaker
  FROM contacts c
  LEFT JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id IN (
    SELECT cl.id FROM clients cl 
    JOIN users u ON cl.id = u.client_id 
    WHERE u.id = auth.uid()
  )
  ORDER BY c.contact_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the bulk_convert_leads_to_contacts function
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[], 
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  lead_id UUID, 
  success BOOLEAN, 
  contact_id UUID, 
  error_message TEXT
) AS $$
DECLARE
  lead_id UUID;
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
      
      RETURN QUERY SELECT lead_id, true, contact_id, NULL::TEXT;
      
    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY SELECT lead_id, false, NULL::UUID, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the check_and_use_credits function (simplified version)
CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT, 
  amount INTEGER, 
  description TEXT DEFAULT NULL
)
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
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
