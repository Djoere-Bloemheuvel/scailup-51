
-- Add performance indexes for lead filtering
CREATE INDEX IF NOT EXISTS idx_leads_email_performance ON leads(email) WHERE email IS NOT NULL AND email != '';
CREATE INDEX IF NOT EXISTS idx_leads_company_name_performance ON leads(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_industry_performance ON leads(industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_country_performance ON leads(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at_performance ON leads(created_at DESC);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_leads_filtering_composite ON leads(email, industry, country, employee_count) 
WHERE email IS NOT NULL AND email != '';

-- Index for job title filtering (case insensitive)
CREATE INDEX IF NOT EXISTS idx_leads_job_title_trgm ON leads USING gin(lower(job_title) gin_trgm_ops) 
WHERE job_title IS NOT NULL;

-- Index for tags filtering (JSON operations)
CREATE INDEX IF NOT EXISTS idx_leads_tags_gin_performance ON leads USING gin(tags) WHERE tags IS NOT NULL;

-- Optimize contacts lookup for lead status determination
CREATE INDEX IF NOT EXISTS idx_contacts_lead_client_performance ON contacts(lead_id, client_id);

-- Create materialized view for lead status counts (for better performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_lead_status_counts AS
SELECT 
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') AS total_leads,
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '' 
    AND NOT EXISTS (SELECT 1 FROM contacts c WHERE c.lead_id = leads.id)) AS new_leads,
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '' 
    AND EXISTS (SELECT 1 FROM contacts c WHERE c.lead_id = leads.id)) AS contact_leads
FROM leads;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_lead_status_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_lead_status_counts;
END;
$$;

-- Create optimized function for lead filtering with better performance
CREATE OR REPLACE FUNCTION get_filtered_leads(
  p_search_term TEXT DEFAULT NULL,
  p_job_titles TEXT[] DEFAULT NULL,
  p_exclude_job_titles TEXT[] DEFAULT NULL,
  p_industries TEXT[] DEFAULT NULL,
  p_exclude_industries TEXT[] DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_company_sizes TEXT[] DEFAULT NULL,
  p_employee_min INTEGER DEFAULT NULL,
  p_employee_max INTEGER DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_exclude_tags TEXT[] DEFAULT NULL,
  p_lead_status TEXT DEFAULT 'new',
  p_client_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  lead_data jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contact_lead_ids UUID[];
  base_query TEXT;
  where_conditions TEXT[] := ARRAY[]::TEXT[];
  final_query TEXT;
  count_query TEXT;
  total_records BIGINT;
BEGIN
  -- Get contact lead IDs for the client
  IF p_client_id IS NOT NULL THEN
    SELECT ARRAY_AGG(lead_id) INTO contact_lead_ids
    FROM contacts 
    WHERE client_id = p_client_id AND lead_id IS NOT NULL;
  END IF;

  -- Build base WHERE conditions
  where_conditions := array_append(where_conditions, 'email IS NOT NULL AND email != ''''');

  -- Lead status filtering
  IF p_lead_status = 'new' AND contact_lead_ids IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      format('id != ALL(ARRAY[%s]::UUID[])', 
        array_to_string(contact_lead_ids, ',', 'NULL')));
  ELSIF p_lead_status = 'contacts' AND contact_lead_ids IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      format('id = ANY(ARRAY[%s]::UUID[])', 
        array_to_string(contact_lead_ids, ',', 'NULL')));
  END IF;

  -- Search term filtering
  IF p_search_term IS NOT NULL AND p_search_term != '' THEN
    where_conditions := array_append(where_conditions,
      format('(first_name ILIKE ''%%%s%%'' OR last_name ILIKE ''%%%s%%'' OR 
              company_name ILIKE ''%%%s%%'' OR job_title ILIKE ''%%%s%%'' OR 
              email ILIKE ''%%%s%%'')', 
              p_search_term, p_search_term, p_search_term, p_search_term, p_search_term));
  END IF;

  -- Job titles filtering
  IF p_job_titles IS NOT NULL AND array_length(p_job_titles, 1) > 0 THEN
    where_conditions := array_append(where_conditions,
      format('job_title ILIKE ANY(ARRAY[%s])', 
        array_to_string(ARRAY(SELECT '''%' || unnest(p_job_titles) || '%'''), ',')));
  END IF;

  -- Industry filtering
  IF p_industries IS NOT NULL AND array_length(p_industries, 1) > 0 THEN
    where_conditions := array_append(where_conditions,
      format('industry = ANY(ARRAY[%s])', 
        array_to_string(ARRAY(SELECT '''' || unnest(p_industries) || ''''), ',')));
  END IF;

  -- Country filtering
  IF p_country IS NOT NULL AND p_country != '' THEN
    where_conditions := array_append(where_conditions,
      format('country = ''%s''', p_country));
  END IF;

  -- Employee count filtering
  IF p_employee_min IS NOT NULL THEN
    where_conditions := array_append(where_conditions,
      format('(employee_count >= %s OR employee_count IS NULL)', p_employee_min));
  END IF;

  IF p_employee_max IS NOT NULL THEN
    where_conditions := array_append(where_conditions,
      format('employee_count <= %s', p_employee_max));
  END IF;

  -- Build final query
  base_query := 'FROM leads';
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;

  -- Get total count
  count_query := 'SELECT COUNT(*) ' || base_query;
  EXECUTE count_query INTO total_records;

  -- Get paginated results
  final_query := format(
    'SELECT to_jsonb(leads.*) %s ORDER BY created_at DESC LIMIT %s OFFSET %s',
    base_query, p_limit, p_offset
  );

  RETURN QUERY EXECUTE format(
    'SELECT lead_row.to_jsonb, %s::bigint FROM (%s) as lead_row',
    total_records, final_query
  );
END;
$$;
