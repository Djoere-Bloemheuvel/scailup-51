-- Check Dependencies Status Script
-- This script verifies all tables and dependencies for enrichment and client management

-- 1. Check if all required tables exist
SELECT 
  'modules' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modules') as exists
UNION ALL
SELECT 
  'plans' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') as exists
UNION ALL
SELECT 
  'plan_credit_limits' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plan_credit_limits') as exists
UNION ALL
SELECT 
  'client_subscriptions' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_subscriptions') as exists
UNION ALL
SELECT 
  'credit_balances' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_balances') as exists
UNION ALL
SELECT 
  'credit_usage_logs' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_usage_logs') as exists
UNION ALL
SELECT 
  'users' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as exists
UNION ALL
SELECT 
  'lead_enrichment_logs' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_enrichment_logs') as exists
UNION ALL
SELECT 
  'lead_deduplication_logs' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_deduplication_logs') as exists
UNION ALL
SELECT 
  'contacts' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') as exists;

-- 2. Check modules data
SELECT '=== MODULES DATA ===' as info;
SELECT * FROM modules ORDER BY name;

-- 3. Check plans data
SELECT '=== PLANS DATA ===' as info;
SELECT 
  p.id,
  p.name,
  p.tier,
  p.billing_cycle,
  m.name as module_name,
  m.slug as module_slug
FROM plans p
JOIN modules m ON p.module_id = m.id
ORDER BY m.name, p.tier;

-- 4. Check plan credit limits
SELECT '=== PLAN CREDIT LIMITS ===' as info;
SELECT 
  pcl.id,
  pcl.credit_type,
  pcl.amount,
  pcl.period,
  pcl.carry_over,
  pcl.expires_after,
  p.name as plan_name,
  m.name as module_name
FROM plan_credit_limits pcl
JOIN plans p ON pcl.plan_id = p.id
JOIN modules m ON p.module_id = m.id
ORDER BY m.name, p.tier, pcl.credit_type;

-- 5. Check client subscriptions
SELECT '=== CLIENT SUBSCRIPTIONS ===' as info;
SELECT 
  cs.id,
  cs.start_date,
  cs.billing_day,
  cs.is_active,
  c.email as client_email,
  c.company_name as client_company,
  m.name as module_name,
  p.name as plan_name
FROM client_subscriptions cs
JOIN clients c ON cs.client_id = c.id
JOIN modules m ON cs.module_id = m.id
JOIN plans p ON cs.plan_id = p.id
ORDER BY c.email, m.name;

-- 6. Check credit balances
SELECT '=== CREDIT BALANCES ===' as info;
SELECT 
  cb.id,
  cb.credit_type,
  cb.amount,
  cb.expires_at,
  c.email as client_email,
  c.company_name as client_company,
  m.name as module_name
FROM credit_balances cb
JOIN clients c ON cb.client_id = c.id
JOIN modules m ON cb.module_id = m.id
ORDER BY c.email, m.name, cb.credit_type;

-- 7. Check credit usage logs (last 10)
SELECT '=== CREDIT USAGE LOGS (LAST 10) ===' as info;
SELECT 
  cul.id,
  cul.credit_type,
  cul.amount,
  cul.used_at,
  cul.description,
  c.email as client_email,
  m.name as module_name
FROM credit_usage_logs cul
JOIN clients c ON cul.client_id = c.id
JOIN modules m ON cul.module_id = m.id
ORDER BY cul.used_at DESC
LIMIT 10;

-- 8. Check users table
SELECT '=== USERS TABLE ===' as info;
SELECT 
  u.id,
  u.email,
  c.email as client_email,
  c.company_name as client_company
FROM users u
LEFT JOIN clients c ON u.client_id = c.id
ORDER BY u.email;

-- 9. Check lead enrichment logs (last 10)
SELECT '=== LEAD ENRICHMENT LOGS (LAST 10) ===' as info;
SELECT 
  lel.id,
  lel.enrichment_type,
  lel.status,
  lel.error_message,
  lel.created_at,
  c.email as client_email
FROM lead_enrichment_logs lel
JOIN clients c ON lel.client_id = c.id
ORDER BY lel.created_at DESC
LIMIT 10;

-- 10. Check lead deduplication logs (last 10)
SELECT '=== LEAD DEDUPLICATION LOGS (LAST 10) ===' as info;
SELECT 
  ldl.id,
  ldl.action_taken,
  ldl.created_at,
  c.email as client_email
FROM lead_deduplication_logs ldl
JOIN clients c ON ldl.client_id = c.id
ORDER BY ldl.created_at DESC
LIMIT 10;

-- 11. Check contacts table
SELECT '=== CONTACTS TABLE ===' as info;
SELECT 
  co.id,
  co.contact_date,
  co.status,
  co.notes,
  c.email as client_email,
  l.first_name,
  l.last_name,
  l.company_name
FROM contacts co
JOIN clients c ON co.client_id = c.id
JOIN leads l ON co.lead_id = l.id
ORDER BY co.contact_date DESC
LIMIT 10;

-- 12. Check leads table enrichment columns
SELECT '=== LEADS ENRICHMENT COLUMNS ===' as info;
SELECT 
  id,
  first_name,
  last_name,
  company_name,
  enrichment_status,
  enrichment_date,
  contact_status,
  contact_date,
  company_summary IS NOT NULL as has_company_summary,
  product_match_percentage IS NOT NULL as has_match_percentage,
  match_reasons IS NOT NULL as has_match_reasons,
  unique_angles IS NOT NULL as has_unique_angles,
  best_campaign_match IS NOT NULL as has_campaign_match,
  personalized_icebreaker IS NOT NULL as has_icebreaker
FROM leads
WHERE enrichment_status IS NOT NULL
ORDER BY enrichment_date DESC
LIMIT 10;

-- 13. Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 14. Check foreign key relationships
SELECT '=== FOREIGN KEY RELATIONSHIPS ===' as info;
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 15. Summary report
SELECT '=== SUMMARY REPORT ===' as info;
SELECT 
  'Total modules' as metric,
  COUNT(*) as value
FROM modules
UNION ALL
SELECT 
  'Total plans' as metric,
  COUNT(*) as value
FROM plans
UNION ALL
SELECT 
  'Total client subscriptions' as metric,
  COUNT(*) as value
FROM client_subscriptions
UNION ALL
SELECT 
  'Total credit balances' as metric,
  COUNT(*) as value
FROM credit_balances
UNION ALL
SELECT 
  'Total credit usage logs' as metric,
  COUNT(*) as value
FROM credit_usage_logs
UNION ALL
SELECT 
  'Total users' as metric,
  COUNT(*) as value
FROM users
UNION ALL
SELECT 
  'Total lead enrichment logs' as metric,
  COUNT(*) as value
FROM lead_enrichment_logs
UNION ALL
SELECT 
  'Total lead deduplication logs' as metric,
  COUNT(*) as value
FROM lead_deduplication_logs
UNION ALL
SELECT 
  'Total contacts' as metric,
  COUNT(*) as value
FROM contacts
UNION ALL
SELECT 
  'Leads needing enrichment' as metric,
  COUNT(*) as value
FROM leads
WHERE enrichment_status = 'pending' OR enrichment_status IS NULL
UNION ALL
SELECT 
  'Enriched leads' as metric,
  COUNT(*) as value
FROM leads
WHERE enrichment_status = 'enriched'; 