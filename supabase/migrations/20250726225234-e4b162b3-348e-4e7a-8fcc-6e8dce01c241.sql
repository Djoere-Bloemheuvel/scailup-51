
-- Fix the infinite recursion in client_users RLS policies
-- The current policy is trying to reference the same table it's applied to
-- We need to use a security definer function to avoid recursion

-- First, let's create a security definer function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = ''
AS $$
  SELECT cu.role::TEXT 
  FROM public.client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create a function to get the current user's client ID safely
CREATE OR REPLACE FUNCTION public.get_current_user_client_id_safe()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = ''
AS $$
  SELECT cu.client_id 
  FROM public.client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;

-- Drop the problematic policies on client_users
DROP POLICY IF EXISTS "Admins can manage client users in their client" ON public.client_users;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can manage client users in their client" 
ON public.client_users 
FOR ALL 
TO authenticated 
USING (
  (public.get_current_user_role_safe() = 'admin') AND 
  (client_id = public.get_current_user_client_id_safe())
)
WITH CHECK (
  (public.get_current_user_role_safe() = 'admin') AND 
  (client_id = public.get_current_user_client_id_safe())
);

-- Also fix the get_current_user_role function to avoid recursion
DROP FUNCTION IF EXISTS public.get_current_user_role();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = ''
AS $$
  SELECT cu.role::TEXT 
  FROM public.client_users cu 
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;
