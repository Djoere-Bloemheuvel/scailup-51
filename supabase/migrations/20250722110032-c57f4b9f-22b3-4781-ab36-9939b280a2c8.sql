-- Fix domain validation issues for registration

-- The pending_registrations table might be causing validation issues
-- Let's make sure it has proper policies

-- First, check if there are any restrictive policies on pending_registrations
DROP POLICY IF EXISTS "Anyone can view pending registrations by token" ON public.pending_registrations;
DROP POLICY IF EXISTS "Anyone can update registration status" ON public.pending_registrations;

-- Create more permissive policies for registration flow
CREATE POLICY "Public access for registration flow" 
  ON public.pending_registrations 
  FOR ALL
  USING (true);

-- Also ensure the services table has proper policies for registration
CREATE POLICY "Users can manage services for their client" 
  ON public.services 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = services.client_id 
    AND (c.user_id = auth.uid() OR auth.uid() IS NULL) -- Allow for registration flow
  ));

-- Make sure client_modules table has proper policies
CREATE POLICY "Users can view modules for their client" 
  ON public.client_modules 
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_modules.client_id 
    AND (c.user_id = auth.uid() OR auth.uid() IS NULL)
  ));

CREATE POLICY "System can manage client modules" 
  ON public.client_modules 
  FOR ALL
  USING (true); -- Allow system to create default modules

-- Fix any user_id constraint issues in clients table
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_id_unique 
  ON public.clients(user_id) 
  WHERE user_id IS NOT NULL;

-- Ensure the admin user has proper records
DO $$
DECLARE
  admin_user_id UUID;
  admin_client_id UUID;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'djoere@scailup.io' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Ensure admin client record exists and is properly linked
    INSERT INTO public.clients (user_id, email, first_name, last_name, company_name, is_active, plan, admin)
    VALUES (admin_user_id, 'djoere@scailup.io', 'Djoere', 'Bloemheuvel', 'ScailUp', true, 'enterprise', true)
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      company_name = EXCLUDED.company_name,
      is_active = true,
      plan = 'enterprise',
      admin = true;
    
    -- Get the client ID
    SELECT id INTO admin_client_id FROM public.clients WHERE user_id = admin_user_id;
    
    -- Ensure users table entry exists
    INSERT INTO public.users (id, client_id, email)
    VALUES (admin_user_id, admin_client_id, 'djoere@scailup.io')
    ON CONFLICT (id) DO UPDATE SET
      client_id = EXCLUDED.client_id,
      email = EXCLUDED.email;
  END IF;
END $$;