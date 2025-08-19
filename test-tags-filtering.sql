-- Test Tags Filtering Functionality
-- This script tests the new tags filtering system

-- 1. Check current tags data
SELECT '=== CURRENT TAGS DATA ===' as info;
SELECT 
  id,
  first_name,
  last_name,
  tags,
  tags_normalized,
  CASE 
    WHEN tags IS NULL THEN 'NULL'
    WHEN tags = '' THEN 'EMPTY'
    WHEN tags = 'null' THEN 'NULL_STRING'
    WHEN tags = '""' THEN 'EMPTY_JSON'
    WHEN tags ~ '^\[.*\]$' THEN 'JSON_ARRAY'
    WHEN tags LIKE '%,%' THEN 'COMMA_SEPARATED'
    ELSE 'SINGLE_VALUE'
  END as tags_format
FROM leads 
WHERE email IS NOT NULL AND email != ''
LIMIT 10;

-- 2. Test get_unique_tags function
SELECT '=== UNIQUE TAGS ===' as info;
SELECT * FROM get_unique_tags();

-- 3. Test tag statistics
SELECT '=== TAG STATISTICS ===' as info;
SELECT * FROM get_tag_statistics();

-- 4. Test search_leads_by_tags function
SELECT '=== SEARCH LEADS BY TAGS ===' as info;
SELECT 
  l.id,
  l.first_name,
  l.last_name,
  l.company_name,
  l.tags_normalized
FROM leads l
WHERE l.id IN (
  SELECT lead_id FROM search_leads_by_tags(ARRAY['B2B', 'SaaS'])
)
AND l.email IS NOT NULL AND l.email != '';

-- 5. Test exclude_leads_by_tags function
SELECT '=== EXCLUDE LEADS BY TAGS ===' as info;
SELECT 
  l.id,
  l.first_name,
  l.last_name,
  l.company_name,
  l.tags_normalized
FROM leads l
WHERE l.id IN (
  SELECT lead_id FROM exclude_leads_by_tags(ARRAY['Startup'])
)
AND l.email IS NOT NULL AND l.email != '';

-- 6. Test normalize_tags_to_jsonb function
SELECT '=== NORMALIZE TAGS FUNCTION ===' as info;
SELECT 
  'comma-separated' as test_type,
  'consultancy,project management,strategic advice' as input,
  normalize_tags_to_jsonb('consultancy,project management,strategic advice') as output
UNION ALL
SELECT 
  'json-array' as test_type,
  '["B2B", "SaaS", "Marketing"]' as input,
  normalize_tags_to_jsonb('["B2B", "SaaS", "Marketing"]') as output
UNION ALL
SELECT 
  'empty' as test_type,
  '' as input,
  normalize_tags_to_jsonb('') as output
UNION ALL
SELECT 
  'null' as test_type,
  'null' as input,
  normalize_tags_to_jsonb('null') as output;

-- 7. Check indexes
SELECT '=== INDEXES ===' as info;
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'leads' 
  AND indexname LIKE '%tags%';

-- 8. Test trigger functionality
SELECT '=== TRIGGER TEST ===' as info;
-- Insert a test record to see if trigger works
INSERT INTO leads (
  first_name, last_name, job_title, company_name, email,
  industry, country, employee_count, tags
) VALUES (
  'Test', 'User', 'Developer', 'Test Company', 'test@example.com',
  'Technology', 'Netherlands', 50, '["test", "development", "coding"]'
) ON CONFLICT (email) DO NOTHING;

-- Check if tags_normalized was set
SELECT 
  first_name,
  last_name,
  tags,
  tags_normalized
FROM leads 
WHERE email = 'test@example.com';

-- 9. Summary report
SELECT '=== SUMMARY REPORT ===' as info;
SELECT 
  'Total leads' as metric,
  COUNT(*) as value
FROM leads 
WHERE email IS NOT NULL AND email != ''
UNION ALL
SELECT 
  'Leads with tags' as metric,
  COUNT(*) as value
FROM leads 
WHERE tags IS NOT NULL 
  AND tags != '' 
  AND tags != 'null'
  AND email IS NOT NULL 
  AND email != ''
UNION ALL
SELECT 
  'Leads with normalized tags' as metric,
  COUNT(*) as value
FROM leads 
WHERE tags_normalized IS NOT NULL 
  AND jsonb_array_length(tags_normalized) > 0
  AND email IS NOT NULL 
  AND email != ''
UNION ALL
SELECT 
  'Unique tags count' as metric,
  COUNT(*) as value
FROM get_unique_tags(); 