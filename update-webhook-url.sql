
-- Update the convert_lead_to_contact function to remove webhook logic
-- The webhook will now be handled by the Edge Function for better reliability
CREATE OR REPLACE FUNCTION convert_lead_to_contact(p_lead_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_client_id uuid;
  v_lead_record record;
  v_existing_contact_id uuid;
  v_new_contact record;
  v_user_id uuid;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CLIENT_ID_MISSING',
      'message', 'Authentication required'
    );
  END IF;

  -- Get current user's client ID using the helper function
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
  FROM leads 
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
  FROM contacts 
  WHERE lead_id = p_lead_id AND client_id = v_client_id;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONTACT_ALREADY_EXISTS',
      'message', 'Contact already exists for this lead'
    );
  END IF;

  -- Create new contact from lead data
  INSERT INTO contacts (
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
    nurture,
    do_not_contact,
    created_at,
    updated_at
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
    false,
    false,
    NOW(),
    NOW()
  ) RETURNING * INTO v_new_contact;

  -- Return success with contact data and webhook trigger info
  RETURN jsonb_build_object(
    'success', true,
    'contact', row_to_json(v_new_contact),
    'user_id', v_user_id,
    'client_id', v_client_id,
    'message', 'Contact created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'CONVERSION_FAILED',
    'message', 'Failed to convert lead to contact: ' || SQLERRM
  );
END;
$function$;
