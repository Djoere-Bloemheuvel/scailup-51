-- Remove individual webhooks from single contact conversion function
-- This ensures only batch webhooks are sent for performance control
-- Maintain Lovable compatibility

-- Update convert_lead_to_contact function to NOT send individual webhooks
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
  
  -- NO INDIVIDUAL WEBHOOK SENT - Only batch webhooks are used
  RAISE NOTICE 'Single contact conversion completed: %. No individual webhook sent - only batch webhooks are used.', contact_id;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
