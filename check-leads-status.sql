-- Check Leads Database Status
-- Run this in Supabase SQL Editor to verify leads table status

-- 1. Check if leads table exists and has data
SELECT 
  'leads_table_status' as check_type,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as leads_with_email
FROM leads;

-- 2. Check RLS status on leads table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'leads';

-- 3. Check sample leads data
SELECT 
  id,
  first_name,
  last_name,
  email,
  company,
  company_name,
  job_title,
  industry,
  country,
  created_at
FROM leads 
LIMIT 5;

-- 4. Check if the migration has been applied
SELECT 
  'migration_check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'company_name'
    ) THEN 'company_name column exists'
    ELSE 'company_name column missing'
  END as company_name_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'user_id'
    ) THEN 'user_id column exists'
    ELSE 'user_id column missing'
  END as user_id_status;

-- 5. If no leads exist, insert test data
DO $$
DECLARE
  leads_count INTEGER;
  test_user_id UUID;
BEGIN
  -- Count existing leads
  SELECT COUNT(*) INTO leads_count FROM leads;
  
  -- Get any user ID for test data
  SELECT id INTO test_user_id
  FROM auth.users
  LIMIT 1;
  
  -- If no leads exist, insert test data
  IF leads_count = 0 AND test_user_id IS NOT NULL THEN
    INSERT INTO leads (
      user_id, first_name, last_name, job_title, company, company_name, email, email_status,
      phone, linkedin_url, industry, country, region, city, company_size,
      management_level, lead_score, buying_intent_score, tags, technologies, company_tags
    ) VALUES 
      (
        test_user_id,
        'John', 'Doe', 'Marketing Manager', 'TechCorp', 'TechCorp', 'john.doe@techcorp.com', 'verified',
        '+31-20-1234567', 'https://linkedin.com/in/johndoe', 'Technology', 'Netherlands', 'Noord-Holland', 'Amsterdam',
        '51_200', 'manager', 85, 70, ARRAY['B2B', 'SaaS'], ARRAY['Salesforce', 'HubSpot'], ARRAY['Enterprise', 'Tech']
      ),
      (
        test_user_id,
        'Sarah', 'Johnson', 'CMO', 'Marketing Inc', 'Marketing Inc', 'sarah.j@marketing.com', 'unverified',
        '+49-30-9876543', 'https://linkedin.com/in/sarahjohnson', 'Marketing', 'Germany', 'Berlin', 'Berlin',
        '201_500', 'c_level', 92, 85, ARRAY['Enterprise', 'B2B'], ARRAY['Adobe', 'Google Analytics'], ARRAY['Marketing', 'Enterprise']
      ),
      (
        test_user_id,
        'Michael', 'Chen', 'CTO', 'DevStartup', 'DevStartup', 'michael@devstartup.com', 'verified',
        '+1-555-0123', 'https://linkedin.com/in/michaelchen', 'Technology', 'United States', 'California', 'San Francisco',
        '11_50', 'c_level', 88, 75, ARRAY['Startup', 'Tech'], ARRAY['AWS', 'Docker', 'React'], ARRAY['Startup', 'Development']
      );
    
    RAISE NOTICE 'Inserted 3 test leads for user %', test_user_id;
  ELSE
    RAISE NOTICE 'Leads already exist (count: %) or no test user found', leads_count;
  END IF;
END $$; 