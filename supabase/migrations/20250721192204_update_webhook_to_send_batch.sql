-- Update webhook to send all converted contacts in one batch
-- This allows n8n to control performance and processing order
-- Maintain Lovable compatibility

-- 1. Update convert_lead_to_contact function to collect contact data for batch webhook
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
  webhook_url TEXT;
  webhook_data JSONB;
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
  
  -- Insert new contact with correctly mapped lead data and 'enriching' status
  INSERT INTO contacts (
    lead_id, 
    client_id, 
    first_name,
    last_name,
    full_name,
    email,
    secondary_email,
    phone,                    -- contacts field
    mobile_phone,             -- new field for leads.mobile_phone
    job_title,
    job_title_raw,
    linkedin_url,
    company,                  -- contacts field (use company_name from leads)
    company_name,             -- new field for exact mapping
    website,                  -- contacts field
    company_website,          -- new field for leads.company_website
    website_url,              -- contacts existing field
    company_linkedin_url,
    company_phone,
    company_size,
    company_size_text,
    company_summary,
    industry,
    city,
    province,
    country,
    employee_count,
    seniority,
    lead_source,
    email_type,
    email_valid,
    enrichment_status,
    enrichment_date,
    match_reasons,
    persona_ids,
    campaign_ids,
    best_campaign_match,
    product_match_percentage,
    personalized_icebreaker,
    unique_angles,
    is_active,
    scrape_failed,
    notes, 
    status,                   -- Set to 'enriching' status
    contact_date,
    created_at,
    updated_at
  )
  VALUES (
    input_lead_id,
    current_client_id,
    lead_data.first_name,
    lead_data.last_name,
    lead_data.full_name,
    lead_data.email,
    lead_data.secondary_email,
    lead_data.mobile_phone,        -- leads.mobile_phone → contacts.phone
    lead_data.mobile_phone,        -- also store in mobile_phone for completeness
    lead_data.job_title,
    lead_data.job_title_raw,
    lead_data.linkedin_url,
    lead_data.company_name,        -- leads.company_name → contacts.company
    lead_data.company_name,        -- also store in company_name
    lead_data.company_website,     -- leads.company_website → contacts.website
    lead_data.company_website,     -- also store in company_website
    lead_data.company_website,     -- also store in website_url
    lead_data.company_linkedin_url,
    lead_data.company_phone,
    lead_data.company_size,
    lead_data.company_size_text,
    lead_data.company_summary,
    lead_data.industry,
    lead_data.city,
    lead_data.province,
    lead_data.country,
    lead_data.employee_count,
    lead_data.seniority,
    lead_data.lead_source,
    lead_data.email_type,
    lead_data.email_valid,
    lead_data.enrichment_status,
    lead_data.enrichment_date,
    lead_data.match_reasons,
    lead_data.persona_ids,
    lead_data.campaign_ids,
    lead_data.best_campaign_match,
    lead_data.product_match_percentage,
    lead_data.personalized_icebreaker,
    lead_data.unique_angles,
    COALESCE(lead_data.is_active, true),
    COALESCE(lead_data.scrape_failed, false),
    input_notes,
    'enriching',                   -- Default status is now 'enriching'
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
      COALESCE(input_notes, 'Lead successfully converted to contact - status set to enriching for processing'),
      'success',
      jsonb_build_object(
        'lead_name', COALESCE(lead_data.first_name || ' ' || lead_data.last_name, 'Unknown'),
        'company_name', lead_data.company_name,
        'email', lead_data.email,
        'data_copied', true,
        'fields_mapped', true,
        'initial_status', 'enriching'
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Activity logging failed for contact %, continuing: %', contact_id, SQLERRM;
  END;
  
  -- Log the conversion in credit usage
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (current_client_id, 'leads', 1, 'Converted lead to contact with enriching status', contact_id);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Credit usage logging failed for contact %, continuing: %', contact_id, SQLERRM;
  END;
  
  -- Send webhook with single contact data (for backward compatibility)
  BEGIN
    -- Get webhook URL from client settings
    SELECT webhook_url INTO webhook_url FROM clients WHERE id = current_client_id;
    
    IF webhook_url IS NOT NULL AND webhook_url != '' THEN
      -- Prepare webhook data with single contact
      webhook_data := jsonb_build_object(
        'event_type', 'contact_created',
        'client_id', current_client_id,
        'contact_id', contact_id,
        'lead_id', input_lead_id,
        'contact_data', (
          SELECT to_jsonb(c.*) 
          FROM contacts c 
          WHERE c.id = contact_id
        ),
        'lead_data', to_jsonb(lead_data),
        'conversion_notes', input_notes,
        'timestamp', NOW(),
        'batch_size', 1
      );
      
      -- Send webhook
      PERFORM net.http_post(
        url := webhook_url,
        body := webhook_data
      );
      
      RAISE NOTICE 'Webhook sent for single contact conversion: %', contact_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Webhook failed for single contact conversion: %', SQLERRM;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update bulk conversion function to send batch webhook
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
  webhook_url TEXT;
  webhook_data JSONB;
  all_contacts_data JSONB := '[]'::JSONB;
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
      
      -- Insert new contact with correctly mapped lead data and 'enriching' status
      INSERT INTO contacts (
        lead_id, 
        client_id, 
        first_name,
        last_name,
        full_name,
        email,
        secondary_email,
        phone,                    -- contacts field
        mobile_phone,             -- new field for leads.mobile_phone
        job_title,
        job_title_raw,
        linkedin_url,
        company,                  -- contacts field (use company_name from leads)
        company_name,             -- new field for exact mapping
        website,                  -- contacts field
        company_website,          -- new field for leads.company_website
        website_url,              -- contacts existing field
        company_linkedin_url,
        company_phone,
        company_size,
        company_size_text,
        company_summary,
        industry,
        city,
        province,
        country,
        employee_count,
        seniority,
        lead_source,
        email_type,
        email_valid,
        enrichment_status,
        enrichment_date,
        match_reasons,
        persona_ids,
        campaign_ids,
        best_campaign_match,
        product_match_percentage,
        personalized_icebreaker,
        unique_angles,
        is_active,
        scrape_failed,
        notes, 
        status,                   -- Set to 'enriching' status
        contact_date,
        created_at,
        updated_at
      )
      VALUES (
        current_lead_id,
        current_client_id,
        lead_data.first_name,
        lead_data.last_name,
        lead_data.full_name,
        lead_data.email,
        lead_data.secondary_email,
        lead_data.mobile_phone,        -- leads.mobile_phone → contacts.phone
        lead_data.mobile_phone,        -- also store in mobile_phone for completeness
        lead_data.job_title,
        lead_data.job_title_raw,
        lead_data.linkedin_url,
        lead_data.company_name,        -- leads.company_name → contacts.company
        lead_data.company_name,        -- also store in company_name
        lead_data.company_website,     -- leads.company_website → contacts.website
        lead_data.company_website,     -- also store in company_website
        lead_data.company_website,     -- also store in website_url
        lead_data.company_linkedin_url,
        lead_data.company_phone,
        lead_data.company_size,
        lead_data.company_size_text,
        lead_data.company_summary,
        lead_data.industry,
        lead_data.city,
        lead_data.province,
        lead_data.country,
        lead_data.employee_count,
        lead_data.seniority,
        lead_data.lead_source,
        lead_data.email_type,
        lead_data.email_valid,
        lead_data.enrichment_status,
        lead_data.enrichment_date,
        lead_data.match_reasons,
        lead_data.persona_ids,
        lead_data.campaign_ids,
        lead_data.best_campaign_match,
        lead_data.product_match_percentage,
        lead_data.personalized_icebreaker,
        lead_data.unique_angles,
        COALESCE(lead_data.is_active, true),
        COALESCE(lead_data.scrape_failed, false),
        notes,
        'enriching',                   -- Default status is now 'enriching'
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id INTO contact_id;
      
      -- Add to converted_contacts array
      converted_contacts := converted_contacts || jsonb_build_object(
        'lead_id', current_lead_id,
        'contact_id', contact_id,
        'status', 'enriching'
      );
      
      -- Collect contact data for batch webhook
      all_contacts_data := all_contacts_data || jsonb_build_object(
        'contact_id', contact_id,
        'lead_id', current_lead_id,
        'contact_data', (
          SELECT to_jsonb(c.*) 
          FROM contacts c 
          WHERE c.id = contact_id
        ),
        'lead_data', to_jsonb(lead_data)
      );
      
      -- Log the conversion in credit usage (with error handling)
      BEGIN
        INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
        VALUES (current_client_id, 'leads', 1, format('Bulk converted lead to contact with enriching status', current_lead_id), contact_id);
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
  
  -- Send batch webhook with all converted contacts
  IF success_count > 0 THEN
    BEGIN
      -- Get webhook URL from client settings
      SELECT webhook_url INTO webhook_url FROM clients WHERE id = current_client_id;
      
      IF webhook_url IS NOT NULL AND webhook_url != '' THEN
        -- Prepare batch webhook data
        webhook_data := jsonb_build_object(
          'event_type', 'contacts_batch_created',
          'client_id', current_client_id,
          'batch_size', success_count,
          'success_count', success_count,
          'failed_count', failed_count,
          'errors', errors,
          'contacts', all_contacts_data,
          'conversion_notes', notes,
          'timestamp', NOW(),
          'batch_id', gen_random_uuid()
        );
        
        -- Send batch webhook
        PERFORM net.http_post(
          url := webhook_url,
          body := webhook_data
        );
        
        RAISE NOTICE 'Batch webhook sent for % contacts', success_count;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Batch webhook failed: %', SQLERRM;
    END;
  END IF;
  
  RETURN QUERY SELECT success_count, failed_count, errors, converted_contacts;
END;
$$;
