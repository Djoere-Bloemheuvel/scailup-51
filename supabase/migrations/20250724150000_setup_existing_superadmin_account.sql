-- Setup existing account as superadmin with unlimited credits
-- ClientID: a2cad653-01ed-4595-b6ed-8dd3ea1f1d05
-- User ID: 5e54d9b1-667e-4eea-bbde-0e5c1fec94fc
-- Email: djoere@scailup.io

-- 1. Update existing client to be admin
UPDATE clients 
SET 
  admin = TRUE,
  is_active = TRUE,
  company_name = 'ScailUp',
  email = 'djoere@scailup.io',
  updated_at = NOW()
WHERE id = 'a2cad653-01ed-4595-b6ed-8dd3ea1f1d05';

-- 2. Update existing user
UPDATE users 
SET 
  client_id = 'a2cad653-01ed-4595-b6ed-8dd3ea1f1d05',
  email = 'djoere@scailup.io',
  created_at = NOW()
WHERE id = '5e54d9b1-667e-4eea-bbde-0e5c1fec94fc';

-- 3. Add unlimited credits for all modules and credit types
INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  'a2cad653-01ed-4595-b6ed-8dd3ea1f1d05',
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
  '5e54d9b1-667e-4eea-bbde-0e5c1fec94fc', -- Use same ID as user
  'djoere@scailup.io',
  'Djoere Bloemheuvel',
  'ScailUp',
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
  full_name = 'Djoere Bloemheuvel',
  company_name = 'ScailUp',
  updated_at = NOW();

-- 5. Ensure all modules are active for superadmin
INSERT INTO client_modules (client_id, module, active, created_at, updated_at)
SELECT 
  'a2cad653-01ed-4595-b6ed-8dd3ea1f1d05',
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
  'a2cad653-01ed-4595-b6ed-8dd3ea1f1d05',
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

-- 7. Log the superadmin setup
INSERT INTO admin_logs (action, details, user_id, created_at)
VALUES (
  'superadmin_setup',
  '{"client_id": "a2cad653-01ed-4595-b6ed-8dd3ea1f1d05", "user_id": "5e54d9b1-667e-4eea-bbde-0e5c1fec94fc", "email": "djoere@scailup.io", "credits_added": 99999999}',
  '5e54d9b1-667e-4eea-bbde-0e5c1fec94fc',
  NOW()
); 