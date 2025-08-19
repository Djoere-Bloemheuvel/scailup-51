
-- First, let's check the current available_leads view and recreate it with proper client-specific filtering
DROP VIEW IF EXISTS available_leads;

-- Create a function-based view that properly handles client context
CREATE OR REPLACE FUNCTION get_available_leads_for_client()
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
  state text,
  company_linkedin text,
  company_website text,
  company_phone text,
  company_summary text,
  company_keywords text,
  linkedin_url text,
  mobile_phone text,
  full_name text,
  seniority text,
  organization_technologies text,
  employee_count integer,
  status text,
  function_group text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_client_id uuid;
BEGIN
  -- Get current client ID in a secure way
  current_client_id := get_current_user_client_id();
  
  -- Return leads that are NOT converted by the current client
  RETURN QUERY
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
  FROM leads l
  WHERE NOT EXISTS (
    SELECT 1 
    FROM contacts c 
    WHERE c.lead_id = l.id 
    AND c.client_id = current_client_id
  );
END;
$$;

-- Create the view using the function for proper security context
CREATE VIEW available_leads AS
SELECT * FROM get_available_leads_for_client();

-- Set proper ownership and permissions
ALTER VIEW available_leads OWNER TO postgres;
GRANT SELECT ON available_leads TO authenticated;

-- Ensure RLS is enabled on the view
ALTER VIEW available_leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view that allows authenticated users to see available leads
CREATE POLICY "Users can view available leads" ON available_leads
FOR SELECT TO authenticated
USING (true);

-- Update the get_current_user_client_id function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_id uuid;
BEGIN
  -- Get client ID for current authenticated user
  SELECT cu.client_id INTO client_id
  FROM client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
  
  RETURN client_id;
END;
$$;

-- Create a helper function to check if a lead is converted by ANY client (for debugging)
CREATE OR REPLACE FUNCTION public.is_lead_converted_globally(p_lead_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM contacts 
    WHERE lead_id = p_lead_id
  );
END;
$$;

-- Update is_lead_converted to work properly with client context
CREATE OR REPLACE FUNCTION public.is_lead_converted(p_lead_id uuid, p_client_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Use provided client_id or get current user's client_id
  v_client_id := COALESCE(p_client_id, get_current_user_client_id());
  
  IF v_client_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM contacts 
    WHERE lead_id = p_lead_id 
    AND client_id = v_client_id
  );
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_client_lead_lookup ON contacts(client_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_client_users_user_lookup ON client_users(user_id);

-- Test the setup with a query that should show different results per client
-- This is just for verification - the actual query will be run by the frontend
-- SELECT COUNT(*) as total_leads FROM leads;
-- SELECT COUNT(*) as converted_by_client FROM contacts WHERE client_id = get_current_user_client_id();
-- SELECT COUNT(*) as available_leads FROM available_leads;
