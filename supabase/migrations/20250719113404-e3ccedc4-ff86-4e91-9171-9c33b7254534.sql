
-- First, let's check if the record exists and see what happened
SELECT * FROM public.clients WHERE email = 'djoere@scailup.io';

-- The issue is that the clients table requires a user_id, but we're trying to create 
-- a client without an associated auth user. Let's fix this by making user_id nullable
-- for admin accounts or system accounts that don't have a corresponding auth user.

-- Make user_id nullable to allow admin/system accounts
ALTER TABLE public.clients ALTER COLUMN user_id DROP NOT NULL;

-- Now insert the admin client record properly
INSERT INTO public.clients (
  email,
  first_name,
  last_name,
  company_name,
  is_active,
  plan,
  user_id
) VALUES (
  'djoere@scailup.io',
  'Djoere',
  'Bloemheuvel',
  'ScailUp',
  true,
  'enterprise',
  NULL  -- No auth user associated with this admin account
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_name = EXCLUDED.company_name,
  is_active = true,
  plan = 'enterprise';

-- Get the client ID for the modules
DO $$
DECLARE
  client_uuid UUID;
BEGIN
  SELECT id INTO client_uuid FROM public.clients WHERE email = 'djoere@scailup.io';
  
  -- Insert all available modules for this client
  INSERT INTO public.client_modules (client_id, module, active) VALUES
    (client_uuid, 'SARAH_AI', true),
    (client_uuid, 'LEAD_DATABASE', true),
    (client_uuid, 'CAMPAIGNS', true),
    (client_uuid, 'ANALYTICS', true),
    (client_uuid, 'INTEGRATIONS', true)
  ON CONFLICT (client_id, module) DO UPDATE SET
    active = true;
END $$;
