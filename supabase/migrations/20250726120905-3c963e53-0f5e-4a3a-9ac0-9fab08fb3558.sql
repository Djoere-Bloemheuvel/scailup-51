
-- Ensure the leads table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON public.leads(company_name);
CREATE INDEX IF NOT EXISTS idx_leads_title ON public.leads(title);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON public.leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_country ON public.leads(country);

-- Add a composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_leads_filters ON public.leads(industry, country, title) WHERE industry IS NOT NULL OR country IS NOT NULL OR title IS NOT NULL;

-- Ensure RLS policy allows all authenticated users to read leads (already exists but let's make sure)
DROP POLICY IF EXISTS "All authenticated users can view leads" ON public.leads;
CREATE POLICY "All authenticated users can view leads" 
  ON public.leads 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Add a function to get leads with proper pagination and filtering
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
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  full_name text,
  email text,
  title text,
  company_name text,
  industry text,
  country text,
  city text,
  state text,
  employee_count integer,
  mobile_phone text,
  linkedin_url text,
  company_website text,
  company_phone text,
  company_linkedin text,
  company_summary text,
  company_keywords text,
  organization_technologies text,
  seniority text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH filtered_leads AS (
    SELECT l.*,
           COUNT(*) OVER() as total_count
    FROM leads l
    WHERE (p_search IS NULL OR 
           l.first_name ILIKE '%' || p_search || '%' OR
           l.last_name ILIKE '%' || p_search || '%' OR
           l.full_name ILIKE '%' || p_search || '%' OR
           l.email ILIKE '%' || p_search || '%' OR
           l.company_name ILIKE '%' || p_search || '%' OR
           l.title ILIKE '%' || p_search || '%' OR
           l.industry ILIKE '%' || p_search || '%')
    AND (p_industry IS NULL OR l.industry = ANY(p_industry))
    AND (p_job_titles IS NULL OR EXISTS(
           SELECT 1 FROM unnest(p_job_titles) AS jt
           WHERE l.title ILIKE '%' || jt || '%'
         ))
    AND (p_country IS NULL OR l.country = p_country)
    AND (p_min_employees IS NULL OR l.employee_count >= p_min_employees)
    AND (p_max_employees IS NULL OR l.employee_count <= p_max_employees)
    ORDER BY l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_leads;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_filtered_leads TO authenticated;
