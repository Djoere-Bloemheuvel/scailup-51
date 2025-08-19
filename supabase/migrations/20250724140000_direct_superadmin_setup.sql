-- Direct superadmin setup for djoere@scailup.io (Lovable compatible)

-- 1. Create superadmin client
INSERT INTO clients (id, company_name, email, admin, is_active, created_at, updated_at)
VALUES (
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf', -- Fixed UUID for consistency
  'Scailup Superadmin',
  'djoere@scailup.io',
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  admin = TRUE,
  is_active = TRUE,
  updated_at = NOW();

-- 2. Create superadmin user
INSERT INTO users (id, client_id, email, created_at)
VALUES (
  'djoere-user-id-1234-5678-9abc-def012345678',
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf',
  'djoere@scailup.io',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  client_id = '291caa9c-d4e7-4aca-bf05-9d127f673eaf',
  created_at = NOW();

-- 3. Add unlimited credits for all modules and credit types
-- Lead Engine module
INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf',
  m.id,
  ct.credit_type,
  99999999,
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
FROM modules m
CROSS JOIN (VALUES 
  ('leads'), 
  ('emails'), 
  ('linkedin'), 
  ('campaigns'), 
  ('webhooks'), 
  ('api_calls'),
  ('seo_reports'),
  ('social_posts')
) AS ct(credit_type)
WHERE m.slug IN ('lead_engine', 'marketing_engine', 'sarah_ai', 'analytics', 'integrations')
ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
  amount = 99999999,
  expires_at = NOW() + INTERVAL '10 years',
  updated_at = NOW();

-- 4. Set superadmin profile flags
INSERT INTO profiles (id, email, full_name, company_name, credits, unlimited_credits, is_admin, is_super_admin, role, created_at, updated_at)
VALUES (
  'djoere-profile-id-1234-5678-9abc-def012345678',
  'djoere@scailup.io',
  'Djoere Bloemheuvel',
  'Scailup Superadmin',
  99999999,
  TRUE,
  TRUE,
  TRUE,
  'super_admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  unlimited_credits = TRUE,
  is_admin = TRUE,
  is_super_admin = TRUE,
  role = 'super_admin',
  credits = 99999999,
  updated_at = NOW();

-- 5. Ensure all modules are active for superadmin
INSERT INTO client_modules (client_id, module, active, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf',
  m.slug,
  TRUE,
  NOW(),
  NOW()
FROM modules m
WHERE m.slug IN ('lead_engine', 'marketing_engine', 'sarah_ai', 'analytics', 'integrations')
ON CONFLICT (client_id, module) DO UPDATE SET
  active = TRUE,
  updated_at = NOW();

-- 6. Add client subscriptions for all modules
INSERT INTO client_subscriptions (client_id, module_id, is_active, start_date, created_at, updated_at)
SELECT 
  '291caa9c-d4e7-4aca-bf05-9d127f673eaf',
  m.id,
  TRUE,
  NOW(),
  NOW(),
  NOW()
FROM modules m
WHERE m.slug IN ('lead_engine', 'marketing_engine', 'sarah_ai', 'analytics', 'integrations')
ON CONFLICT (client_id, module_id) DO UPDATE SET
  is_active = TRUE,
  updated_at = NOW(); 