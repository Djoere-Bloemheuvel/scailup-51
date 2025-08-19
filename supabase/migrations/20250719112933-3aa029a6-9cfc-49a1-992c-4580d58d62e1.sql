
-- Insert admin client record
INSERT INTO public.clients (
  email,
  first_name,
  last_name,
  company_name,
  is_active,
  plan
) VALUES (
  'djoere@scailup.io',
  'Djoere',
  'Bloemheuvel',
  'ScailUp',
  true,
  'enterprise'
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
