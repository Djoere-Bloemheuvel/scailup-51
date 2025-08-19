-- Create super admin account for djoere@scailup.io with unlimited credits and full access
-- Lovable compatibility ensured

-- First, ensure the user exists (if not, this will be created when they sign up)
-- Then update their profile to be a super admin with unlimited credits

-- Update or insert super admin profile for djoere@scailup.io
INSERT INTO profiles (
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

-- Grant all necessary permissions to the super admin user
-- This ensures they have access to all functions and features

-- Update user metadata to mark as super admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{is_admin}',
    'true'::jsonb
  ),
  '{is_super_admin}',
  'true'::jsonb
)
WHERE email = 'djoere@scailup.io';

-- Ensure the user has all necessary RLS policies bypassed for super admin functions
-- This is handled by the application logic checking is_super_admin flag

-- Add any additional super admin-specific settings
INSERT INTO user_settings (
  user_id,
  setting_key,
  setting_value,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'djoere@scailup.io' LIMIT 1),
  'super_admin_access_level',
  'full',
  NOW()
)
ON CONFLICT (user_id, setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Log the super admin account creation
INSERT INTO admin_logs (
  action,
  details,
  created_at
) VALUES (
  'super_admin_account_created',
  '{"email": "djoere@scailup.io", "access_level": "super_admin", "unlimited_credits": true}',
  NOW()
); 