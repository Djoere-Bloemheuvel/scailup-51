
-- First, let's recreate the available_leads view to properly filter by current client
DROP VIEW IF EXISTS available_leads;

CREATE VIEW available_leads AS
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
  AND c.client_id = get_current_user_client_id()
);

-- Add RLS policy for available_leads view
ALTER VIEW available_leads OWNER TO postgres;
GRANT SELECT ON available_leads TO authenticated;

-- Add unique constraint to contacts table to prevent duplicate conversions
ALTER TABLE contacts ADD CONSTRAINT unique_client_lead UNIQUE (client_id, lead_id);

-- Add compound index for fast lookup
CREATE INDEX IF NOT EXISTS idx_contacts_client_lead ON contacts(client_id, lead_id);

-- Update the is_lead_converted function to work with current client context
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
