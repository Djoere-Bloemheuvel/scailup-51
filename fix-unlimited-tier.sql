-- =====================================================
-- FIX UNLIMITED TIER FOR djoere@automatrz.nl
-- Based on existing client_user link found
-- =====================================================

-- First, let's see what client this user is currently linked to
SELECT 'CURRENT CLIENT LINK' as check_type, 
       cu.client_id,
       cu.user_id, 
       cu.email,
       cu.role,
       c.company_name,
       c.company_email
FROM public.client_users cu
JOIN public.clients c ON cu.client_id = c.id
WHERE cu.email = 'djoere@automatrz.nl';

-- Now let's check what modules and credits already exist for this client
SELECT 'EXISTING MODULES' as check_type,
       cm.module,
       cm.tier,
       cm.activated_at
FROM public.client_modules cm
WHERE cm.client_id = '2325db91-16dc-4589-b00d-d9a081dbd461';

SELECT 'EXISTING CREDITS' as check_type,
       cc.credit_type,
       cc.module,
       cc.used_this_period,
       cc.period_start
FROM public.client_credits cc
WHERE cc.client_id = '2325db91-16dc-4589-b00d-d9a081dbd461';

-- =====================================================
-- SETUP UNLIMITED TIER (using existing client_id)
-- =====================================================

-- 1. Update the client to have the correct company info
UPDATE public.clients 
SET 
    company_name = 'Automatrz',
    company_email = 'djoere@automatrz.nl',
    company_domain = 'automatrz.nl',
    contactpersoon = 'Djoere Bloemheuvel',
    updated_at = NOW()
WHERE id = '2325db91-16dc-4589-b00d-d9a081dbd461';

-- 2. Set unlimited tier for all modules
INSERT INTO public.client_modules (
    client_id, 
    module, 
    tier, 
    activated_at, 
    updated_at
) VALUES 
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'lead_engine', 'unlimited', NOW(), NOW()),
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'marketing_engine', 'unlimited', NOW(), NOW()),
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'sales_engine', 'unlimited', NOW(), NOW())
ON CONFLICT (client_id, module) DO UPDATE SET
    tier = EXCLUDED.tier,
    activated_at = EXCLUDED.activated_at,
    updated_at = EXCLUDED.updated_at;

-- 3. Set up unlimited credits for all credit types
INSERT INTO public.client_credits (
    client_id,
    credit_type,
    module,
    period_start,
    reset_interval,
    used_this_period,
    created_at,
    updated_at
) VALUES 
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'leads', 'lead_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()),
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'emails', 'marketing_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()),
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'linkedin', 'sales_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW())
ON CONFLICT (client_id, credit_type, module) DO UPDATE SET
    period_start = EXCLUDED.period_start,
    used_this_period = EXCLUDED.used_this_period,
    updated_at = EXCLUDED.updated_at;

-- 4. Log the credit setup
INSERT INTO public.credit_logs (
    client_id,
    credit_type,
    module,
    change,
    reason,
    created_at
) VALUES 
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'leads', 'lead_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW()),
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'emails', 'marketing_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW()),
    ('2325db91-16dc-4589-b00d-d9a081dbd461', 'linkedin', 'sales_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW());

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 
    'FINAL VERIFICATION' as check_type,
    c.company_name,
    c.company_email,
    cm.module,
    cm.tier,
    cm.activated_at,
    cc.credit_type,
    cc.used_this_period,
    cc.period_start
FROM public.clients c
JOIN public.client_modules cm ON c.id = cm.client_id
JOIN public.client_credits cc ON c.id = cc.client_id AND cm.module = cc.module
WHERE c.id = '2325db91-16dc-4589-b00d-d9a081dbd461'
ORDER BY cm.module, cc.credit_type; 

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

-- 4. Check all users in auth.users to see if there might be multiple djoere accounts
SELECT 'ALL DJOERE ACCOUNTS' as check_type,
       id as user_id,
       email,
       created_at,
       last_sign_in_at
FROM auth.users 
WHERE email LIKE '%djoere%'
ORDER BY created_at DESC;

-- 5. Check all client_users with djoere emails
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