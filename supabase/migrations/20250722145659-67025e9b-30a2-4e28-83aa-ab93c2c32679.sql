
-- Add all types of credits for the super admin (djoere@scailup.io)
-- This ensures the account has unlimited credits for all modules and credit types

-- First, get all existing modules to create credit balances for
-- Add credits for lead_engine module
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  'lead_engine',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM public.clients c
CROSS JOIN (
  VALUES 
    ('leads'),
    ('contacts'),
    ('enrichment'),
    ('export'),
    ('api_calls')
) AS credit_types(credit_type)
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Add credits for marketing_engine module
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  'marketing_engine',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM public.clients c
CROSS JOIN (
  VALUES 
    ('emails'),
    ('linkedin'),
    ('campaigns'),
    ('sequences'),
    ('templates')
) AS credit_types(credit_type)
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Add credits for analytics module
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  'analytics',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM public.clients c
CROSS JOIN (
  VALUES 
    ('reports'),
    ('insights'),
    ('exports'),
    ('api_access')
) AS credit_types(credit_type)
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Add general/universal credits
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  'general',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM public.clients c
CROSS JOIN (
  VALUES 
    ('standard'),
    ('premium'),
    ('api'),
    ('storage'),
    ('bandwidth')
) AS credit_types(credit_type)
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Ensure all modules are active for the super admin
INSERT INTO public.client_modules (client_id, module, active, created_at, updated_at)
SELECT 
  c.id,
  module_name,
  true,
  NOW(),
  NOW()
FROM public.clients c
CROSS JOIN (
  VALUES 
    ('lead_engine'),
    ('marketing_engine'),
    ('analytics'),
    ('reporting'),
    ('api_access')
) AS modules(module_name)
WHERE c.email = 'djoere@scailup.io'
ON CONFLICT (client_id, module) DO UPDATE SET
  active = true,
  updated_at = NOW();

-- Log the credit addition
INSERT INTO public.admin_logs (
  action,
  details,
  created_at
) VALUES (
  'unlimited_credits_granted',
  '{"email": "djoere@scailup.io", "action": "granted_all_credit_types", "modules": ["lead_engine", "marketing_engine", "analytics", "general"], "amount": 999999}',
  NOW()
);
