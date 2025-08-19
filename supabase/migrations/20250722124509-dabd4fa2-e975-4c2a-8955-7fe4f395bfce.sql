
-- Update tags column to match organization_technologies type
-- Change from TEXT[] to TEXT (single text field like organization_technologies)

ALTER TABLE public.leads 
ALTER COLUMN tags SET DATA TYPE TEXT USING CASE 
  WHEN tags IS NULL OR array_length(tags, 1) IS NULL THEN NULL
  WHEN array_length(tags, 1) = 1 THEN tags[1]
  ELSE array_to_string(tags, ', ')
END;

-- Update the default value to match organization_technologies
ALTER TABLE public.leads 
ALTER COLUMN tags SET DEFAULT NULL;

-- Update any functions that might be using tags as an array
-- First, let's update the get_unique_tags function to work with text instead of array
CREATE OR REPLACE FUNCTION public.get_unique_tags()
RETURNS TABLE(tag text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT TRIM(unnest(string_to_array(l.tags, ','))) as tag
  FROM public.leads l
  WHERE l.tags IS NOT NULL 
    AND l.tags != ''
    AND l.email IS NOT NULL 
    AND l.email != ''
  ORDER BY tag;
$$;

-- Update the upsert_lead_with_enrichment function to handle tags as text
CREATE OR REPLACE FUNCTION public.upsert_lead_with_enrichment(
  p_email text, 
  p_first_name text DEFAULT NULL::text, 
  p_last_name text DEFAULT NULL::text, 
  p_job_title text DEFAULT NULL::text, 
  p_company_name text DEFAULT NULL::text, 
  p_company_website text DEFAULT NULL::text, 
  p_phone text DEFAULT NULL::text, 
  p_linkedin_url text DEFAULT NULL::text, 
  p_industry text DEFAULT NULL::text, 
  p_country text DEFAULT NULL::text, 
  p_region text DEFAULT NULL::text, 
  p_city text DEFAULT NULL::text, 
  p_employee_count integer DEFAULT NULL::integer, 
  p_employee_number integer DEFAULT NULL::integer, 
  p_company_size text DEFAULT NULL::text, 
  p_tags text DEFAULT NULL::text,  -- Changed from text[] to text
  p_technologies text[] DEFAULT NULL::text[], 
  p_company_tags text[] DEFAULT NULL::text[], 
  p_source text DEFAULT 'n8n'::text, 
  p_notes text DEFAULT NULL::text, 
  p_seniority text DEFAULT NULL::text, 
  p_organization_technologies text DEFAULT NULL::text, 
  p_client_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(lead_id uuid, action_taken text, updated_fields text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_lead RECORD;
  v_lead_id UUID;
  v_updated_fields TEXT[] := ARRAY[]::TEXT[];
  v_action TEXT;
BEGIN
  -- Email is required - reject if missing
  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required for lead enrichment';
  END IF;

  -- Normalize email to lowercase for consistency
  p_email := LOWER(TRIM(p_email));
  
  -- Check if lead with this email already exists (globally, not per client)
  SELECT * INTO v_existing_lead
  FROM leads 
  WHERE email = p_email 
    AND (is_duplicate IS NULL OR is_duplicate = false)
  LIMIT 1;
  
  IF FOUND THEN
    -- Lead exists, update only empty fields
    v_lead_id := v_existing_lead.id;
    v_action := 'updated';
    
    -- Update fields only if they are currently empty
    UPDATE leads SET
      first_name = CASE WHEN (first_name IS NULL OR first_name = '') AND p_first_name IS NOT NULL THEN p_first_name ELSE first_name END,
      last_name = CASE WHEN (last_name IS NULL OR last_name = '') AND p_last_name IS NOT NULL THEN p_last_name ELSE last_name END,
      job_title = CASE WHEN (job_title IS NULL OR job_title = '') AND p_job_title IS NOT NULL THEN p_job_title ELSE job_title END,
      company_name = CASE WHEN (company_name IS NULL OR company_name = '') AND p_company_name IS NOT NULL THEN p_company_name ELSE company_name END,
      company_website = CASE WHEN (company_website IS NULL OR company_website = '') AND p_company_website IS NOT NULL THEN p_company_website ELSE company_website END,
      phone = CASE WHEN (phone IS NULL OR phone = '') AND p_phone IS NOT NULL THEN p_phone ELSE phone END,
      linkedin_url = CASE WHEN (linkedin_url IS NULL OR linkedin_url = '') AND p_linkedin_url IS NOT NULL THEN p_linkedin_url ELSE linkedin_url END,
      industry = CASE WHEN (industry IS NULL OR industry = '') AND p_industry IS NOT NULL THEN p_industry ELSE industry END,
      country = CASE WHEN (country IS NULL OR country = '') AND p_country IS NOT NULL THEN p_country ELSE country END,
      region = CASE WHEN (region IS NULL OR region = '') AND p_region IS NOT NULL THEN p_region ELSE region END,
      city = CASE WHEN (city IS NULL OR city = '') AND p_city IS NOT NULL THEN p_city ELSE city END,
      employee_count = CASE WHEN employee_count IS NULL AND p_employee_count IS NOT NULL THEN p_employee_count ELSE employee_count END,
      employee_number = CASE WHEN employee_number IS NULL AND p_employee_number IS NOT NULL THEN p_employee_number ELSE employee_number END,
      company_size_text = CASE WHEN (company_size_text IS NULL OR company_size_text = '') AND p_company_size IS NOT NULL THEN p_company_size ELSE company_size_text END,
      seniority = CASE WHEN (seniority IS NULL OR seniority = '') AND p_seniority IS NOT NULL THEN p_seniority ELSE seniority END,
      organization_technologies = CASE WHEN (organization_technologies IS NULL OR organization_technologies = '') AND p_organization_technologies IS NOT NULL THEN p_organization_technologies ELSE organization_technologies END,
      notes = CASE WHEN (notes IS NULL OR notes = '') AND p_notes IS NOT NULL THEN p_notes ELSE notes END,
      tags = CASE WHEN (tags IS NULL OR tags = '') AND p_tags IS NOT NULL THEN p_tags ELSE tags END,  -- Now text field
      technologies = CASE WHEN (technologies IS NULL OR array_length(technologies, 1) IS NULL) AND p_technologies IS NOT NULL THEN p_technologies ELSE technologies END,
      company_tags = CASE WHEN (company_tags IS NULL OR array_length(company_tags, 1) IS NULL) AND p_company_tags IS NOT NULL THEN p_company_tags ELSE company_tags END,
      updated_at = NOW(),
      source = p_source
    WHERE id = v_lead_id;
    
    -- Build updated fields array for reporting
    IF p_first_name IS NOT NULL AND (v_existing_lead.first_name IS NULL OR v_existing_lead.first_name = '') THEN
      v_updated_fields := array_append(v_updated_fields, 'first_name');
    END IF;
    IF p_last_name IS NOT NULL AND (v_existing_lead.last_name IS NULL OR v_existing_lead.last_name = '') THEN
      v_updated_fields := array_append(v_updated_fields, 'last_name');
    END IF;
    IF p_job_title IS NOT NULL AND (v_existing_lead.job_title IS NULL OR v_existing_lead.job_title = '') THEN
      v_updated_fields := array_append(v_updated_fields, 'job_title');
    END IF;
    IF p_company_name IS NOT NULL AND (v_existing_lead.company_name IS NULL OR v_existing_lead.company_name = '') THEN
      v_updated_fields := array_append(v_updated_fields, 'company_name');
    END IF;
    
    IF array_length(v_updated_fields, 1) IS NULL THEN
      v_action := 'no_changes';
    END IF;
    
  ELSE
    -- Lead doesn't exist, create new one
    INSERT INTO leads (
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
      tags,  -- Now text field
      technologies,
      company_tags,
      source,
      notes,
      seniority,
      organization_technologies,
      enrichment_status,
      contact_status
    ) VALUES (
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
      p_tags,  -- Now text field
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
$$;
