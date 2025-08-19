
-- First, let's check if the available_leads_secure view exists and recreate it with proper logic
DROP VIEW IF EXISTS public.available_leads_secure;

-- Create the available_leads_secure view that shows leads not yet converted to contacts by the current client
CREATE VIEW public.available_leads_secure 
WITH (security_invoker = true) AS
SELECT 
  l.id,
  l.first_name,
  l.last_name,
  l.email,
  l.company_name,
  l.title,
  l.industry,
  l.country,
  l.city,
  l.state,
  l.company_linkedin,
  l.company_website,
  l.company_phone,
  l.company_summary,
  l.company_keywords,
  l.linkedin_url,
  l.mobile_phone,
  l.full_name,
  l.seniority,
  l.organization_technologies,
  l.employee_count,
  l.status,
  l.function_group,
  l.created_at,
  l.updated_at
FROM public.leads l
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.contacts c
  WHERE c.lead_id = l.id 
    AND c.client_id = get_current_user_client_id_safe()
)
AND get_current_user_client_id_safe() IS NOT NULL;

-- Ensure RLS is enabled on the view
ALTER VIEW public.available_leads_secure ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
DROP POLICY IF EXISTS "Users can view available leads for their client" ON public.available_leads_secure;
CREATE POLICY "Users can view available leads for their client" 
ON public.available_leads_secure 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id IS NOT NULL
  )
);

-- Update the get_filtered_leads function to work with the secure view
CREATE OR REPLACE FUNCTION public.get_filtered_leads(
  p_search text DEFAULT NULL::text, 
  p_industry text[] DEFAULT NULL::text[], 
  p_job_titles text[] DEFAULT NULL::text[], 
  p_country text[] DEFAULT NULL::text[], 
  p_function_group text[] DEFAULT NULL::text[], 
  p_min_employees integer DEFAULT NULL::integer, 
  p_max_employees integer DEFAULT NULL::integer, 
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, first_name text, last_name text, email text, company_name text, title text,
  industry text, country text, city text, company_linkedin text, company_website text,
  company_phone text, company_summary text, company_keywords text, linkedin_url text,
  mobile_phone text, full_name text, state text, seniority text,
  organization_technologies text, employee_count integer, status text, function_group text,
  created_at timestamp with time zone, updated_at timestamp with time zone, total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if user has access
  IF get_current_user_client_id_safe() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH filtered_leads AS (
    SELECT 
      als.*,
      COUNT(*) OVER() as total_count
    FROM public.available_leads_secure als
    WHERE
      -- Search filter
      (p_search IS NULL OR (
        als.first_name ILIKE '%' || p_search || '%' OR
        als.last_name ILIKE '%' || p_search || '%' OR
        als.company_name ILIKE '%' || p_search || '%' OR
        als.title ILIKE '%' || p_search || '%' OR
        als.email ILIKE '%' || p_search || '%'
      ))
      -- Industry filter
      AND (p_industry IS NULL OR als.industry = ANY(p_industry))
      -- Job titles filter
      AND (p_job_titles IS NULL OR EXISTS (
        SELECT 1 FROM unnest(p_job_titles) AS job_title
        WHERE als.title ILIKE '%' || job_title || '%'
      ))
      -- Country filter - handles array
      AND (p_country IS NULL OR als.country = ANY(p_country))
      -- Function group filter
      AND (p_function_group IS NULL OR als.function_group = ANY(p_function_group))
      -- Employee count filters
      AND (p_min_employees IS NULL OR als.employee_count >= p_min_employees)
      AND (p_max_employees IS NULL OR als.employee_count <= p_max_employees)
    ORDER BY als.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    fl.id, fl.first_name, fl.last_name, fl.email, fl.company_name, fl.title,
    fl.industry, fl.country, fl.city, fl.company_linkedin, fl.company_website,
    fl.company_phone, fl.company_summary, fl.company_keywords, fl.linkedin_url,
    fl.mobile_phone, fl.full_name, fl.state, fl.seniority,
    fl.organization_technologies, fl.employee_count, fl.status,
    fl.function_group, fl.created_at, fl.updated_at, fl.total_count
  FROM filtered_leads fl;
END;
$function$;

-- Ensure the contacts table has a proper index for performance
CREATE INDEX IF NOT EXISTS contacts_lead_id_client_id_idx ON public.contacts(lead_id, client_id);

-- Add missing contact_date column to contacts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'contact_date') THEN
        ALTER TABLE public.contacts ADD COLUMN contact_date date DEFAULT CURRENT_DATE;
    END IF;
END $$;
