
-- Create super admin account for djoere@scailup.io with unlimited credits and full access
-- This will make djoere@scailup.io a super admin with unlimited credits

-- First, ensure we have the proper admin flags in the clients table (already exists)
-- Update the client record for djoere@scailup.io to be a super admin
UPDATE public.clients 
SET 
  admin = true,
  is_active = true,
  plan = 'enterprise'
WHERE email = 'djoere@scailup.io';

-- If the client doesn't exist, create it (this will happen when they first sign up)
INSERT INTO public.clients (
  email,
  first_name,
  last_name,
  company_name,
  admin,
  is_active,
  plan,
  created_at,
  updated_at
) VALUES (
  'djoere@scailup.io',
  'Djoere',
  'Bloemheuvel',
  'ScailUp',
  true,
  true,
  'enterprise',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  admin = true,
  is_active = true,
  plan = 'enterprise',
  updated_at = NOW();

-- Create a profiles record for the super admin with unlimited credits
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  role,
  is_admin,
  is_super_admin,
  credits,
  unlimited_credits,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'djoere@scailup.io' LIMIT 1),
  'djoere@scailup.io',
  'Djoere Bloemheuvel',
  'ScailUp',
  'super_admin',
  true,
  true,
  999999,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  company_name = EXCLUDED.company_name,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  is_super_admin = EXCLUDED.is_super_admin,
  credits = EXCLUDED.credits,
  unlimited_credits = EXCLUDED.unlimited_credits,
  updated_at = NOW();

-- Ensure all modules are active for this admin client
INSERT INTO public.client_modules (client_id, module, active, created_at, updated_at)
SELECT 
  c.id,
  'lead_engine',
  true,
  NOW(),
  NOW()
FROM public.clients c
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module) DO UPDATE SET
  active = true,
  updated_at = NOW();

-- Add unlimited credits for all credit types for the admin client
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  'lead_engine',
  'leads',
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM public.clients c
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Log the super admin account creation
INSERT INTO public.admin_logs (
  action,
  details,
  created_at
) VALUES (
  'super_admin_account_created',
  '{"email": "djoere@scailup.io", "access_level": "super_admin", "unlimited_credits": true}',
  NOW()
);
