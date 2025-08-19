
-- STEP 1: Fix RLS Policy Infinite Recursion and Clean Database Structure

-- Drop all problematic RLS policies on clients table
DROP POLICY IF EXISTS "Users can view their own client" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own client" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Allow email-based client lookup for registration" ON public.clients;
DROP POLICY IF EXISTS "System can create client records" ON public.clients;

-- Create a security definer function to get current client ID without recursion
CREATE OR REPLACE FUNCTION public.get_current_client_id_safe()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_id UUID;
BEGIN
  -- First try: Direct lookup by user_id in clients table
  SELECT c.id INTO client_id
  FROM clients c
  WHERE c.user_id = auth.uid()
  LIMIT 1;
  
  -- If found, return it
  IF client_id IS NOT NULL THEN
    RETURN client_id;
  END IF;
  
  -- Second try: Lookup via users table
  SELECT u.client_id INTO client_id
  FROM users u
  WHERE u.id = auth.uid()
  LIMIT 1;
  
  RETURN client_id;
END;
$$;

-- Create simple, safe RLS policies for clients table
CREATE POLICY "Safe client access for authenticated users" 
  ON public.clients 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR 
      id = public.get_current_client_id_safe() OR
      admin = true
    )
  );

CREATE POLICY "Safe client updates" 
  ON public.clients 
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR 
      id = public.get_current_client_id_safe()
    )
  );

CREATE POLICY "Safe client creation" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update the existing get_current_client_id function to use the safe version
CREATE OR REPLACE FUNCTION public.get_current_client_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT public.get_current_client_id_safe();
$$;

-- Ensure leads table has proper RLS without recursion
DROP POLICY IF EXISTS "Users can view their client leads" ON public.leads;
CREATE POLICY "Users can view their client leads" 
  ON public.leads 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    client_id = public.get_current_client_id_safe() AND
    email IS NOT NULL AND 
    email != '' AND 
    (is_duplicate IS NULL OR is_duplicate = false)
  );

-- Ensure contacts table has proper RLS
DROP POLICY IF EXISTS "Users can view their client contacts" ON public.contacts;
CREATE POLICY "Users can view their client contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    client_id = public.get_current_client_id_safe()
  );

-- Fix the get_lead_status_counts function to use the safe client ID function
CREATE OR REPLACE FUNCTION public.get_lead_status_counts()
RETURNS TABLE(total bigint, new bigint, contacts bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  total_count BIGINT;
  new_count BIGINT;
  contacts_count BIGINT;
BEGIN
  -- Get current client ID using safe function
  SELECT public.get_current_client_id_safe() INTO current_client_id;
  
  -- If no client found, return zeros
  IF current_client_id IS NULL THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Count total leads with valid emails
  SELECT COUNT(*) INTO total_count
  FROM leads l
  WHERE l.client_id = current_client_id
    AND l.email IS NOT NULL 
    AND l.email != ''
    AND (l.is_duplicate IS NULL OR l.is_duplicate = false);
  
  -- Count new leads (not converted by current client)
  SELECT COUNT(*) INTO new_count
  FROM leads l
  WHERE l.client_id = current_client_id
    AND l.email IS NOT NULL 
    AND l.email != ''
    AND (l.is_duplicate IS NULL OR l.is_duplicate = false)
    AND NOT EXISTS (
      SELECT 1 FROM contacts c 
      WHERE c.lead_id = l.id 
        AND c.client_id = current_client_id
    );
  
  -- Count contacts (converted by current client)  
  SELECT COUNT(*) INTO contacts_count
  FROM contacts c
  WHERE c.client_id = current_client_id;
  
  -- Return the counts
  RETURN QUERY SELECT total_count, new_count, contacts_count;
END;
$$;

-- Ensure convert functions work with safe client ID
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
BEGIN
  -- Get client_id using safe function
  SELECT public.get_current_client_id_safe() INTO client_id;
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM leads 
    WHERE id = convert_lead_to_contact.lead_id
      AND client_id = convert_lead_to_contact.client_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid';
  END IF;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = convert_lead_to_contact.lead_id 
      AND client_id = convert_lead_to_contact.client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status, email, contact_date)
  VALUES (
    convert_lead_to_contact.lead_id, 
    convert_lead_to_contact.client_id, 
    convert_lead_to_contact.notes, 
    'active',
    (SELECT email FROM leads WHERE id = convert_lead_to_contact.lead_id),
    NOW()
  )
  RETURNING id INTO contact_id;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_current_client_id_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lead_status_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_contact(UUID, TEXT) TO authenticated;

-- Cleanup any orphaned data that might cause issues
DELETE FROM contacts WHERE client_id IS NULL;
DELETE FROM leads WHERE client_id IS NULL;

-- Update clients table to ensure admin user exists
INSERT INTO clients (user_id, email, first_name, last_name, company_name, is_active, plan, admin)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'djoere@scailup.io' LIMIT 1),
  'djoere@scailup.io',
  'Djoere',
  'Bloemheuvel', 
  'ScailUp',
  true,
  'enterprise',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  is_active = true,
  admin = true,
  plan = 'enterprise';
