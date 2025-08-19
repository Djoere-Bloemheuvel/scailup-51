-- =====================================================
-- SETUP UNLIMITED TIER FOR BOTH USERS
-- djoere@automatrz.nl (UID: cfe7feaf-bc26-44a5-9ff5-432992ac6f45)
-- djoere@scailup.io (UID: a499bec7-8693-4ca2-a62f-ab65a0cce4c8)
-- =====================================================

-- First, let's check the current status for both users
SELECT 'CURRENT STATUS - djoere@automatrz.nl' as check_type, 
       cu.client_id,
       cu.user_id, 
       cu.email,
       cu.role,
       c.company_name,
       c.company_email
FROM public.client_users cu
JOIN public.clients c ON cu.client_id = c.id
WHERE cu.email = 'djoere@automatrz.nl';

SELECT 'CURRENT STATUS - djoere@scailup.io' as check_type, 
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
-- SETUP FOR djoere@automatrz.nl (existing client)
-- =====================================================

-- Update the existing client for djoere@automatrz.nl
UPDATE public.clients 
SET 
    company_name = 'Automatrz',
    company_email = 'djoere@automatrz.nl',
    company_domain = 'automatrz.nl',
    contactpersoon = 'Djoere Bloemheuvel',
    updated_at = NOW()
WHERE id = '2325db91-16dc-4589-b00d-d9a081dbd461';

-- Set unlimited tier for all modules (automatrz)
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

-- Set up unlimited credits for all credit types (automatrz)
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

-- =====================================================
-- SETUP FOR djoere@scailup.io (create new client if needed)
-- =====================================================

-- Create client for djoere@scailup.io if it doesn't exist
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

-- Get the client ID for djoere@scailup.io (run this separately if needed)
-- SELECT id FROM public.clients WHERE company_email = 'djoere@scailup.io';

-- Link djoere@scailup.io to the client
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

-- Set unlimited tier for all modules (scailup.io)
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

-- Set up unlimited credits for all credit types (scailup.io)
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

-- =====================================================
-- LOG CREDIT SETUP FOR BOTH USERS
-- =====================================================

-- Log for djoere@automatrz.nl
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

-- Log for djoere@scailup.io
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
-- FINAL VERIFICATION
-- =====================================================

-- Verify djoere@automatrz.nl setup
SELECT 
    'FINAL VERIFICATION - djoere@automatrz.nl' as check_type,
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