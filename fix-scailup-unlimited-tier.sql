-- =====================================================
-- FIX UNLIMITED TIER FOR djoere@scailup.io
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
WHERE cu.email = 'djoere@scailup.io';

-- Check if djoere@scailup.io has any client_user link at all
SELECT 'SCAILUP.IO CLIENT CHECK' as check_type,
       COUNT(*) as linked_clients
FROM public.client_users 
WHERE email = 'djoere@scailup.io';

-- =====================================================
-- SETUP FOR djoere@scailup.io (create new client if needed)
-- =====================================================

-- 1. Create client for djoere@scailup.io if it doesn't exist
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
    'ScailUp',
    'djoere@scailup.io',
    'scailup.io',
    'Djoere Bloemheuvel',
    NOW(),
    NOW()
) ON CONFLICT (company_email) DO NOTHING
RETURNING id;

-- 2. Get the client ID for djoere@scailup.io
SELECT 'NEW CLIENT ID' as check_type, id as client_id
FROM public.clients 
WHERE company_email = 'djoere@scailup.io';

-- 3. Link djoere@scailup.io to the client
INSERT INTO public.client_users (
    client_id, 
    user_id, 
    email, 
    full_name, 
    role, 
    created_at
) VALUES (
    (SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'),
    'a499bec7-8693-4ca2-a62f-ab65a0cce4c8',
    'djoere@scailup.io',
    'Djoere Bloemheuvel',
    'admin',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    client_id = EXCLUDED.client_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 4. Set unlimited tier for all modules
INSERT INTO public.client_modules (
    client_id, 
    module, 
    tier, 
    activated_at, 
    updated_at
) VALUES 
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'lead_engine', 'unlimited', NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'marketing_engine', 'unlimited', NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'sales_engine', 'unlimited', NOW(), NOW())
ON CONFLICT (client_id, module) DO UPDATE SET
    tier = EXCLUDED.tier,
    activated_at = EXCLUDED.activated_at,
    updated_at = EXCLUDED.updated_at;

-- 5. Set up unlimited credits for all credit types
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
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'leads', 'lead_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'emails', 'marketing_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'linkedin', 'sales_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW())
ON CONFLICT (client_id, credit_type, module) DO UPDATE SET
    period_start = EXCLUDED.period_start,
    used_this_period = EXCLUDED.used_this_period,
    updated_at = EXCLUDED.updated_at;

-- 6. Log the credit setup
INSERT INTO public.credit_logs (
    client_id,
    credit_type,
    module,
    change,
    reason,
    created_at
) VALUES 
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'leads', 'lead_engine', 999999, 'Unlimited tier setup for djoere@scailup.io', NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'emails', 'marketing_engine', 999999, 'Unlimited tier setup for djoere@scailup.io', NOW()),
    ((SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io'), 'linkedin', 'sales_engine', 999999, 'Unlimited tier setup for djoere@scailup.io', NOW());

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify djoere@scailup.io setup
SELECT 
    'FINAL VERIFICATION - djoere@scailup.io' as check_type,
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
WHERE c.company_email = 'djoere@scailup.io'
ORDER BY cm.module, cc.credit_type;

-- Verify the client_user link
SELECT 
    'CLIENT USER VERIFICATION' as check_type,
    cu.client_id,
    cu.user_id, 
    cu.email,
    cu.role,
    c.company_name,
    c.company_email
FROM public.client_users cu
JOIN public.clients c ON cu.client_id = c.id
WHERE cu.email = 'djoere@scailup.io'; 