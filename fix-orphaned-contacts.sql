-- Fix orphaned contacts and test convert functionality
-- This script will clean up orphaned contacts and ensure the convert functions work

-- 1. Check for orphaned contacts (contacts without corresponding leads)
SELECT 
  'Orphaned contacts check' as check_type,
  COUNT(*) as orphaned_count
FROM contacts c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE l.id IS NULL;

-- 2. Show orphaned contacts
SELECT 
  c.id as contact_id,
  c.lead_id,
  c.notes,
  c.status,
  c.created_at
FROM contacts c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE l.id IS NULL;

-- 3. Remove orphaned contacts (uncomment if you want to clean them up)
-- DELETE FROM contacts c
-- WHERE NOT EXISTS (
--   SELECT 1 FROM leads l WHERE l.id = c.lead_id
-- );

-- 4. Create a test lead for conversion testing
INSERT INTO leads (
  id,
  first_name,
  last_name,
  email,
  company_name,
  job_title,
  industry,
  country,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test',
  'Lead',
  'test.lead@example.com',
  'Test Company',
  'Test Job Title',
  'Technology',
  'Netherlands',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 5. Get the test lead ID
SELECT 
  'Test lead created' as status,
  id as lead_id,
  first_name,
  last_name,
  email,
  company_name
FROM leads 
WHERE email = 'test.lead@example.com'
LIMIT 1;

-- 6. Test the convert function with the test lead
-- (This will be done in the frontend, but we can verify the lead exists)

-- 7. Update get_contacts_with_lead_data function to handle orphaned contacts
CREATE OR REPLACE FUNCTION get_contacts_with_lead_data()
RETURNS TABLE (
  id UUID,
  lead_id UUID,
  client_id UUID,
  contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_email TEXT,
  lead_company_name TEXT,
  lead_job_title TEXT,
  lead_industry TEXT,
  lead_country TEXT,
  lead_company_summary TEXT,
  lead_product_match_percentage INTEGER,
  lead_match_reasons TEXT[],
  lead_unique_angles TEXT[],
  lead_best_campaign_match TEXT,
  lead_personalized_icebreaker TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.lead_id,
    c.client_id,
    c.contact_date,
    c.notes,
    c.status,
    c.created_at,
    c.updated_at,
    COALESCE(l.first_name, 'Unknown') as lead_first_name,
    COALESCE(l.last_name, 'Lead') as lead_last_name,
    COALESCE(l.email, 'No email') as lead_email,
    COALESCE(l.company_name, 'Unknown Company') as lead_company_name,
    COALESCE(l.job_title, 'Unknown Title') as lead_job_title,
    COALESCE(l.industry, 'Unknown') as lead_industry,
    COALESCE(l.country, 'Unknown') as lead_country,
    COALESCE(l.company_summary, '') as lead_company_summary,
    COALESCE(l.product_match_percentage, 0) as lead_product_match_percentage,
    COALESCE(l.match_reasons, ARRAY[]::TEXT[]) as lead_match_reasons,
    COALESCE(l.unique_angles, ARRAY[]::TEXT[]) as lead_unique_angles,
    COALESCE(l.best_campaign_match, '') as lead_best_campaign_match,
    COALESCE(l.personalized_icebreaker, '') as lead_personalized_icebreaker
  FROM contacts c
  LEFT JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id IN (
    SELECT cl.id FROM clients cl 
    JOIN users u ON cl.id = u.client_id 
    WHERE u.id = auth.uid()
  )
  ORDER BY c.contact_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Test the updated function
SELECT 
  'Updated function test' as test_name,
  COUNT(*) as contacts_found
FROM get_contacts_with_lead_data();

-- 9. Show final status
SELECT 
  'Final status' as status_type,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM contacts) as total_contacts,
  (SELECT COUNT(*) FROM get_contacts_with_lead_data()) as contacts_with_data; 