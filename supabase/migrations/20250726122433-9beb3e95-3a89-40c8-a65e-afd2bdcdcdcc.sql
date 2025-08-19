
-- Fix the get_filtered_leads function to return correct types matching the leads table schema
CREATE OR REPLACE FUNCTION public.get_filtered_leads(
  p_search text DEFAULT NULL::text, 
  p_industry text[] DEFAULT NULL::text[], 
  p_job_titles text[] DEFAULT NULL::text[], 
  p_country text DEFAULT NULL::text, 
  p_min_employees integer DEFAULT NULL::integer, 
  p_max_employees integer DEFAULT NULL::integer, 
  p_limit integer DEFAULT 25, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
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
  employee_count integer,  -- Fixed: Changed from text to integer to match leads table
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  total_count bigint
)
LANGUAGE plpgsql
AS $function$
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
  
  -- Add search condition with better performance using ILIKE
  IF p_search IS NOT NULL AND trim(p_search) != '' THEN
    where_conditions := where_conditions || format('(
      l.first_name ILIKE ''%%%s%%'' OR
      l.last_name ILIKE ''%%%s%%'' OR
      l.email ILIKE ''%%%s%%'' OR
      l.company_name ILIKE ''%%%s%%'' OR
      l.title ILIKE ''%%%s%%''
    )', p_search, p_search, p_search, p_search, p_search);
  END IF;
  
  -- Add industry filter with case-insensitive matching
  IF p_industry IS NOT NULL AND array_length(p_industry, 1) > 0 THEN
    where_conditions := where_conditions || format('l.industry ILIKE ANY(ARRAY[%s])',
      array_to_string(
        ARRAY(SELECT format('''%%%s%%''', unnest(p_industry))),
        ','
      )
    );
  END IF;
  
  -- Add job titles filter with case-insensitive matching
  IF p_job_titles IS NOT NULL AND array_length(p_job_titles, 1) > 0 THEN
    where_conditions := where_conditions || format('l.title ILIKE ANY(ARRAY[%s])',
      array_to_string(
        ARRAY(SELECT format('''%%%s%%''', unnest(p_job_titles))),
        ','
      )
    );
  END IF;
  
  -- Add country filter with case-insensitive matching
  IF p_country IS NOT NULL AND trim(p_country) != '' THEN
    where_conditions := where_conditions || format('l.country ILIKE ''%%%s%%''', p_country);
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
  
  -- Log the query for debugging
  RAISE LOG 'get_filtered_leads query: %', final_query;
  
  -- Execute and return
  RETURN QUERY EXECUTE final_query;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error for debugging
  RAISE LOG 'get_filtered_leads error: % - %', SQLSTATE, SQLERRM;
  RAISE;
END;
$function$;
