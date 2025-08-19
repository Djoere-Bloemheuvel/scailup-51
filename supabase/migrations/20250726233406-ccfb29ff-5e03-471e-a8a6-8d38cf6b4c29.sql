
-- Drop the problematic available_leads_secure view and restore the original available_leads view
DROP VIEW IF EXISTS public.available_leads_secure;

-- Recreate the original available_leads view without RLS or security_invoker
-- This view filters out leads that already have contacts for the current client
CREATE OR REPLACE VIEW public.available_leads AS
SELECT DISTINCT l.*
FROM public.leads l
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.contacts c 
  WHERE c.lead_id = l.id 
    AND c.client_id = get_current_user_client_id()
);

-- Create index for performance on contacts(lead_id, client_id) if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_contacts_lead_client ON public.contacts(lead_id, client_id);

-- Update or create the convert_lead_to_contact RPC function with better error handling
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(
  p_lead_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id uuid;
  v_lead_record record;
  v_existing_contact_id uuid;
  v_new_contact record;
BEGIN
  -- Get current user's client ID
  v_client_id := get_current_user_client_id();
  
  IF v_client_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CLIENT_ID_MISSING',
      'message', 'No client context available'
    );
  END IF;

  -- Get lead data
  SELECT * INTO v_lead_record 
  FROM public.leads 
  WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'LEAD_NOT_FOUND',
      'message', 'Lead not found'
    );
  END IF;

  -- Check if contact already exists for this lead and client
  SELECT id INTO v_existing_contact_id
  FROM public.contacts 
  WHERE lead_id = p_lead_id AND client_id = v_client_id;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONTACT_ALREADY_EXISTS',
      'message', 'Contact already exists for this lead'
    );
  END IF;

  -- Create new contact from lead data
  INSERT INTO public.contacts (
    client_id,
    lead_id,
    first_name,
    last_name,
    full_name,
    email,
    mobile_phone,
    linkedin_url,
    title,
    seniority,
    function_group,
    company_name,
    industry,
    company_linkedin,
    company_website,
    company_phone,
    company_summary,
    company_keywords,
    organization_technologies,
    country,
    state,
    city,
    employee_count,
    status,
    contact_summary,
    contact_date,
    nurture,
    do_not_contact
  ) VALUES (
    v_client_id,
    v_lead_record.id,
    v_lead_record.first_name,
    v_lead_record.last_name,
    COALESCE(v_lead_record.full_name, TRIM(COALESCE(v_lead_record.first_name, '') || ' ' || COALESCE(v_lead_record.last_name, ''))),
    v_lead_record.email,
    v_lead_record.mobile_phone,
    v_lead_record.linkedin_url,
    v_lead_record.title,
    v_lead_record.seniority,
    v_lead_record.function_group,
    v_lead_record.company_name,
    v_lead_record.industry,
    v_lead_record.company_linkedin,
    v_lead_record.company_website,
    v_lead_record.company_phone,
    v_lead_record.company_summary,
    CASE 
      WHEN v_lead_record.company_keywords IS NOT NULL 
      THEN ARRAY[v_lead_record.company_keywords] 
      ELSE ARRAY[]::text[] 
    END,
    CASE 
      WHEN v_lead_record.organization_technologies IS NOT NULL 
      THEN ARRAY[v_lead_record.organization_technologies] 
      ELSE ARRAY[]::text[] 
    END,
    v_lead_record.country,
    v_lead_record.state,
    v_lead_record.city,
    v_lead_record.employee_count,
    'active',
    '',
    CURRENT_DATE,
    false,
    false
  ) RETURNING * INTO v_new_contact;

  RETURN jsonb_build_object(
    'success', true,
    'contact', row_to_json(v_new_contact),
    'message', 'Contact created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'CONVERSION_FAILED',
    'message', 'Failed to convert lead to contact: ' || SQLERRM
  );
END;
$$;
