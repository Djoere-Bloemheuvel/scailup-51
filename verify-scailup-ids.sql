-- =====================================================
-- VERIFY CORRECT IDS FOR djoere@scailup.io
-- =====================================================

-- 1. Check auth.users for djoere@scailup.io
SELECT 'AUTH USERS CHECK' as check_type, 
       id as user_id,
       email,
       created_at,
       last_sign_in_at
FROM auth.users 
WHERE email = 'djoere@scailup.io';

-- 2. Check if there are any client_users records for this email
SELECT 'CLIENT USERS CHECK' as check_type,
       client_id,
       user_id,
       email,
       full_name,
       role,
       created_at
FROM public.client_users 
WHERE email = 'djoere@scailup.io';

-- 3. Check if there are any clients with this email
SELECT 'CLIENTS CHECK' as check_type,
       id as client_id,
       company_name,
       company_email,
       company_domain,
       contactpersoon,
       created_at
FROM public.clients 
WHERE company_email = 'djoere@scailup.io';

-- 4. Check if there are any existing modules for this user's potential client
SELECT 'EXISTING MODULES CHECK' as check_type,
       cm.module,
       cm.tier,
       cm.activated_at,
       c.company_email
FROM public.client_modules cm
JOIN public.clients c ON cm.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io';

-- 5. Check if there are any existing credits for this user's potential client
SELECT 'EXISTING CREDITS CHECK' as check_type,
       cc.credit_type,
       cc.module,
       cc.used_this_period,
       cc.period_start,
       c.company_email
FROM public.client_credits cc
JOIN public.clients c ON cc.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io';

-- 6. Check all users in auth.users to see if there might be multiple djoere accounts
SELECT 'ALL DJOERE ACCOUNTS' as check_type,
       id as user_id,
       email,
       created_at,
       last_sign_in_at
FROM auth.users 
WHERE email LIKE '%djoere%'
ORDER BY created_at DESC;

-- 7. Check all client_users with djoere emails
SELECT 'ALL DJOERE CLIENT USERS' as check_type,
       client_id,
       user_id,
       email,
       full_name,
       role,
       created_at
FROM public.client_users 
WHERE email LIKE '%djoere%'
ORDER BY created_at DESC; 