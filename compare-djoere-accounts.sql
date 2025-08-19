-- =====================================================
-- COMPARE DJOERE ACCOUNTS
-- djoere@automatrz.nl vs djoere@scailup.io
-- =====================================================

-- =====================================================
-- 1. AUTH USERS COMPARISON
-- =====================================================

SELECT 'AUTH USERS - djoere@automatrz.nl' as account, 
       id as user_id,
       email,
       created_at,
       last_sign_in_at,
       email_confirmed_at,
       phone_confirmed_at
FROM auth.users 
WHERE email = 'djoere@automatrz.nl';

SELECT 'AUTH USERS - djoere@scailup.io' as account, 
       id as user_id,
       email,
       created_at,
       last_sign_in_at,
       email_confirmed_at,
       phone_confirmed_at
FROM auth.users 
WHERE email = 'djoere@scailup.io';

-- =====================================================
-- 2. CLIENT_USERS COMPARISON
-- =====================================================

SELECT 'CLIENT USERS - djoere@automatrz.nl' as account,
       client_id,
       user_id,
       email,
       full_name,
       role,
       created_at,
       updated_at
FROM public.client_users 
WHERE email = 'djoere@automatrz.nl';

SELECT 'CLIENT USERS - djoere@scailup.io' as account,
       client_id,
       user_id,
       email,
       full_name,
       role,
       created_at,
       updated_at
FROM public.client_users 
WHERE email = 'djoere@scailup.io';

-- =====================================================
-- 3. CLIENTS COMPARISON
-- =====================================================

SELECT 'CLIENTS - djoere@automatrz.nl' as account,
       c.id as client_id,
       c.company_name,
       c.company_email,
       c.company_domain,
       c.contactpersoon,
       c.created_at,
       c.updated_at
FROM public.clients c
WHERE c.company_email = 'djoere@automatrz.nl';

SELECT 'CLIENTS - djoere@scailup.io' as account,
       c.id as client_id,
       c.company_name,
       c.company_email,
       c.company_domain,
       c.contactpersoon,
       c.created_at,
       c.updated_at
FROM public.clients c
WHERE c.company_email = 'djoere@scailup.io';

-- =====================================================
-- 4. CLIENT_MODULES COMPARISON
-- =====================================================

SELECT 'CLIENT MODULES - djoere@automatrz.nl' as account,
       cm.module,
       cm.tier,
       cm.activated_at,
       cm.updated_at,
       c.company_email
FROM public.client_modules cm
JOIN public.clients c ON cm.client_id = c.id
WHERE c.company_email = 'djoere@automatrz.nl'
ORDER BY cm.module;

SELECT 'CLIENT MODULES - djoere@scailup.io' as account,
       cm.module,
       cm.tier,
       cm.activated_at,
       cm.updated_at,
       c.company_email
FROM public.client_modules cm
JOIN public.clients c ON cm.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io'
ORDER BY cm.module;

-- =====================================================
-- 5. CLIENT_CREDITS COMPARISON
-- =====================================================

SELECT 'CLIENT CREDITS - djoere@automatrz.nl' as account,
       cc.credit_type,
       cc.module,
       cc.used_this_period,
       cc.period_start,
       cc.reset_interval,
       cc.created_at,
       cc.updated_at,
       c.company_email
FROM public.client_credits cc
JOIN public.clients c ON cc.client_id = c.id
WHERE c.company_email = 'djoere@automatrz.nl'
ORDER BY cc.credit_type, cc.module;

SELECT 'CLIENT CREDITS - djoere@scailup.io' as account,
       cc.credit_type,
       cc.module,
       cc.used_this_period,
       cc.period_start,
       cc.reset_interval,
       cc.created_at,
       cc.updated_at,
       c.company_email
FROM public.client_credits cc
JOIN public.clients c ON cc.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io'
ORDER BY cc.credit_type, cc.module;

-- =====================================================
-- 6. CREDIT_LOGS COMPARISON
-- =====================================================

SELECT 'CREDIT LOGS - djoere@automatrz.nl' as account,
       cl.credit_type,
       cl.module,
       cl.change,
       cl.reason,
       cl.created_at,
       c.company_email
FROM public.credit_logs cl
JOIN public.clients c ON cl.client_id = c.id
WHERE c.company_email = 'djoere@automatrz.nl'
ORDER BY cl.created_at DESC
LIMIT 10;

SELECT 'CREDIT LOGS - djoere@scailup.io' as account,
       cl.credit_type,
       cl.module,
       cl.change,
       cl.reason,
       cl.created_at,
       c.company_email
FROM public.credit_logs cl
JOIN public.clients c ON cl.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io'
ORDER BY cl.created_at DESC
LIMIT 10;

-- =====================================================
-- 7. SUMMARY COMPARISON
-- =====================================================

SELECT 
    'SUMMARY COMPARISON' as check_type,
    'djoere@automatrz.nl' as account,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'djoere@automatrz.nl') as auth_users_count,
    (SELECT COUNT(*) FROM public.client_users WHERE email = 'djoere@automatrz.nl') as client_users_count,
    (SELECT COUNT(*) FROM public.clients WHERE company_email = 'djoere@automatrz.nl') as clients_count,
    (SELECT COUNT(*) FROM public.client_modules cm JOIN public.clients c ON cm.client_id = c.id WHERE c.company_email = 'djoere@automatrz.nl') as modules_count,
    (SELECT COUNT(*) FROM public.client_credits cc JOIN public.clients c ON cc.client_id = c.id WHERE c.company_email = 'djoere@automatrz.nl') as credits_count;

SELECT 
    'SUMMARY COMPARISON' as check_type,
    'djoere@scailup.io' as account,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'djoere@scailup.io') as auth_users_count,
    (SELECT COUNT(*) FROM public.client_users WHERE email = 'djoere@scailup.io') as client_users_count,
    (SELECT COUNT(*) FROM public.clients WHERE company_email = 'djoere@scailup.io') as clients_count,
    (SELECT COUNT(*) FROM public.client_modules cm JOIN public.clients c ON cm.client_id = c.id WHERE c.company_email = 'djoere@scailup.io') as modules_count,
    (SELECT COUNT(*) FROM public.client_credits cc JOIN public.clients c ON cc.client_id = c.id WHERE c.company_email = 'djoere@scailup.io') as credits_count;

-- =====================================================
-- 8. CHECK FOR ANY EXISTING DATA FOR SCAILUP.IO
-- =====================================================

SELECT 'EXISTING DATA CHECK - djoere@scailup.io' as check_type,
       'auth_users' as table_name,
       COUNT(*) as record_count
FROM auth.users 
WHERE email = 'djoere@scailup.io'

UNION ALL

SELECT 'EXISTING DATA CHECK - djoere@scailup.io' as check_type,
       'client_users' as table_name,
       COUNT(*) as record_count
FROM public.client_users 
WHERE email = 'djoere@scailup.io'

UNION ALL

SELECT 'EXISTING DATA CHECK - djoere@scailup.io' as check_type,
       'clients' as table_name,
       COUNT(*) as record_count
FROM public.clients 
WHERE company_email = 'djoere@scailup.io'

UNION ALL

SELECT 'EXISTING DATA CHECK - djoere@scailup.io' as check_type,
       'client_modules' as table_name,
       COUNT(*) as record_count
FROM public.client_modules cm
JOIN public.clients c ON cm.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io'

UNION ALL

SELECT 'EXISTING DATA CHECK - djoere@scailup.io' as check_type,
       'client_credits' as table_name,
       COUNT(*) as record_count
FROM public.client_credits cc
JOIN public.clients c ON cc.client_id = c.id
WHERE c.company_email = 'djoere@scailup.io'; 