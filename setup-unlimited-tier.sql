-- =====================================================
-- SETUP UNLIMITED TIER FOR djoere@automatrz.nl
-- =====================================================

-- First, let's check what already exists
-- =====================================================

-- 1. Check if user exists in auth.users
SELECT 'AUTH USER CHECK' as check_type, id, email, created_at 
FROM auth.users 
WHERE email = 'djoere@automatrz.nl';

-- 2. Check if client exists
SELECT 'CLIENT CHECK' as check_type, id, company_name, company_email, created_at 
FROM public.clients 
WHERE company_email = 'djoere@automatrz.nl';

-- 3. Check if user is linked to client
SELECT 'CLIENT USER CHECK' as check_type, client_id, user_id, email, role, created_at 
FROM public.client_users 
WHERE email = 'djoere@automatrz.nl';

-- 4. Check existing modules (if client exists)
SELECT 'MODULES CHECK' as check_type, module, tier, activated_at 
FROM public.client_modules cm
JOIN public.clients c ON cm.client_id = c.id
WHERE c.company_email = 'djoere@automatrz.nl';

-- 5. Check existing credits (if client exists)
SELECT 'CREDITS CHECK' as check_type, credit_type, module, used_this_period, period_start 
FROM public.client_credits cc
JOIN public.clients c ON cc.client_id = c.id
WHERE c.company_email = 'djoere@automatrz.nl';

-- =====================================================
-- NOW EXECUTE THE SETUP (uncomment the section you need)
-- =====================================================

/*
-- OPTION 1: If user exists in auth but no client exists
-- =====================================================

-- Create client
INSERT INTO public.clients (
    id,
    company_name,
    company_email,
    company_domain,
    contactpersoon,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Automatrz',
    'djoere@automatrz.nl',
    'automatrz.nl',
    'Djoere Bloemheuvel',
    NOW(),
    NOW()
) RETURNING id;

-- Then link user to client (replace USER_ID with actual user ID from auth.users)
-- INSERT INTO public.client_users (client_id, user_id, email, full_name, role, created_at) 
-- VALUES ('CLIENT_ID_FROM_ABOVE', 'USER_ID_FROM_AUTH', 'djoere@automatrz.nl', 'Djoere Bloemheuvel', 'admin', NOW());

-- Then continue with modules and credits setup below
*/

/*
-- OPTION 2: If client already exists, just update it
-- =====================================================

-- Update client
UPDATE public.clients 
SET updated_at = NOW() 
WHERE company_email = 'djoere@automatrz.nl';

-- Link user to client (replace USER_ID with actual user ID from auth.users)
-- INSERT INTO public.client_users (client_id, user_id, email, full_name, role, created_at) 
-- VALUES ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'USER_ID_FROM_AUTH', 'djoere@automatrz.nl', 'Djoere Bloemheuvel', 'admin', NOW())
-- ON CONFLICT (user_id) DO UPDATE SET client_id = EXCLUDED.client_id, email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();
*/

/*
-- OPTION 3: Complete setup with unlimited tier (after client and user are linked)
-- =====================================================

-- Set unlimited tier for all modules
INSERT INTO public.client_modules (
    client_id, 
    module, 
    tier, 
    activated_at, 
    updated_at
) VALUES 
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'lead_engine', 'unlimited', NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'marketing_engine', 'unlimited', NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'sales_engine', 'unlimited', NOW(), NOW())
ON CONFLICT (client_id, module) DO UPDATE SET
    tier = EXCLUDED.tier,
    activated_at = EXCLUDED.activated_at,
    updated_at = EXCLUDED.updated_at;

-- Set up unlimited credits for all credit types
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
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'leads', 'lead_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'emails', 'marketing_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'linkedin', 'sales_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW())
ON CONFLICT (client_id, credit_type, module) DO UPDATE SET
    period_start = EXCLUDED.period_start,
    used_this_period = EXCLUDED.used_this_period,
    updated_at = EXCLUDED.updated_at;

-- Log the credit setup
INSERT INTO public.credit_logs (
    client_id,
    credit_type,
    module,
    change,
    reason,
    created_at
) VALUES 
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'leads', 'lead_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'emails', 'marketing_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@automatrz.nl'), 'linkedin', 'sales_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW());
*/

-- =====================================================
-- VERIFICATION QUERY (run this after setup)
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
WHERE c.company_email = 'djoere@automatrz.nl'
ORDER BY cm.module, cc.credit_type; 