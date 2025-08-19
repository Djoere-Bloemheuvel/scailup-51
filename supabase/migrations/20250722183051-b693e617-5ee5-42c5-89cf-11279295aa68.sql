-- Revert leads table to its original state

-- First, drop policies that might be referencing the leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads from their client" ON public.leads;
DROP POLICY IF EXISTS "All authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users with client access can view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their client leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads for their client" ON public.leads;
DROP POLICY IF EXISTS "Users can update their client leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their client leads" ON public.leads;

-- Recreate the leads table with the original structure from migration 20250715141558
DROP TABLE IF EXISTS public.leads CASCADE;

-- Recreate the enum types
DROP TYPE IF EXISTS email_status_type CASCADE;
DROP TYPE IF EXISTS management_level_type CASCADE;
DROP TYPE IF EXISTS company_size_type CASCADE;

CREATE TYPE email_status_type AS ENUM ('verified', 'unverified', 'bounce_risk', 'unknown');
CREATE TYPE management_level_type AS ENUM ('c_level', 'vp_level', 'director', 'manager', 'senior', 'entry_level', 'intern');
CREATE TYPE company_size_type AS ENUM ('1_10', '11_50', '51_200', '201_500', '501_1000', '1001_5000', '5000_plus');

-- Create the leads table with the original structure
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

-- Recreate the search_leads function
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