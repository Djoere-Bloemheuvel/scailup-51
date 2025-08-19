-- Recreate all missing tables needed for proper registration

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_roles JSONB,
  target_companies TEXT,
  problem_solved TEXT,
  unique_value TEXT,
  use_cases TEXT,
  status TEXT NOT NULL DEFAULT 'concept',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services that allow registration flow
CREATE POLICY "Users can manage services for their client" 
  ON public.services 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = services.client_id 
    AND (c.user_id = auth.uid() OR auth.uid() IS NULL) -- Allow for registration flow
  ));

-- Add service limit trigger
CREATE OR REPLACE FUNCTION check_service_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.services WHERE client_id = NEW.client_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 services allowed per client';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_limit_trigger
  BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION check_service_limit();

-- Now fix the client_modules policies properly
DROP POLICY IF EXISTS "Users can view their own client modules" ON public.client_modules;

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
  FOR INSERT
  USING (true); -- Allow system to create default modules

CREATE POLICY "Users can update their client modules" 
  ON public.client_modules 
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_modules.client_id 
    AND c.user_id = auth.uid()
  ));

-- Ensure admin user setup is complete
DO $$
DECLARE
  admin_user_id UUID;
  admin_client_id UUID;
BEGIN
  -- Find existing admin user
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'djoere@scailup.io' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Ensure admin client record exists
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
    
    -- Get client ID
    SELECT id INTO admin_client_id FROM public.clients WHERE user_id = admin_user_id;
    
    -- Ensure users table entry
    INSERT INTO public.users (id, client_id, email)
    VALUES (admin_user_id, admin_client_id, 'djoere@scailup.io')
    ON CONFLICT (id) DO UPDATE SET
      client_id = EXCLUDED.client_id,
      email = EXCLUDED.email;
      
    -- Ensure default modules for admin client
    INSERT INTO public.client_modules (client_id, module, active) VALUES
      (admin_client_id, 'SARAH_AI', true),
      (admin_client_id, 'LEAD_DATABASE', true),
      (admin_client_id, 'CAMPAIGNS', true),
      (admin_client_id, 'ANALYTICS', true),
      (admin_client_id, 'INTEGRATIONS', true)
    ON CONFLICT (client_id, module) DO UPDATE SET active = true;
  END IF;
END $$;