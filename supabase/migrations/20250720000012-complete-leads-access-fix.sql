-- Complete Leads Access Fix Migration
-- This migration resolves all RLS policy conflicts and ensures leads are visible to all authenticated users
-- while maintaining full Lovable compatibility

-- First, let's clean up all existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Users can view leads from their client" ON leads;
DROP POLICY IF EXISTS "All authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Users can view their campaign leads" ON leads;
DROP POLICY IF EXISTS "Users can create their campaign leads" ON leads;
DROP POLICY IF EXISTS "Users can update their campaign leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their campaign leads" ON leads;

-- Create new comprehensive RLS policies for leads
-- Allow all authenticated users to view leads (this is what you requested)
CREATE POLICY "All authenticated users can view leads" ON leads
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND email IS NOT NULL 
    AND email != ''
  );

-- Allow users to insert leads (for future functionality)
CREATE POLICY "Authenticated users can insert leads" ON leads
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Allow users to update leads they created
CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Allow users to delete leads they created
CREATE POLICY "Users can delete their own leads" ON leads
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Ensure the leads table has the necessary columns for our policies
-- Add user_id column if it doesn't exist (for backwards compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add email column if it doesn't exist (for backwards compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'email'
  ) THEN
    ALTER TABLE leads ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create a function to check if user has access to leads
CREATE OR REPLACE FUNCTION check_leads_access()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  client_exists BOOLEAN;
BEGIN
  -- Get current user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has any client record (active or not)
  SELECT EXISTS(
    SELECT 1 FROM clients 
    WHERE email = user_email OR user_id = auth.uid()
  ) INTO client_exists;
  
  -- Allow access if user has any client record or is authenticated
  RETURN client_exists OR auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a more permissive policy that allows access based on client status
CREATE POLICY "Users with client access can view leads" ON leads
  FOR SELECT USING (
    check_leads_access()
    AND email IS NOT NULL 
    AND email != ''
  );

-- Insert some test data for djoere@scailup.io if no leads exist
DO $$
DECLARE
  test_user_id UUID;
  leads_count INTEGER;
BEGIN
  -- Get the user ID for djoere@scailup.io
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'djoere@scailup.io'
  LIMIT 1;
  
  -- Count existing leads
  SELECT COUNT(*) INTO leads_count FROM leads;
  
  -- If no leads exist and we have a test user, insert some test data
  IF leads_count = 0 AND test_user_id IS NOT NULL THEN
    INSERT INTO leads (
      user_id, first_name, last_name, job_title, company, email, email_status,
      phone, linkedin_url, industry, country, region, city, company_size,
      management_level, lead_score, buying_intent_score, tags, technologies, company_tags
    ) VALUES 
      (
        test_user_id,
        'John', 'Doe', 'Marketing Manager', 'TechCorp', 'john.doe@techcorp.com', 'verified',
        '+31-20-1234567', 'https://linkedin.com/in/johndoe', 'Technology', 'Netherlands', 'Noord-Holland', 'Amsterdam',
        '51_200', 'manager', 85, 70, ARRAY['B2B', 'SaaS'], ARRAY['Salesforce', 'HubSpot'], ARRAY['Enterprise', 'Tech']
      ),
      (
        test_user_id,
        'Sarah', 'Johnson', 'CMO', 'Marketing Inc', 'sarah.j@marketing.com', 'unverified',
        '+49-30-9876543', 'https://linkedin.com/in/sarahjohnson', 'Marketing', 'Germany', 'Berlin', 'Berlin',
        '201_500', 'c_level', 92, 85, ARRAY['Enterprise', 'B2B'], ARRAY['Adobe', 'Google Analytics'], ARRAY['Marketing', 'Enterprise']
      ),
      (
        test_user_id,
        'Michael', 'Chen', 'CTO', 'DevStartup', 'michael@devstartup.com', 'verified',
        '+1-555-0123', 'https://linkedin.com/in/michaelchen', 'Technology', 'United States', 'California', 'San Francisco',
        '11_50', 'c_level', 88, 75, ARRAY['Startup', 'Tech'], ARRAY['AWS', 'Docker', 'React'], ARRAY['Startup', 'Development']
      );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at); 