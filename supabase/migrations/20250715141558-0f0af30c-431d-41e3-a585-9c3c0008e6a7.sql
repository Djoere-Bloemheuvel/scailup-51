
-- Extend the existing mock leads table structure to support advanced filtering
-- Add new columns for comprehensive lead filtering

-- First, let's create some enum types for better data consistency
CREATE TYPE email_status_type AS ENUM ('verified', 'unverified', 'bounce_risk', 'unknown');
CREATE TYPE management_level_type AS ENUM ('c_level', 'vp_level', 'director', 'manager', 'senior', 'entry_level', 'intern');
CREATE TYPE company_size_type AS ENUM ('1_10', '11_50', '51_200', '201_500', '501_1000', '1001_5000', '5000_plus');

-- Create a comprehensive leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT,
  company TEXT NOT NULL,
  email TEXT,
  email_status email_status_type DEFAULT 'unknown',
  phone TEXT,
  linkedin_url TEXT,
  industry TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  company_size company_size_type,
  management_level management_level_type,
  lead_score INTEGER DEFAULT 0,
  buying_intent_score INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  company_tags TEXT[] DEFAULT '{}',
  last_contacted TIMESTAMP WITH TIME ZONE,
  in_active_campaign BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_email_status ON public.leads(email_status);
CREATE INDEX idx_leads_industry ON public.leads(industry);
CREATE INDEX idx_leads_country ON public.leads(country);
CREATE INDEX idx_leads_company_size ON public.leads(company_size);
CREATE INDEX idx_leads_management_level ON public.leads(management_level);
CREATE INDEX idx_leads_lead_score ON public.leads(lead_score);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_tags ON public.leads USING GIN(tags);
CREATE INDEX idx_leads_technologies ON public.leads USING GIN(technologies);
CREATE INDEX idx_leads_company_tags ON public.leads USING GIN(company_tags);

-- Create a function to search leads
CREATE OR REPLACE FUNCTION search_leads(search_term TEXT)
RETURNS TABLE(lead_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT id FROM public.leads
  WHERE (
    first_name ILIKE '%' || search_term || '%' OR
    last_name ILIKE '%' || search_term || '%' OR
    company ILIKE '%' || search_term || '%' OR
    job_title ILIKE '%' || search_term || '%'
  ) AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing
INSERT INTO public.leads (
  user_id, first_name, last_name, job_title, company, email, email_status,
  phone, linkedin_url, industry, country, region, city, company_size,
  management_level, lead_score, buying_intent_score, tags, technologies, company_tags
) VALUES 
  (
    (SELECT id FROM auth.users LIMIT 1),
    'John', 'Doe', 'Marketing Manager', 'TechCorp', 'john.doe@techcorp.com', 'verified',
    '+31-20-1234567', 'https://linkedin.com/in/johndoe', 'Technology', 'Netherlands', 'Noord-Holland', 'Amsterdam',
    '51_200', 'manager', 85, 70, ARRAY['B2B', 'SaaS'], ARRAY['Salesforce', 'HubSpot'], ARRAY['Enterprise', 'Tech']
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Sarah', 'Johnson', 'CMO', 'Marketing Inc', 'sarah.j@marketing.com', 'unverified',
    '+49-30-9876543', 'https://linkedin.com/in/sarahjohnson', 'Marketing', 'Germany', 'Berlin', 'Berlin',
    '201_500', 'c_level', 92, 85, ARRAY['Enterprise', 'B2B'], ARRAY['Adobe', 'Google Analytics'], ARRAY['Marketing', 'Enterprise']
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Michael', 'Chen', 'CTO', 'DevStartup', 'michael@devstartup.com', 'verified',
    '+1-555-0123', 'https://linkedin.com/in/michaelchen', 'Technology', 'United States', 'California', 'San Francisco',
    '11_50', 'c_level', 88, 75, ARRAY['Startup', 'Tech'], ARRAY['AWS', 'Docker', 'React'], ARRAY['Startup', 'Development']
  );
