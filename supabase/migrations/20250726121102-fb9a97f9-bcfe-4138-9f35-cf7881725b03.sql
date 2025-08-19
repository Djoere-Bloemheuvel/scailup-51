
-- Create the get_filtered_leads function that was missing
CREATE OR REPLACE FUNCTION public.get_filtered_leads(
  p_search text DEFAULT NULL,
  p_industry text[] DEFAULT NULL,
  p_job_titles text[] DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_min_employees integer DEFAULT NULL,
  p_max_employees integer DEFAULT NULL,
  p_limit integer DEFAULT 25,
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_count bigint
) LANGUAGE plpgsql
AS $$
DECLARE
  base_query text;
  where_conditions text[] := ARRAY[]::text[];
  final_query text;
BEGIN
  -- Build the base query with total count
  base_query := '
    SELECT 
      l.*,
      COUNT(*) OVER() as total_count
    FROM leads l
  ';
  
  -- Add search condition
  IF p_search IS NOT NULL AND p_search != '' THEN
    where_conditions := where_conditions || format('(
      LOWER(l.first_name) LIKE LOWER(''%%%s%%'') OR
      LOWER(l.last_name) LIKE LOWER(''%%%s%%'') OR
      LOWER(l.email) LIKE LOWER(''%%%s%%'') OR
      LOWER(l.company_name) LIKE LOWER(''%%%s%%'') OR
      LOWER(l.title) LIKE LOWER(''%%%s%%'')
    )', p_search, p_search, p_search, p_search, p_search);
  END IF;
  
  -- Add industry filter
  IF p_industry IS NOT NULL AND array_length(p_industry, 1) > 0 THEN
    where_conditions := where_conditions || format('LOWER(l.industry) = ANY(ARRAY[%s])',
      array_to_string(
        ARRAY(SELECT format('''%s''', LOWER(unnest(p_industry)))),
        ','
      )
    );
  END IF;
  
  -- Add job titles filter
  IF p_job_titles IS NOT NULL AND array_length(p_job_titles, 1) > 0 THEN
    where_conditions := where_conditions || format('LOWER(l.title) = ANY(ARRAY[%s])',
      array_to_string(
        ARRAY(SELECT format('''%s''', LOWER(unnest(p_job_titles)))),
        ','
      )
    );
  END IF;
  
  -- Add country filter
  IF p_country IS NOT NULL AND p_country != '' THEN
    where_conditions := where_conditions || format('LOWER(l.country) = LOWER(''%s'')', p_country);
  END IF;
  
  -- Add employee count filters
  IF p_min_employees IS NOT NULL THEN
    where_conditions := where_conditions || format('l.employee_count >= %s', p_min_employees);
  END IF;
  
  IF p_max_employees IS NOT NULL THEN
    where_conditions := where_conditions || format('l.employee_count <= %s', p_max_employees);
  END IF;
  
  -- Build final query
  final_query := base_query;
  
  IF array_length(where_conditions, 1) > 0 THEN
    final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;
  
  final_query := final_query || format(' ORDER BY l.created_at DESC LIMIT %s OFFSET %s', p_limit, p_offset);
  
  -- Execute and return
  RETURN QUERY EXECUTE final_query;
END;
$$;
