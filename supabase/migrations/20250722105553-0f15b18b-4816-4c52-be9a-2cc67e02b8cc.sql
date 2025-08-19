-- Make contacts table structure identical to leads table
-- Add all missing columns from leads to contacts table

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT, -- Using TEXT since USER-DEFINED types can be complex
ADD COLUMN IF NOT EXISTS management_level TEXT, -- Using TEXT since USER-DEFINED types can be complex
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS buying_intent_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS in_active_campaign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_ids UUID[],
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'unknown';

-- Also ensure leads table has client_id as NOT NULL and properly referenced
UPDATE public.leads SET client_id = (
  SELECT id FROM clients WHERE email = 'djoere@scailup.io' LIMIT 1
) WHERE client_id IS NULL;

-- Make client_id NOT NULL in leads
ALTER TABLE public.leads ALTER COLUMN client_id SET NOT NULL;

-- Create missing essential tables that might be referenced

-- Create profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  is_admin BOOLEAN DEFAULT false,
  is_super_admin BOOLEAN DEFAULT false,
  credits INTEGER DEFAULT 0,
  unlimited_credits BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can manage their own settings" 
  ON public.user_settings 
  FOR ALL
  USING (user_id = auth.uid());

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_logs (only admins can access)
CREATE POLICY "Admins can view admin logs" 
  ON public.admin_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND (p.is_admin = true OR p.is_super_admin = true)
  ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_linkedin_url ON public.contacts(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_contacts_industry ON public.contacts(industry);
CREATE INDEX IF NOT EXISTS idx_contacts_country ON public.contacts(country);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON public.contacts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_technologies ON public.contacts USING gin(technologies);
CREATE INDEX IF NOT EXISTS idx_contacts_company_tags ON public.contacts USING gin(company_tags);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON public.contacts(lead_score);
CREATE INDEX IF NOT EXISTS idx_contacts_buying_intent_score ON public.contacts(buying_intent_score);
CREATE INDEX IF NOT EXISTS idx_contacts_enrichment_status ON public.contacts(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_contacts_email_status ON public.contacts(email_status);