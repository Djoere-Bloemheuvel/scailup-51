-- Restore complete database structure to match expected state
-- This restores missing tables and columns based on migration history

-- Create users table that links auth users to clients
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own record" 
  ON public.users 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own record" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own record" 
  ON public.users 
  FOR UPDATE 
  USING (id = auth.uid());

-- Add missing columns to credit_balances
ALTER TABLE public.credit_balances 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS campaign_ids UUID[],
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'new';

-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'linkedin',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaigns table
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaigns
CREATE POLICY "Users can view their client campaigns" 
  ON public.campaigns 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.client_id = campaigns.client_id
  ));

-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  job_title TEXT,
  status TEXT DEFAULT 'enriching',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Users can view their client contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.client_id = contacts.client_id
  ));

-- Create webhook_configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  webhook_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_name TEXT,
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, webhook_type)
);

-- Enable RLS on webhook_configs table
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Fix RLS policies to prevent infinite recursion
-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Users can access clients by email or client_id" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients during registration" ON public.clients;
DROP POLICY IF EXISTS "Users can update their linked client" ON public.clients;

-- Create security definer function to get current client ID
CREATE OR REPLACE FUNCTION public.get_current_client_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT client_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- Create new safe RLS policies for clients
CREATE POLICY "Users can view their own client" 
  ON public.clients 
  FOR SELECT 
  USING (id = public.get_current_client_id() OR admin = true);

CREATE POLICY "Users can update their own client" 
  ON public.clients 
  FOR UPDATE 
  USING (id = public.get_current_client_id());

-- Update leads RLS policy to work with client relationship
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
CREATE POLICY "Users can view leads from their client" ON public.leads
  FOR SELECT USING (
    user_id IN (
      SELECT u.id FROM users u 
      JOIN clients c ON u.client_id = c.id 
      WHERE c.id = public.get_current_client_id()
    )
    AND email IS NOT NULL 
    AND email != ''
    AND is_duplicate = FALSE
  );

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_users_client_id ON public.users(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON public.contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON public.contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_is_duplicate ON public.leads(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_leads_enrichment_status ON public.leads(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON public.leads(contact_status);

-- Create necessary functions for lead conversion
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(
  p_lead_id UUID,
  p_client_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_contact_id UUID;
  v_lead RECORD;
BEGIN
  -- Get client ID if not provided
  IF p_client_id IS NULL THEN
    SELECT get_current_client_id() INTO v_client_id;
  ELSE
    v_client_id := p_client_id;
  END IF;
  
  -- Get lead data
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;
  
  -- Create contact
  INSERT INTO contacts (
    client_id,
    lead_id,
    email,
    first_name,
    last_name,
    company,
    job_title,
    status
  ) VALUES (
    v_client_id,
    p_lead_id,
    v_lead.email,
    v_lead.first_name,
    v_lead.last_name,
    v_lead.company,
    v_lead.job_title,
    'enriching'
  ) RETURNING id INTO v_contact_id;
  
  RETURN v_contact_id;
END;
$$;