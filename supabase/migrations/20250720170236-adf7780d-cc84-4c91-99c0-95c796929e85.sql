
-- Fix RLS policies for leads table to allow all authenticated users to view leads
-- This ensures leads are visible on the database page

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;

-- Create new policy that allows all authenticated users to view leads with email addresses
CREATE POLICY "All authenticated users can view leads with emails" ON leads
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND email IS NOT NULL 
    AND email != ''
  );

-- Allow authenticated users to insert leads (for future functionality)
CREATE POLICY "Authenticated users can insert leads" ON leads
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Allow users to update leads they created (if user_id is set)
CREATE POLICY "Users can update leads they created" ON leads
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id)
  );

-- Allow users to delete leads they created (if user_id is set)  
CREATE POLICY "Users can delete leads they created" ON leads
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id)
  );

-- Add some test leads if the table is empty
DO $$
DECLARE
  leads_count INTEGER;
  current_user_id UUID;
BEGIN
  -- Count existing leads
  SELECT COUNT(*) INTO leads_count FROM leads WHERE email IS NOT NULL AND email != '';
  
  -- Get current user ID
  SELECT auth.uid() INTO current_user_id;
  
  -- If no leads with emails exist, insert test data
  IF leads_count = 0 AND current_user_id IS NOT NULL THEN
    INSERT INTO leads (
      user_id, first_name, last_name, job_title, company_name, email, 
      linkedin_url, industry, country, city, employee_count, 
      email_valid, tags, created_at, updated_at
    ) VALUES 
      (
        current_user_id,
        'John', 'Doe', 'Marketing Manager', 'TechCorp Solutions', 'john.doe@techcorp.com',
        'https://linkedin.com/in/johndoe', 'Technology', 'Netherlands', 'Amsterdam',
        150, true, '["B2B", "SaaS", "Marketing"]'::jsonb, NOW(), NOW()
      ),
      (
        current_user_id,
        'Sarah', 'Johnson', 'Chief Marketing Officer', 'Digital Innovations BV', 'sarah.johnson@digitalinnovations.nl',
        'https://linkedin.com/in/sarahjohnson', 'Marketing & Advertising', 'Netherlands', 'Rotterdam',
        75, true, '["Enterprise", "B2B", "Digital"]'::jsonb, NOW(), NOW()
      ),
      (
        current_user_id,
        'Michael', 'Chen', 'CTO', 'StartupTech', 'michael.chen@startuptech.com',
        'https://linkedin.com/in/michaelchen', 'Software Development', 'Germany', 'Berlin',
        25, true, '["Startup", "Tech", "Software"]'::jsonb, NOW(), NOW()
      ),
      (
        current_user_id,
        'Emma', 'Williams', 'Sales Director', 'SalesForce Europe', 'emma.williams@salesforce-eu.com',
        'https://linkedin.com/in/emmawilliams', 'Sales & CRM', 'United Kingdom', 'London',
        500, true, '["Sales", "CRM", "Enterprise"]'::jsonb, NOW(), NOW()
      ),
      (
        current_user_id,
        'Lars', 'Nielsen', 'Product Manager', 'Nordic Solutions AB', 'lars.nielsen@nordicsolutions.se',
        'https://linkedin.com/in/larsnielsen', 'Product Management', 'Sweden', 'Stockholm',
        200, true, '["Product", "B2B", "Nordic"]'::jsonb, NOW(), NOW()
      );
    
    RAISE NOTICE 'Inserted 5 test leads for demonstration';
  END IF;
END $$;
