
-- Update the get_filtered_leads function to accept country as an array
CREATE OR REPLACE FUNCTION get_filtered_leads(
  p_search text DEFAULT NULL,
  p_industry text[] DEFAULT NULL,
  p_job_titles text[] DEFAULT NULL,
  p_country text[] DEFAULT NULL,  -- Changed from text to text[]
  p_min_employees integer DEFAULT NULL,
  p_max_employees integer DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  company_name text,
  title text,
  industry text,
  country text,
  city text,
  company_linkedin text,
  company_website text,
  company_phone text,
  company_summary text,
  company_keywords text,
  linkedin_url text,
  mobile_phone text,
  full_name text,
  state text,
  seniority text,
  organization_technologies text,
  employee_count integer,
  status text,
  function_group text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_leads AS (
    SELECT 
      l.*,
      COUNT(*) OVER() as total_count
    FROM leads l
    WHERE
      -- Search filter
      (p_search IS NULL OR (
        l.first_name ILIKE '%' || p_search || '%' OR
        l.last_name ILIKE '%' || p_search || '%' OR
        l.company_name ILIKE '%' || p_search || '%' OR
        l.title ILIKE '%' || p_search || '%' OR
        l.email ILIKE '%' || p_search || '%'
      ))
      -- Industry filter
      AND (p_industry IS NULL OR l.industry = ANY(p_industry))
      -- Job titles filter
      AND (p_job_titles IS NULL OR EXISTS (
        SELECT 1 FROM unnest(p_job_titles) AS job_title
        WHERE l.title ILIKE '%' || job_title || '%'
      ))
      -- Country filter - now handles array
      AND (p_country IS NULL OR l.country = ANY(p_country))
      -- Employee count filters
      AND (p_min_employees IS NULL OR l.employee_count >= p_min_employees)
      AND (p_max_employees IS NULL OR l.employee_count <= p_max_employees)
    ORDER BY l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    fl.id,
    fl.first_name,
    fl.last_name,
    fl.email,
    fl.company_name,
    fl.title,
    fl.industry,
    fl.country,
    fl.city,
    fl.company_linkedin,
    fl.company_website,
    fl.company_phone,
    fl.company_summary,
    fl.company_keywords,
    fl.linkedin_url,
    fl.mobile_phone,
    fl.full_name,
    fl.state,
    fl.seniority,
    fl.organization_technologies,
    fl.employee_count,
    fl.status,
    fl.function_group,
    fl.created_at,
    fl.updated_at,
    fl.total_count
  FROM filtered_leads fl;
END;
$$;
