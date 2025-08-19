
-- Fix the available_leads view to filter leads per client instead of globally
-- This will show leads that haven't been converted by the CURRENT client

-- First, drop the existing view
DROP VIEW IF EXISTS available_leads;

-- Recreate the available_leads view with proper per-client filtering
CREATE OR REPLACE VIEW available_leads AS
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

-- Add RLS policies to the available_leads view
ALTER VIEW available_leads SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Users can view available leads for their client" ON available_leads
  FOR SELECT 
  USING (
    get_current_user_client_id() IS NOT NULL
  );

-- Enable RLS on the view (if supported)
-- Note: Views don't typically have RLS, but we'll rely on the underlying table's RLS

-- Update the convert_lead_to_contact function to handle NULL client_id gracefully
CREATE OR REPLACE FUNCTION convert_lead_to_contact(p_lead_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  -- Enhanced NULL check with better error handling
  IF v_client_id IS NULL THEN
    -- Log this issue for debugging
    RAISE LOG 'Client ID is NULL for user %', v_user_id;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CLIENT_ID_MISSING',
      'message', 'No client context available. Please ensure you are properly associated with a client.'
    );
  END IF;

  -- Get lead data with existence check
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

  -- Log successful conversion
  RAISE LOG 'Successfully converted lead % to contact % for client %', p_lead_id, v_new_contact.id, v_client_id;

  RETURN jsonb_build_object(
    'success', true,
    'contact', row_to_json(v_new_contact),
    'message', 'Contact created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  -- Enhanced error logging
  RAISE LOG 'Error converting lead % to contact for client %: %', p_lead_id, v_client_id, SQLERRM;
  
  RETURN jsonb_build_object(
    'success', false,
    'error', 'CONVERSION_FAILED',
    'message', 'Failed to convert lead to contact: ' || SQLERRM
  );
END;
$$;

-- Update the is_lead_converted function to use the correct client context
CREATE OR REPLACE FUNCTION is_lead_converted(p_lead_id uuid, p_client_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Use provided client_id or get current user's client_id
  v_client_id := COALESCE(p_client_id, get_current_user_client_id());
  
  -- If we still don't have a client_id, return false
  IF v_client_id IS NULL THEN
    RAISE LOG 'No client context available for lead conversion check';
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM contacts 
    WHERE lead_id = p_lead_id 
    AND client_id = v_client_id
  );
END;
$$;

-- Test the view and functions
SELECT 
  'Available leads view test' as test_name,
  COUNT(*) as leads_count
FROM available_leads
LIMIT 1;

-- Test the convert function exists
SELECT 
  'Convert function test' as test_name,
  COUNT(*) as function_count
FROM pg_proc 
WHERE proname = 'convert_lead_to_contact';

-- Verify the view structure
SELECT 
  'View structure test' as test_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'available_leads';
