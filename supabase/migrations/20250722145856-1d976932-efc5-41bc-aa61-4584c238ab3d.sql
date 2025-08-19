
-- Add all types of credits for the specified client_id: 291caa9c-d4e7-4aca-bf05-9d127f673eaf
-- This ensures the account has unlimited credits for all modules and credit types

-- Add credits for lead_engine module
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf'::uuid,
  'lead_engine',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM (
  VALUES 
    ('leads'),
    ('contacts'),
    ('enrichment'),
    ('export'),
    ('api_calls')
) AS credit_types(credit_type)
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Add credits for marketing_engine module
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf'::uuid,
  'marketing_engine',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM (
  VALUES 
    ('emails'),
    ('linkedin'),
    ('campaigns'),
    ('sequences'),
    ('templates')
) AS credit_types(credit_type)
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Add credits for analytics module
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf'::uuid,
  'analytics',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM (
  VALUES 
    ('reports'),
    ('insights'),
    ('exports'),
    ('api_access')
) AS credit_types(credit_type)
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Add general/universal credits
INSERT INTO public.credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf'::uuid,
  'general',
  credit_type,
  999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM (
  VALUES 
    ('standard'),
    ('premium'),
    ('api'),
    ('storage'),
    ('bandwidth')
) AS credit_types(credit_type)
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- Ensure all modules are active for the specified client
INSERT INTO public.client_modules (client_id, module, active, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf'::uuid,
  module_name,
  true,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('lead_engine'),
    ('marketing_engine'),
    ('analytics'),
    ('reporting'),
    ('api_access')
) AS modules(module_name)
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
  '{"client_id": "291caa9c-d4e7-4aca-bf05-9d127f673eaf", "action": "granted_all_credit_types", "modules": ["lead_engine", "marketing_engine", "analytics", "general"], "amount": 999999}',
  NOW()
);
