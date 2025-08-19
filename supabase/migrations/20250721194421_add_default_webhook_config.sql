-- Add webhook_configs table and default webhook configuration
-- This ensures webhooks work for both single and bulk conversions
-- Maintain Lovable compatibility

-- 1. Create webhook_configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL DEFAULT 'n8n',
  webhook_url TEXT NOT NULL,
  webhook_name TEXT NOT NULL DEFAULT 'Default Webhook',
  headers JSONB DEFAULT '{"Content-Type": "application/json"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, webhook_type)
);

-- 2. Add default webhook configuration for existing clients
INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers, created_at, updated_at)
SELECT 
  c.id as client_id,
  'n8n' as webhook_type,
  'https://your-n8n-webhook-url.com/webhook/contacts' as webhook_url,
  'Default n8n Webhook' as webhook_name,
  '{"Content-Type": "application/json"}' as headers,
  NOW() as created_at,
  NOW() as updated_at
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM webhook_configs wc 
  WHERE wc.client_id = c.id 
  AND wc.webhook_type = 'n8n'
);

-- 3. Restore webhook functionality for single contact conversion
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
  
  -- Send single contact webhook (for backward compatibility)
  BEGIN
    -- Get webhook URL from webhook_configs table
    SELECT wc.webhook_url INTO webhook_url 
    FROM webhook_configs wc 
    WHERE wc.client_id = current_client_id 
    AND wc.webhook_type = 'n8n'
    AND wc.is_active = true;
    
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
      
      RAISE NOTICE 'Single contact webhook sent: %', contact_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Single contact webhook failed: %', SQLERRM;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
