-- Simple Leads Access Migration
-- This migration removes all RLS restrictions to make leads visible to all users
-- while maintaining full Lovable compatibility

-- Disable RLS on leads table to allow all access
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Users can view leads from their client" ON leads;
DROP POLICY IF EXISTS "All authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users with client access can view leads" ON leads;
DROP POLICY IF EXISTS "Users can view their campaign leads" ON leads;
DROP POLICY IF EXISTS "Users can create their campaign leads" ON leads;
DROP POLICY IF EXISTS "Users can update their campaign leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their campaign leads" ON leads;

-- Ensure the leads table has the necessary columns
DO $$
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'email'
  ) THEN
    ALTER TABLE leads ADD COLUMN email TEXT;
  END IF;
  
  -- Add company_name column if it doesn't exist (for backwards compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN company_name TEXT;
    -- Copy data from company column if it exists
    UPDATE leads SET company_name = company WHERE company_name IS NULL AND company IS NOT NULL;
  END IF;
END $$;

-- Insert test data for all users if no leads exist
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
  
  -- If no leads exist, insert comprehensive test data
  IF leads_count = 0 THEN
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
      ),
      (
        test_user_id,
        'Emma', 'Wilson', 'Sales Director', 'Global Solutions', 'Global Solutions', 'emma.wilson@globalsolutions.com', 'verified',
        '+44-20-1234567', 'https://linkedin.com/in/emmawilson', 'Consulting', 'United Kingdom', 'England', 'London',
        '501_1000', 'director', 90, 80, ARRAY['Enterprise', 'Consulting'], ARRAY['Salesforce', 'HubSpot', 'Pipedrive'], ARRAY['Enterprise', 'Consulting']
      ),
      (
        test_user_id,
        'David', 'Brown', 'VP of Engineering', 'Innovation Labs', 'Innovation Labs', 'david.brown@innovationlabs.com', 'verified',
        '+1-415-9876543', 'https://linkedin.com/in/davidbrown', 'Technology', 'United States', 'California', 'San Francisco',
        '201_500', 'vp_level', 95, 90, ARRAY['Tech', 'AI'], ARRAY['Python', 'TensorFlow', 'AWS'], ARRAY['Tech', 'AI']
      ),
      (
        test_user_id,
        'Lisa', 'Garcia', 'Product Manager', 'Growth Co', 'Growth Co', 'lisa.garcia@growthco.com', 'unverified',
        '+1-212-5550123', 'https://linkedin.com/in/lisagarcia', 'SaaS', 'United States', 'New York', 'New York',
        '51_200', 'manager', 82, 75, ARRAY['SaaS', 'Product'], ARRAY['Jira', 'Figma', 'Slack'], ARRAY['SaaS', 'Product']
      ),
      (
        test_user_id,
        'Alex', 'Thompson', 'Business Development', 'ScaleUp Ventures', 'ScaleUp Ventures', 'alex.thompson@scaleupventures.com', 'verified',
        '+31-70-1234567', 'https://linkedin.com/in/alexthompson', 'Venture Capital', 'Netherlands', 'Zuid-Holland', 'Rotterdam',
        '11_50', 'senior', 78, 70, ARRAY['VC', 'Startup'], ARRAY['CRM', 'LinkedIn'], ARRAY['VC', 'Startup']
      ),
      (
        test_user_id,
        'Maria', 'Rodriguez', 'Head of Marketing', 'Digital Agency', 'Digital Agency', 'maria.rodriguez@digitalagency.com', 'verified',
        '+34-91-9876543', 'https://linkedin.com/in/mariarodriguez', 'Marketing', 'Spain', 'Madrid', 'Madrid',
        '51_200', 'director', 88, 80, ARRAY['Marketing', 'Digital'], ARRAY['Google Ads', 'Facebook Ads', 'Analytics'], ARRAY['Marketing', 'Digital']
      );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country); 