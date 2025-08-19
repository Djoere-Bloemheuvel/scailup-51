-- Bulk Lead Conversion Migration
-- This migration adds robust bulk lead conversion functionality
-- Compatible with Lovable deployment

-- 1. Create bulk convert leads to contacts function
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[],
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success_count INTEGER,
  failed_count INTEGER,
  errors TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  lead_id UUID;
  success_count INTEGER := 0;
  failed_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
  error_msg TEXT;
  contact_id UUID;
  credit_check BOOLEAN;
BEGIN
  -- Get current user's client_id
  SELECT client_id INTO current_client_id
  FROM users
  WHERE id = auth.uid();
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;

  -- Check if user has enough credits for all conversions
  SELECT check_and_use_credits('leads', array_length(lead_ids, 1), 'Bulk convert leads to contacts') INTO credit_check;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits for bulk conversion';
  END IF;

  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and belongs to user's client
      IF NOT EXISTS (
        SELECT 1 FROM leads 
        WHERE id = lead_id 
        AND client_id = current_client_id
      ) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s not found or access denied', lead_id));
        CONTINUE;
      END IF;

      -- Check if lead is already converted
      IF EXISTS (
        SELECT 1 FROM contacts 
        WHERE lead_id = lead_id 
        AND client_id = current_client_id
      ) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s is already converted to contact', lead_id));
        CONTINUE;
      END IF;

      -- Convert lead to contact
      INSERT INTO contacts (
        client_id,
        lead_id,
        first_name,
        last_name,
        email,
        job_title,
        company_name,
        industry,
        country,
        employee_count,
        company_website,
        tags,
        notes,
        status,
        created_at,
        updated_at
      )
      SELECT 
        current_client_id,
        l.id,
        l.first_name,
        l.last_name,
        l.email,
        l.job_title,
        l.company_name,
        l.industry,
        l.country,
        l.employee_count,
        l.company_website,
        l.tags,
        COALESCE(notes, 'Bulk converted from lead'),
        'active',
        NOW(),
        NOW()
      FROM leads l
      WHERE l.id = lead_id
      AND l.client_id = current_client_id
      RETURNING id INTO contact_id;

      -- Add activity record
      INSERT INTO contact_activities (
        contact_id,
        client_id,
        activity_type,
        description,
        created_at
      )
      VALUES (
        contact_id,
        current_client_id,
        'conversion',
        'Converted from lead via bulk operation',
        NOW()
      );

      success_count := success_count + 1;

    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      error_msg := format('Lead %s: %s', lead_id, SQLERRM);
      errors := array_append(errors, error_msg);
    END;
  END LOOP;

  -- Return results
  RETURN QUERY SELECT success_count, failed_count, errors;
END;
$$;

-- 2. Create function to get leads by filter criteria for bulk conversion
CREATE OR REPLACE FUNCTION get_leads_for_bulk_conversion(
  search_term TEXT DEFAULT NULL,
  job_titles TEXT[] DEFAULT NULL,
  exclude_job_titles TEXT[] DEFAULT NULL,
  industries TEXT[] DEFAULT NULL,
  exclude_industries TEXT[] DEFAULT NULL,
  country TEXT DEFAULT NULL,
  company_size TEXT[] DEFAULT NULL,
  seniority TEXT DEFAULT NULL,
  employee_number_min INTEGER DEFAULT NULL,
  employee_number_max INTEGER DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  exclude_tags TEXT[] DEFAULT NULL,
  lists TEXT[] DEFAULT NULL,
  exclude_lists TEXT[] DEFAULT NULL,
  lead_status TEXT DEFAULT 'all'
)
RETURNS TABLE(
  lead_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  job_title TEXT,
  company_name TEXT,
  industry TEXT,
  country TEXT,
  employee_count INTEGER,
  tags JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  query_text TEXT;
  where_conditions TEXT[] := ARRAY[]::TEXT[];
  param_count INTEGER := 0;
BEGIN
  -- Get current user's client_id
  SELECT client_id INTO current_client_id
  FROM users
  WHERE id = auth.uid();
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;

  -- Base query
  query_text := 'SELECT 
    l.id as lead_id,
    l.first_name,
    l.last_name,
    l.email,
    l.job_title,
    l.company_name,
    l.industry,
    l.country,
    l.employee_count,
    l.tags
  FROM leads l
  WHERE l.client_id = $1';

  param_count := 1;

  -- Add search term condition
  IF search_term IS NOT NULL AND search_term != '' THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('(
      l.first_name ILIKE $%d OR 
      l.last_name ILIKE $%d OR 
      l.email ILIKE $%d OR 
      l.job_title ILIKE $%d OR 
      l.company_name ILIKE $%d OR 
      l.industry ILIKE $%d
    )', param_count, param_count, param_count, param_count, param_count, param_count));
  END IF;

  -- Add job titles condition
  IF job_titles IS NOT NULL AND array_length(job_titles, 1) > 0 THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.job_title = ANY($%d)', param_count));
  END IF;

  -- Add exclude job titles condition
  IF exclude_job_titles IS NOT NULL AND array_length(exclude_job_titles, 1) > 0 THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.job_title != ALL($%d)', param_count));
  END IF;

  -- Add industries condition
  IF industries IS NOT NULL AND array_length(industries, 1) > 0 THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.industry = ANY($%d)', param_count));
  END IF;

  -- Add exclude industries condition
  IF exclude_industries IS NOT NULL AND array_length(exclude_industries, 1) > 0 THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.industry != ALL($%d)', param_count));
  END IF;

  -- Add country condition
  IF country IS NOT NULL AND country != '' THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.country = $%d', param_count));
  END IF;

  -- Add employee count range condition
  IF employee_number_min IS NOT NULL OR employee_number_max IS NOT NULL THEN
    IF employee_number_min IS NOT NULL THEN
      param_count := param_count + 1;
      where_conditions := array_append(where_conditions, format('l.employee_count >= $%d', param_count));
    END IF;
    IF employee_number_max IS NOT NULL THEN
      param_count := param_count + 1;
      where_conditions := array_append(where_conditions, format('l.employee_count <= $%d', param_count));
    END IF;
  END IF;

  -- Add tags condition
  IF tags IS NOT NULL AND array_length(tags, 1) > 0 THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.tags ?| $%d', param_count));
  END IF;

  -- Add exclude tags condition
  IF exclude_tags IS NOT NULL AND array_length(exclude_tags, 1) > 0 THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('NOT (l.tags ?| $%d)', param_count));
  END IF;

  -- Add lead status condition
  IF lead_status IS NOT NULL AND lead_status != 'all' THEN
    param_count := param_count + 1;
    where_conditions := array_append(where_conditions, format('l.status = $%d', param_count));
  END IF;

  -- Combine where conditions
  IF array_length(where_conditions, 1) > 0 THEN
    query_text := query_text || ' AND ' || array_to_string(where_conditions, ' AND ');
  END IF;

  -- Add order by
  query_text := query_text || ' ORDER BY l.created_at DESC';

  -- Execute dynamic query
  RETURN QUERY EXECUTE query_text 
  USING current_client_id, search_term, job_titles, exclude_job_titles, industries, 
        exclude_industries, country, employee_number_min, employee_number_max, 
        tags, exclude_tags, lead_status;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leads_for_bulk_conversion(TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT, TEXT[], TEXT, INTEGER, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) TO authenticated;

-- 4. Add RLS policies for the new functions
CREATE POLICY "Users can bulk convert their own leads" ON leads
  FOR ALL USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- 5. Create index for better performance on bulk operations
CREATE INDEX IF NOT EXISTS idx_leads_bulk_conversion 
ON leads (client_id, status, created_at DESC)
WHERE client_id IS NOT NULL;

-- 6. Add comment for documentation
COMMENT ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) IS 
'Bulk convert multiple leads to contacts with credit system integration and error handling';

COMMENT ON FUNCTION get_leads_for_bulk_conversion(TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT, TEXT[], TEXT, INTEGER, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) IS 
'Get leads matching filter criteria for bulk conversion operations'; 