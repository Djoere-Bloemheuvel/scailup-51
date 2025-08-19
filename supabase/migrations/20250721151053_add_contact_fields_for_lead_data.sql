-- Add contact fields and update conversion functions to copy lead data
-- This ensures contact has its own editable copy of lead data

-- 1. Add new columns to contacts table (skip if they already exist)
DO $$ 
BEGIN
  -- Add first_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'first_name') THEN
    ALTER TABLE contacts ADD COLUMN first_name TEXT;
  END IF;
  
  -- Add last_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_name') THEN
    ALTER TABLE contacts ADD COLUMN last_name TEXT;
  END IF;
  
  -- Add email if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'email') THEN
    ALTER TABLE contacts ADD COLUMN email TEXT;
  END IF;
  
  -- Add phone if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'phone') THEN
    ALTER TABLE contacts ADD COLUMN phone TEXT;
  END IF;
  
  -- Add job_title if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'job_title') THEN
    ALTER TABLE contacts ADD COLUMN job_title TEXT;
  END IF;
  
  -- Add linkedin_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_url') THEN
    ALTER TABLE contacts ADD COLUMN linkedin_url TEXT;
  END IF;
  
  -- Add company_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_name') THEN
    ALTER TABLE contacts ADD COLUMN company_name TEXT;
  END IF;
  
  -- Add company_website if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_website') THEN
    ALTER TABLE contacts ADD COLUMN company_website TEXT;
  END IF;
  
  -- Add industry if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'industry') THEN
    ALTER TABLE contacts ADD COLUMN industry TEXT;
  END IF;
  
  -- Add country if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'country') THEN
    ALTER TABLE contacts ADD COLUMN country TEXT;
  END IF;
  
  -- Add last_contacted_date if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_contacted_date') THEN
    ALTER TABLE contacts ADD COLUMN last_contacted_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add next_follow_up_date if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'next_follow_up_date') THEN
    ALTER TABLE contacts ADD COLUMN next_follow_up_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add contact_date if not exists (might already exist)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'contact_date') THEN
    ALTER TABLE contacts ADD COLUMN contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
END $$;

-- 2. Update bulk_convert_leads_to_contacts to copy lead data to contacts
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
  -- Try to get client_id using existing function first
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, try to fix the relationship
  IF current_client_id IS NULL THEN
    BEGIN
      SELECT fix_user_client_relationship() INTO current_client_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create or find client for user: %', SQLERRM;
    END;
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create or find client for user after fix attempt';
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
      
      -- Check and use credits (1 credit per lead) - with error handling
      BEGIN
        credit_check := check_and_use_credits('leads', 1, format('Bulk convert lead %s', current_lead_id));
      EXCEPTION
        WHEN OTHERS THEN
          -- If credit system fails, continue without it for now
          RAISE NOTICE 'Credit check failed for lead %, continuing: %', current_lead_id, SQLERRM;
          credit_check := true;
      END;
      
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
      
      -- Log the conversion in credit usage (with error handling)
      BEGIN
        INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
        VALUES (current_client_id, 'leads', 1, format('Bulk converted lead to contact with data copy', current_lead_id), contact_id);
      EXCEPTION
        WHEN OTHERS THEN
          -- If logging fails, continue without it
          RAISE NOTICE 'Credit usage logging failed for contact %, continuing: %', contact_id, SQLERRM;
      END;
      
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

-- 3. Update convert_lead_to_contact function to copy lead data
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
    SELECT fix_user_client_relationship() INTO current_client_id;
    
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
  BEGIN
    credit_check := check_and_use_credits('leads', 1, 'Convert lead to contact');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Credit check failed, continuing: %', SQLERRM;
      credit_check := true;
  END;
  
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
  
  -- Log the conversion activity (with error handling)
  BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Activity logging failed for contact %, continuing: %', contact_id, SQLERRM;
  END;
  
  -- Log the conversion in credit usage
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (current_client_id, 'leads', 1, 'Converted lead to contact with data copy', contact_id);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Credit usage logging failed for contact %, continuing: %', contact_id, SQLERRM;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 