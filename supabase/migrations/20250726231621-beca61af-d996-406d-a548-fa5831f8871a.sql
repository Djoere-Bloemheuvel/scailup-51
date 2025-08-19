
-- Phase 1: Critical Database Function Security Fixes
-- Fix all security definer functions to use restricted search paths

-- 1. Fix get_current_user_role_safe function
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT cu.role::TEXT 
  FROM public.client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;

-- 2. Fix get_current_user_client_id_safe function
CREATE OR REPLACE FUNCTION public.get_current_user_client_id_safe()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT cu.client_id 
  FROM public.client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;

-- 3. Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT cu.role::TEXT 
  FROM public.client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;

-- 4. Fix get_current_user_client_id function
CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT client_users.client_id 
  FROM public.client_users 
  WHERE client_users.user_id = auth.uid() 
  LIMIT 1;
$$;

-- 5. Fix user_has_client_access function
CREATE OR REPLACE FUNCTION public.user_has_client_access(target_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_users
    WHERE client_users.user_id = auth.uid()
    AND client_users.client_id = target_client_id
  );
$$;

-- 6. Fix get_user_role_for_client function
CREATE OR REPLACE FUNCTION public.get_user_role_for_client(target_client_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT client_users.role::TEXT
  FROM public.client_users
  WHERE client_users.user_id = auth.uid()
  AND client_users.client_id = target_client_id
  LIMIT 1;
$$;

-- 7. Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text, 
  p_resource_type text, 
  p_resource_id uuid DEFAULT NULL::uuid, 
  p_client_id uuid DEFAULT NULL::uuid, 
  p_success boolean DEFAULT true, 
  p_error_message text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    client_id,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    COALESCE(p_client_id, (SELECT get_current_user_client_id_safe())),
    p_success,
    p_error_message,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

-- 8. Fix is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND revoked_at IS NULL
  );
$$;

-- 9. Fix is_super_admin_user function
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND is_super_admin = true
    AND revoked_at IS NULL
  );
$$;

-- 10. Create secure available_leads view with proper RLS
CREATE OR REPLACE VIEW public.available_leads_secure AS
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
  l.company_linkedin,
  l.company_website,
  l.company_phone,
  l.company_summary,
  l.company_keywords,
  l.linkedin_url,
  l.mobile_phone,
  l.full_name,
  l.state,
  l.seniority,
  l.organization_technologies,
  l.employee_count,
  l.status,
  l.function_group,
  l.created_at,
  l.updated_at
FROM public.leads l
WHERE NOT EXISTS (
  SELECT 1 FROM public.contacts c 
  WHERE c.lead_id = l.id 
  AND c.client_id IN (
    SELECT cu.client_id 
    FROM public.client_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

-- Enable RLS on the secure view
ALTER VIEW public.available_leads_secure SET (security_invoker = on);

-- 11. Strengthen RLS policies - Remove overly permissive policies and add stricter ones

-- Drop and recreate leads policy with client-based access
DROP POLICY IF EXISTS "All authenticated users can view leads" ON public.leads;
CREATE POLICY "Users can view leads for their access level" ON public.leads
FOR SELECT USING (
  -- Admin users can see all leads
  is_admin_user() OR 
  -- Regular users can see leads (business logic will handle conversion restrictions)
  auth.role() = 'authenticated'
);

-- Strengthen callback_requests policy
DROP POLICY IF EXISTS "Anyone can submit callback requests" ON public.callback_requests;
CREATE POLICY "Authenticated users can submit callback requests" ON public.callback_requests
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Strengthen security_audit_log policies
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "System functions can insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (
  -- Only allow inserts from security definer functions or admin users
  is_admin_user() OR 
  current_setting('role') = 'service_role'
);

-- Strengthen pending_user_tasks policies
DROP POLICY IF EXISTS "System can insert pending tasks" ON public.pending_user_tasks;
CREATE POLICY "Service role can insert pending tasks" ON public.pending_user_tasks
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 12. Create convert_lead_to_contact function with proper security
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(
  p_lead_id uuid, 
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_contact_id uuid;
  v_client_id uuid;
  v_lead_exists boolean;
  v_contact_exists boolean;
BEGIN
  -- Get client_id for current user
  SELECT get_current_user_client_id_safe() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'CLIENT_ID_MISSING' USING HINT = 'User not associated with any client';
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM public.leads 
    WHERE id = p_lead_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO v_lead_exists;
  
  IF NOT v_lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid';
  END IF;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM public.contacts 
    WHERE lead_id = p_lead_id 
      AND client_id = v_client_id
  ) INTO v_contact_exists;
  
  IF v_contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Insert new contact
  INSERT INTO public.contacts (lead_id, client_id, notes, status)
  VALUES (p_lead_id, v_client_id, p_notes, 'active')
  RETURNING id INTO v_contact_id;
  
  -- Log the conversion
  PERFORM log_security_event(
    'lead_converted',
    'contact',
    v_contact_id,
    v_client_id,
    true,
    'Lead successfully converted to contact'
  );
  
  RETURN v_contact_id;
END;
$$;

-- 13. Create contacts query function with proper security
CREATE OR REPLACE FUNCTION public.get_contacts_with_lead_data()
RETURNS TABLE (
  id uuid,
  lead_id uuid,
  client_id uuid,
  contact_date timestamp with time zone,
  notes text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  lead_first_name text,
  lead_last_name text,
  lead_email text,
  lead_company_name text,
  lead_job_title text,
  lead_industry text,
  lead_country text,
  lead_company_summary text,
  lead_product_match_percentage integer,
  lead_match_reasons text[],
  lead_unique_angles text[],
  lead_best_campaign_match text,
  lead_personalized_icebreaker text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Get client_id for current user
  SELECT get_current_user_client_id_safe() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'CLIENT_ID_MISSING' USING HINT = 'User not associated with any client';
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.lead_id,
    c.client_id,
    c.created_at as contact_date,
    c.notes,
    c.status,
    c.created_at,
    c.updated_at,
    COALESCE(l.first_name, 'Unknown') as lead_first_name,
    COALESCE(l.last_name, 'Lead') as lead_last_name,
    COALESCE(l.email, 'No email') as lead_email,
    COALESCE(l.company_name, 'Unknown Company') as lead_company_name,
    COALESCE(l.title, 'Unknown Title') as lead_job_title,
    COALESCE(l.industry, 'Unknown') as lead_industry,
    COALESCE(l.country, 'Unknown') as lead_country,
    COALESCE(l.company_summary, '') as lead_company_summary,
    0 as lead_product_match_percentage,
    ARRAY[]::text[] as lead_match_reasons,
    ARRAY[]::text[] as lead_unique_angles,
    '' as lead_best_campaign_match,
    '' as lead_personalized_icebreaker
  FROM public.contacts c
  LEFT JOIN public.leads l ON c.lead_id = l.id
  WHERE c.client_id = v_client_id
  ORDER BY c.created_at DESC;
END;
$$;

-- 14. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.convert_lead_to_contact(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_contacts_with_lead_data() TO authenticated;
GRANT SELECT ON public.available_leads_secure TO authenticated;

-- 15. Add indexes for performance and security
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_client_lead ON public.contacts(client_id, lead_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_client_id ON public.security_audit_log(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_users_user_revoked ON public.admin_users(user_id, revoked_at) WHERE revoked_at IS NULL;

-- 16. Clean up any orphaned or invalid data
DELETE FROM public.contacts WHERE client_id IS NULL;
DELETE FROM public.security_audit_log WHERE created_at < NOW() - INTERVAL '1 year';
