
-- Create a function to handle lead deduplication and enrichment
CREATE OR REPLACE FUNCTION public.upsert_lead_with_enrichment(
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_company_website TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_linkedin_url TEXT DEFAULT NULL,
  p_industry TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_employee_count INTEGER DEFAULT NULL,
  p_employee_number INTEGER DEFAULT NULL,
  p_company_size TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_technologies TEXT[] DEFAULT NULL,
  p_company_tags TEXT[] DEFAULT NULL,
  p_source TEXT DEFAULT 'n8n',
  p_notes TEXT DEFAULT NULL,
  p_seniority TEXT DEFAULT NULL,
  p_organization_technologies TEXT DEFAULT NULL,
  p_client_id UUID DEFAULT NULL
)
RETURNS TABLE(lead_id UUID, action_taken TEXT, updated_fields TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_client_id UUID;
  v_existing_lead RECORD;
  v_lead_id UUID;
  v_updated_fields TEXT[] := ARRAY[]::TEXT[];
  v_action TEXT;
  update_query TEXT;
  update_parts TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get client ID if not provided
  IF p_client_id IS NULL THEN
    SELECT get_current_client_id() INTO v_client_id;
  ELSE
    v_client_id := p_client_id;
  END IF;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client ID not found';
  END IF;
  
  -- Normalize email to lowercase for consistency
  p_email := LOWER(TRIM(p_email));
  
  -- Check if lead with this email already exists for this client
  SELECT * INTO v_existing_lead
  FROM leads 
  WHERE email = p_email 
    AND client_id = v_client_id
    AND (is_duplicate IS NULL OR is_duplicate = false)
  LIMIT 1;
  
  IF FOUND THEN
    -- Lead exists, update only empty fields
    v_lead_id := v_existing_lead.id;
    v_action := 'updated';
    
    -- Build dynamic update query for non-empty fields
    IF p_first_name IS NOT NULL AND (v_existing_lead.first_name IS NULL OR v_existing_lead.first_name = '') THEN
      update_parts := array_append(update_parts, 'first_name = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'first_name');
    END IF;
    
    IF p_last_name IS NOT NULL AND (v_existing_lead.last_name IS NULL OR v_existing_lead.last_name = '') THEN
      update_parts := array_append(update_parts, 'last_name = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'last_name');
    END IF;
    
    IF p_job_title IS NOT NULL AND (v_existing_lead.job_title IS NULL OR v_existing_lead.job_title = '') THEN
      update_parts := array_append(update_parts, 'job_title = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'job_title');
    END IF;
    
    IF p_company_name IS NOT NULL AND (v_existing_lead.company_name IS NULL OR v_existing_lead.company_name = '') THEN
      update_parts := array_append(update_parts, 'company_name = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'company_name');
    END IF;
    
    IF p_company_website IS NOT NULL AND (v_existing_lead.company_website IS NULL OR v_existing_lead.company_website = '') THEN
      update_parts := array_append(update_parts, 'company_website = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'company_website');
    END IF;
    
    IF p_phone IS NOT NULL AND (v_existing_lead.phone IS NULL OR v_existing_lead.phone = '') THEN
      update_parts := array_append(update_parts, 'phone = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'phone');
    END IF;
    
    IF p_linkedin_url IS NOT NULL AND (v_existing_lead.linkedin_url IS NULL OR v_existing_lead.linkedin_url = '') THEN
      update_parts := array_append(update_parts, 'linkedin_url = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'linkedin_url');
    END IF;
    
    IF p_industry IS NOT NULL AND (v_existing_lead.industry IS NULL OR v_existing_lead.industry = '') THEN
      update_parts := array_append(update_parts, 'industry = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'industry');
    END IF;
    
    IF p_country IS NOT NULL AND (v_existing_lead.country IS NULL OR v_existing_lead.country = '') THEN
      update_parts := array_append(update_parts, 'country = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'country');
    END IF;
    
    IF p_region IS NOT NULL AND (v_existing_lead.region IS NULL OR v_existing_lead.region = '') THEN
      update_parts := array_append(update_parts, 'region = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'region');
    END IF;
    
    IF p_city IS NOT NULL AND (v_existing_lead.city IS NULL OR v_existing_lead.city = '') THEN
      update_parts := array_append(update_parts, 'city = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'city');
    END IF;
    
    IF p_employee_count IS NOT NULL AND v_existing_lead.employee_count IS NULL THEN
      update_parts := array_append(update_parts, 'employee_count = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'employee_count');
    END IF;
    
    IF p_employee_number IS NOT NULL AND v_existing_lead.employee_number IS NULL THEN
      update_parts := array_append(update_parts, 'employee_number = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'employee_number');
    END IF;
    
    IF p_company_size IS NOT NULL AND (v_existing_lead.company_size_text IS NULL OR v_existing_lead.company_size_text = '') THEN
      update_parts := array_append(update_parts, 'company_size_text = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'company_size_text');
    END IF;
    
    IF p_seniority IS NOT NULL AND (v_existing_lead.seniority IS NULL OR v_existing_lead.seniority = '') THEN
      update_parts := array_append(update_parts, 'seniority = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'seniority');
    END IF;
    
    IF p_organization_technologies IS NOT NULL AND (v_existing_lead.organization_technologies IS NULL OR v_existing_lead.organization_technologies = '') THEN
      update_parts := array_append(update_parts, 'organization_technologies = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'organization_technologies');
    END IF;
    
    IF p_notes IS NOT NULL AND (v_existing_lead.notes IS NULL OR v_existing_lead.notes = '') THEN
      update_parts := array_append(update_parts, 'notes = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'notes');
    END IF;
    
    -- Handle array fields
    IF p_tags IS NOT NULL AND (v_existing_lead.tags IS NULL OR array_length(v_existing_lead.tags, 1) IS NULL) THEN
      update_parts := array_append(update_parts, 'tags = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'tags');
    END IF;
    
    IF p_technologies IS NOT NULL AND (v_existing_lead.technologies IS NULL OR array_length(v_existing_lead.technologies, 1) IS NULL) THEN
      update_parts := array_append(update_parts, 'technologies = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'technologies');
    END IF;
    
    IF p_company_tags IS NOT NULL AND (v_existing_lead.company_tags IS NULL OR array_length(v_existing_lead.company_tags, 1) IS NULL) THEN
      update_parts := array_append(update_parts, 'company_tags = $' || (array_length(update_parts, 1) + 1));
      v_updated_fields := array_append(v_updated_fields, 'company_tags');
    END IF;
    
    -- Always update the updated_at timestamp and source if fields were updated
    IF array_length(update_parts, 1) > 0 THEN
      update_parts := array_append(update_parts, 'updated_at = NOW()');
      update_parts := array_append(update_parts, 'source = $' || (array_length(update_parts, 1)));
      
      -- Execute the update with only the fields that need updating
      EXECUTE 'UPDATE leads SET ' || array_to_string(update_parts, ', ') || 
              ' WHERE id = $' || (array_length(update_parts, 1) + 1)
      USING 
        CASE WHEN 'first_name' = ANY(v_updated_fields) THEN p_first_name END,
        CASE WHEN 'last_name' = ANY(v_updated_fields) THEN p_last_name END,
        CASE WHEN 'job_title' = ANY(v_updated_fields) THEN p_job_title END,
        CASE WHEN 'company_name' = ANY(v_updated_fields) THEN p_company_name END,
        CASE WHEN 'company_website' = ANY(v_updated_fields) THEN p_company_website END,
        CASE WHEN 'phone' = ANY(v_updated_fields) THEN p_phone END,
        CASE WHEN 'linkedin_url' = ANY(v_updated_fields) THEN p_linkedin_url END,
        CASE WHEN 'industry' = ANY(v_updated_fields) THEN p_industry END,
        CASE WHEN 'country' = ANY(v_updated_fields) THEN p_country END,
        CASE WHEN 'region' = ANY(v_updated_fields) THEN p_region END,
        CASE WHEN 'city' = ANY(v_updated_fields) THEN p_city END,
        CASE WHEN 'employee_count' = ANY(v_updated_fields) THEN p_employee_count END,
        CASE WHEN 'employee_number' = ANY(v_updated_fields) THEN p_employee_number END,
        CASE WHEN 'company_size_text' = ANY(v_updated_fields) THEN p_company_size END,
        CASE WHEN 'seniority' = ANY(v_updated_fields) THEN p_seniority END,
        CASE WHEN 'organization_technologies' = ANY(v_updated_fields) THEN p_organization_technologies END,
        CASE WHEN 'notes' = ANY(v_updated_fields) THEN p_notes END,
        CASE WHEN 'tags' = ANY(v_updated_fields) THEN p_tags END,
        CASE WHEN 'technologies' = ANY(v_updated_fields) THEN p_technologies END,
        CASE WHEN 'company_tags' = ANY(v_updated_fields) THEN p_company_tags END,
        p_source,
        v_lead_id;
    ELSE
      v_action := 'no_changes';
    END IF;
    
  ELSE
    -- Lead doesn't exist, create new one
    INSERT INTO leads (
      client_id,
      email,
      first_name,
      last_name,
      job_title,
      company_name,
      company_website,
      phone,
      linkedin_url,
      industry,
      country,
      region,
      city,
      employee_count,
      employee_number,
      company_size_text,
      tags,
      technologies,
      company_tags,
      source,
      notes,
      seniority,
      organization_technologies,
      enrichment_status,
      contact_status
    ) VALUES (
      v_client_id,
      p_email,
      p_first_name,
      p_last_name,
      p_job_title,
      p_company_name,
      p_company_website,
      p_phone,
      p_linkedin_url,
      p_industry,
      p_country,
      p_region,
      p_city,
      p_employee_count,
      p_employee_number,
      p_company_size,
      COALESCE(p_tags, ARRAY[]::TEXT[]),
      COALESCE(p_technologies, ARRAY[]::TEXT[]),
      COALESCE(p_company_tags, ARRAY[]::TEXT[]),
      p_source,
      p_notes,
      p_seniority,
      p_organization_technologies,
      'pending',
      'new'
    ) RETURNING id INTO v_lead_id;
    
    v_action := 'created';
    v_updated_fields := ARRAY['all_fields'];
  END IF;
  
  -- Return the result
  RETURN QUERY SELECT v_lead_id, v_action, v_updated_fields;
END;
$function$;

-- Create an index on email + client_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email_client_dedup 
ON leads(client_id, email) 
WHERE email IS NOT NULL AND email != '' AND (is_duplicate IS NULL OR is_duplicate = false);
