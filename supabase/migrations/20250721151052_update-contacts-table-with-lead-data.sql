-- Update contacts table to include editable lead data fields
-- Copy lead data to contact during conversion for client ownership

-- 1. Add new columns to contacts table for editable lead data
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS last_contacted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update the single convert_lead_to_contact function to copy lead data
CREATE OR REPLACE FUNCTION convert_lead_to_contact(
  input_lead_id UUID, 
  input_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  current_client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  lead_data RECORD;
BEGIN
  -- Get current client ID using existing function
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, try to ensure client exists
  IF current_client_id IS NULL THEN
    SELECT ensure_client_exists() INTO current_client_id;
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Client not found for user and could not create one';
    END IF;
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM leads 
    WHERE id = input_lead_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid (ID: %)', input_lead_id;
  END IF;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = input_lead_id 
      AND client_id = current_client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead and client';
  END IF;
  
  -- Check and use credits
  credit_check := check_and_use_credits('leads', 1, 'Convert lead to contact');
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits to convert lead';
  END IF;
  
  -- Get complete lead data for copying
  SELECT * INTO lead_data FROM leads WHERE id = input_lead_id;
  
  -- Insert new contact with copied lead data
  INSERT INTO contacts (
    lead_id, 
    client_id, 
    first_name,
    last_name,
    email,
    phone,
    job_title,
    linkedin_url,
    company_name,
    company_website,
    industry,
    country,
    notes, 
    status,
    contact_date,
    created_at,
    updated_at
  )
  VALUES (
    input_lead_id,
    current_client_id,
    lead_data.first_name,
    lead_data.last_name,
    lead_data.email,
    lead_data.phone,
    lead_data.job_title,
    lead_data.linkedin_url,
    lead_data.company_name,
    lead_data.website,
    lead_data.industry,
    lead_data.country,
    input_notes,
    'active',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO contact_id;
  
  -- Log the conversion activity
  PERFORM log_contact_activity(
    contact_id,
    'lead_converted',
    'Lead converted to contact',
    COALESCE(input_notes, 'Lead successfully converted to contact with data copied'),
    'success',
    jsonb_build_object(
      'lead_name', COALESCE(lead_data.first_name || ' ' || lead_data.last_name, 'Unknown'),
      'company_name', lead_data.company_name,
      'email', lead_data.email,
      'data_copied', true
    )
  );
  
  -- Log the conversion in credit usage
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
  VALUES (current_client_id, 'leads', 1, 'Converted lead to contact with data copy', contact_id);
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update bulk conversion function to copy lead data
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[],
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success_count INTEGER,
  failed_count INTEGER,
  errors TEXT[],
  converted_contacts JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  current_lead_id UUID;
  success_count INTEGER := 0;
  failed_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
  converted_contacts JSONB := '[]'::JSONB;
  error_msg TEXT;
  contact_id UUID;
  credit_check BOOLEAN;
  lead_data RECORD;
BEGIN
  -- Get current client ID using existing function
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, try to fix the relationship
  IF current_client_id IS NULL THEN
    SELECT fix_user_client_relationship() INTO current_client_id;
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create or find client for user';
    END IF;
  END IF;
  
  -- Log successful client lookup
  RAISE NOTICE 'Using client_id: % for bulk conversion', current_client_id;
  
  -- Process each lead
  FOREACH current_lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is not already converted
      IF NOT EXISTS (SELECT 1 FROM leads WHERE id = current_lead_id) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s not found', current_lead_id));
        CONTINUE;
      END IF;
      
      IF EXISTS (SELECT 1 FROM contacts WHERE lead_id = current_lead_id AND client_id = current_client_id) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s already converted to contact', current_lead_id));
        CONTINUE;
      END IF;
      
      -- Check and use credits (1 credit per lead)
      credit_check := check_and_use_credits('leads', 1, format('Bulk convert lead %s', current_lead_id));
      
      IF NOT credit_check THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Insufficient credits for lead %s', current_lead_id));
        CONTINUE;
      END IF;
      
      -- Get complete lead data for copying
      SELECT * INTO lead_data FROM leads WHERE id = current_lead_id;
      
      -- Insert new contact with copied lead data
      INSERT INTO contacts (
        lead_id, 
        client_id, 
        first_name,
        last_name,
        email,
        phone,
        job_title,
        linkedin_url,
        company_name,
        company_website,
        industry,
        country,
        notes, 
        status,
        contact_date,
        created_at,
        updated_at
      )
      VALUES (
        current_lead_id,
        current_client_id,
        lead_data.first_name,
        lead_data.last_name,
        lead_data.email,
        lead_data.phone,
        lead_data.job_title,
        lead_data.linkedin_url,
        lead_data.company_name,
        lead_data.website,
        lead_data.industry,
        lead_data.country,
        notes,
        'active',
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id INTO contact_id;
      
      -- Add to converted_contacts array
      converted_contacts := converted_contacts || jsonb_build_object(
        'lead_id', current_lead_id,
        'contact_id', contact_id
      );
      
      -- Log the conversion in credit usage
      INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
      VALUES (current_client_id, 'leads', 1, format('Bulk converted lead to contact with data copy', current_lead_id), contact_id);
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      error_msg := format('Error converting lead %s: %s', current_lead_id, SQLERRM);
      errors := array_append(errors, error_msg);
    END;
  END LOOP;
  
  RETURN QUERY SELECT success_count, failed_count, errors, converted_contacts;
END;
$$;

-- 4. Update get_contacts_with_lead_data function to use contact data instead of joining leads
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
  -- Contact's own data (editable by client)
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_job_title TEXT,
  contact_linkedin_url TEXT,
  contact_company_name TEXT,
  contact_company_website TEXT,
  contact_industry TEXT,
  contact_country TEXT,
  last_contacted_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  -- Original lead data (for reference/audit)
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_email TEXT,
  lead_company_name TEXT,
  lead_job_title TEXT,
  lead_industry TEXT,
  lead_country TEXT
) AS $$
DECLARE
  current_client_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, return empty result
  IF current_client_id IS NULL THEN
    RETURN;
  END IF;
  
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
    -- Contact's editable data
    c.first_name as contact_first_name,
    c.last_name as contact_last_name,
    c.email as contact_email,
    c.phone as contact_phone,
    c.job_title as contact_job_title,
    c.linkedin_url as contact_linkedin_url,
    c.company_name as contact_company_name,
    c.company_website as contact_company_website,
    c.industry as contact_industry,
    c.country as contact_country,
    c.last_contacted_date,
    c.next_follow_up_date,
    -- Original lead data for reference
    l.first_name as lead_first_name,
    l.last_name as lead_last_name,
    l.email as lead_email,
    l.company_name as lead_company_name,
    l.job_title as lead_job_title,
    l.industry as lead_industry,
    l.country as lead_country
  FROM contacts c
  LEFT JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id = current_client_id
  ORDER BY c.contact_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 