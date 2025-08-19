
-- First, let's check if the conversion functions exist and examine their current structure
SELECT 
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('convert_lead_to_contact', 'bulk_convert_leads_to_contacts');

-- Check current indexes on contacts table
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'contacts' AND schemaname = 'public';

-- Validate contacts table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacts' AND table_schema = 'public'
ORDER BY ordinal_position;
