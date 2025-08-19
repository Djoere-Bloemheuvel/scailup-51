
-- Ensure contacts table has ALL columns from leads table for complete data transfer
-- This migration adds any missing columns from leads to contacts

-- Add ALL missing columns from leads table to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS management_level TEXT,
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS buying_intent_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS in_active_campaign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_ids UUID[],
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS employee_number INTEGER,
ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_size_text TEXT,
ADD COLUMN IF NOT EXISTS tags_normalized TEXT[],
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS company_summary TEXT,
ADD COLUMN IF NOT EXISTS match_reasons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unique_angles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_campaign_match TEXT,
ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'converted',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS company_linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS seniority TEXT,
ADD COLUMN IF NOT EXISTS organization_technologies TEXT,
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS job_title_raw TEXT;

-- Update the convert_lead_to_contact function to copy ALL fields
CREATE OR REPLACE FUNCTION convert_lead_to_contact(
  input_lead_id UUID, 
  input_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  current_client_id UUID;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  lead_data RECORD;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
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
  
  -- Get complete lead data for copying ALL fields
  SELECT * INTO lead_data FROM leads WHERE id = input_lead_id;
  
  -- Insert new contact with ALL lead data copied
  INSERT INTO contacts (
    lead_id,
    client_id,
    user_id,
    first_name,
    last_name,
    job_title,
    job_title_raw,
    company,
    company_name,
    email,
    phone,
    linkedin_url,
    industry,
    country,
    region,
    city,
    company_size,
    company_size_text,
    management_level,
    lead_score,
    buying_intent_score,
    tags,
    technologies,
    company_tags,
    tags_normalized,
    last_contacted,
    in_active_campaign,
    campaign_ids,
    employee_count,
    employee_number,
    is_duplicate,
    product_match_percentage,
    company_website,
    enrichment_status,
    contact_status,
    email_status,
    company_summary,
    match_reasons,
    unique_angles,
    best_campaign_match,
    personalized_icebreaker,
    source,
    full_name,
    province,
    company_linkedin_url,
    seniority,
    organization_technologies,
    notes,
    status,
    contact_date,
    created_at,
    updated_at
  )
  VALUES (
    input_lead_id,
    current_client_id,
    lead_data.user_id,
    lead_data.first_name,
    lead_data.last_name,
    lead_data.job_title,
    lead_data.job_title_raw,
    COALESCE(lead_data.company, lead_data.company_name),
    lead_data.company_name,
    lead_data.email,
    lead_data.phone,
    lead_data.linkedin_url,
    lead_data.industry,
    lead_data.country,
    lead_data.region,
    lead_data.city,
    lead_data.company_size,
    lead_data.company_size_text,
    lead_data.management_level,
    COALESCE(lead_data.lead_score, 0),
    COALESCE(lead_data.buying_intent_score, 0),
    COALESCE(lead_data.tags, ARRAY[]::TEXT[]),
    COALESCE(lead_data.technologies, ARRAY[]::TEXT[]),
    COALESCE(lead_data.company_tags, ARRAY[]::TEXT[]),
    lead_data.tags_normalized,
    lead_data.last_contacted,
    COALESCE(lead_data.in_active_campaign, false),
    lead_data.campaign_ids,
    lead_data.employee_count,
    lead_data.employee_number,
    COALESCE(lead_data.is_duplicate, false),
    COALESCE(lead_data.product_match_percentage, 0),
    lead_data.company_website,
    COALESCE(lead_data.enrichment_status, 'pending'),
    COALESCE(lead_data.contact_status, 'new'),
    COALESCE(lead_data.email_status, 'unknown'),
    lead_data.company_summary,
    COALESCE(lead_data.match_reasons, ARRAY[]::TEXT[]),
    COALESCE(lead_data.unique_angles, ARRAY[]::TEXT[]),
    lead_data.best_campaign_match,
    lead_data.personalized_icebreaker,
    COALESCE(lead_data.source, 'converted'),
    lead_data.full_name,
    lead_data.province,
    lead_data.company_linkedin_url,
    lead_data.seniority,
    lead_data.organization_technologies,
    COALESCE(input_notes, lead_data.notes, 'Converted from lead'),
    'active',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO contact_id;
  
  -- Log the conversion
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (current_client_id, 'leads', 1, 'Converted lead to contact with complete data copy', contact_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- Continue if credit logging fails
      NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update bulk conversion function to copy ALL fields
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[],
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(lead_id UUID, success BOOLEAN, contact_id UUID, error_message TEXT) AS $$
DECLARE
  current_lead_id UUID;
  current_contact_id UUID;
  current_client_id UUID;
  lead_data RECORD;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Process each lead
  FOREACH current_lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists
      IF NOT EXISTS (SELECT 1 FROM leads WHERE id = current_lead_id) THEN
        RETURN QUERY SELECT current_lead_id, false, NULL::UUID, 'Lead not found';
        CONTINUE;
      END IF;
      
      -- Check if contact already exists
      IF EXISTS (SELECT 1 FROM contacts WHERE lead_id = current_lead_id AND client_id = current_client_id) THEN
        RETURN QUERY SELECT current_lead_id, false, NULL::UUID, 'Contact already exists for this lead';
        CONTINUE;
      END IF;
      
      -- Get complete lead data
      SELECT * INTO lead_data FROM leads WHERE id = current_lead_id;
      
      -- Insert new contact with ALL lead data copied
      INSERT INTO contacts (
        lead_id,
        client_id,
        user_id,
        first_name,
        last_name,
        job_title,
        job_title_raw,
        company,
        company_name,
        email,
        phone,
        linkedin_url,
        industry,
        country,
        region,
        city,
        company_size,
        company_size_text,
        management_level,
        lead_score,
        buying_intent_score,
        tags,
        technologies,
        company_tags,
        tags_normalized,
        last_contacted,
        in_active_campaign,
        campaign_ids,
        employee_count,
        employee_number,
        is_duplicate,
        product_match_percentage,
        company_website,
        enrichment_status,
        contact_status,
        email_status,
        company_summary,
        match_reasons,
        unique_angles,
        best_campaign_match,
        personalized_icebreaker,
        source,
        full_name,
        province,
        company_linkedin_url,
        seniority,
        organization_technologies,
        notes,
        status,
        contact_date,
        created_at,
        updated_at
      )
      VALUES (
        current_lead_id,
        current_client_id,
        lead_data.user_id,
        lead_data.first_name,
        lead_data.last_name,
        lead_data.job_title,
        lead_data.job_title_raw,
        COALESCE(lead_data.company, lead_data.company_name),
        lead_data.company_name,
        lead_data.email,
        lead_data.phone,
        lead_data.linkedin_url,
        lead_data.industry,
        lead_data.country,
        lead_data.region,
        lead_data.city,
        lead_data.company_size,
        lead_data.company_size_text,
        lead_data.management_level,
        COALESCE(lead_data.lead_score, 0),
        COALESCE(lead_data.buying_intent_score, 0),
        COALESCE(lead_data.tags, ARRAY[]::TEXT[]),
        COALESCE(lead_data.technologies, ARRAY[]::TEXT[]),
        COALESCE(lead_data.company_tags, ARRAY[]::TEXT[]),
        lead_data.tags_normalized,
        lead_data.last_contacted,
        COALESCE(lead_data.in_active_campaign, false),
        lead_data.campaign_ids,
        lead_data.employee_count,
        lead_data.employee_number,
        COALESCE(lead_data.is_duplicate, false),
        COALESCE(lead_data.product_match_percentage, 0),
        lead_data.company_website,
        COALESCE(lead_data.enrichment_status, 'pending'),
        COALESCE(lead_data.contact_status, 'new'),
        COALESCE(lead_data.email_status, 'unknown'),
        lead_data.company_summary,
        COALESCE(lead_data.match_reasons, ARRAY[]::TEXT[]),
        COALESCE(lead_data.unique_angles, ARRAY[]::TEXT[]),
        lead_data.best_campaign_match,
        lead_data.personalized_icebreaker,
        COALESCE(lead_data.source, 'converted'),
        lead_data.full_name,
        lead_data.province,
        lead_data.company_linkedin_url,
        lead_data.seniority,
        lead_data.organization_technologies,
        COALESCE(notes, lead_data.notes, 'Bulk converted from lead'),
        'active',
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id INTO current_contact_id;
      
      RETURN QUERY SELECT current_lead_id, true, current_contact_id, NULL::TEXT;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT current_lead_id, false, NULL::UUID, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) TO authenticated;
