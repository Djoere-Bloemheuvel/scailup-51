
-- Complete Database Restoration to Commit 5d01336 State
-- This migration restores ALL missing tables, columns, functions, triggers, and RLS policies

-- 1. MISSING TABLES AND THEIR COMPLETE STRUCTURE

-- Create pending_registrations table (was missing)
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_configs table with ALL original columns
CREATE TABLE IF NOT EXISTS public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  webhook_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_name TEXT,
  headers JSONB DEFAULT '{"Content-Type": "application/json"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, webhook_type)
);

-- Create credit_usage_logs table (was missing)
CREATE TABLE IF NOT EXISTS public.credit_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_executions table (was missing)
CREATE TABLE IF NOT EXISTS public.webhook_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  webhook_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. ADD ALL MISSING COLUMNS TO EXISTING TABLES

-- Complete contacts table structure
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS management_level TEXT,
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
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure leads table has ALL necessary columns
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS company_summary TEXT,
ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS match_reasons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unique_angles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_campaign_match TEXT,
ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Complete clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- 3. ENABLE RLS ON ALL TABLES
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_executions ENABLE ROW LEVEL SECURITY;

-- 4. CREATE ALL MISSING RLS POLICIES

-- Pending registrations policies (public access for registration flow)
CREATE POLICY "Public access for registration flow" 
  ON public.pending_registrations 
  FOR ALL
  USING (true);

-- Contacts policies (missing INSERT, UPDATE, DELETE)
CREATE POLICY "Users can insert contacts for their client" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (client_id = public.get_current_client_id());

CREATE POLICY "Users can update their client contacts" 
  ON public.contacts 
  FOR UPDATE 
  USING (client_id = public.get_current_client_id());

CREATE POLICY "Users can delete their client contacts" 
  ON public.contacts 
  FOR DELETE 
  USING (client_id = public.get_current_client_id());

-- Credit usage logs policies
CREATE POLICY "Users can view their client credit logs" 
  ON public.credit_usage_logs 
  FOR SELECT 
  USING (client_id = public.get_current_client_id());

CREATE POLICY "System can create credit logs" 
  ON public.credit_usage_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Webhook executions policies
CREATE POLICY "Users can view their webhook executions" 
  ON public.webhook_executions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.webhook_configs wc 
    WHERE wc.id = webhook_executions.webhook_config_id 
    AND wc.client_id = public.get_current_client_id()
  ));

-- Campaigns policies (missing INSERT, UPDATE, DELETE)
CREATE POLICY "Users can manage their client campaigns" 
  ON public.campaigns 
  FOR ALL
  USING (client_id = public.get_current_client_id());

-- 5. CREATE ALL MISSING DATABASE FUNCTIONS

-- Convert lead to contact function (CORE FUNCTIONALITY)
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(
  p_lead_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_id UUID;
  v_client_id UUID;
  v_lead RECORD;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT * INTO v_lead 
  FROM leads 
  WHERE id = p_lead_id 
    AND client_id = v_client_id
    AND email IS NOT NULL 
    AND email != '';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found or invalid';
  END IF;
  
  -- Check if contact already exists
  IF EXISTS (
    SELECT 1 FROM contacts 
    WHERE lead_id = p_lead_id 
      AND client_id = v_client_id
  ) THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Create contact with ALL lead data
  INSERT INTO contacts (
    client_id,
    lead_id,
    email,
    first_name,
    last_name,
    company,
    job_title,
    phone,
    linkedin_url,
    industry,
    country,
    region,
    city,
    company_size,
    management_level,
    lead_score,
    buying_intent_score,
    tags,
    technologies,
    company_tags,
    employee_count,
    notes,
    status,
    enrichment_status,
    contact_status,
    email_status
  ) VALUES (
    v_client_id,
    p_lead_id,
    v_lead.email,
    v_lead.first_name,
    v_lead.last_name,
    v_lead.company,
    v_lead.job_title,
    v_lead.phone,
    v_lead.linkedin_url,
    v_lead.industry,
    v_lead.country,
    v_lead.region,
    v_lead.city,
    v_lead.company_size,
    v_lead.management_level,
    v_lead.lead_score,
    v_lead.buying_intent_score,
    v_lead.tags,
    v_lead.technologies,
    v_lead.company_tags,
    v_lead.employee_count,
    p_notes,
    'active',
    'enriching',
    'new',
    v_lead.email_status
  ) RETURNING id INTO v_contact_id;
  
  -- Log credit usage
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
  VALUES (v_client_id, 'contact_conversion', 1, 'Lead converted to contact', v_contact_id);
  
  -- Log contact activity
  INSERT INTO contact_activities (
    contact_id,
    client_id,
    activity_type,
    activity_title,
    activity_description,
    created_by
  ) VALUES (
    v_contact_id,
    v_client_id,
    'lead_converted',
    'Lead Converted to Contact',
    'Lead was successfully converted to contact',
    auth.uid()
  );
  
  RETURN v_contact_id;
END;
$$;

-- Get contacts with lead data function
CREATE OR REPLACE FUNCTION public.get_contacts_with_lead_data()
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
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    COALESCE(l.first_name, c.first_name) as lead_first_name,
    COALESCE(l.last_name, c.last_name) as lead_last_name,
    COALESCE(l.email, c.email) as lead_email,
    COALESCE(l.company, c.company) as lead_company_name,
    COALESCE(l.job_title, c.job_title) as lead_job_title,
    COALESCE(l.industry, c.industry) as lead_industry,
    COALESCE(l.country, c.country) as lead_country,
    l.company_summary as lead_company_summary,
    l.product_match_percentage as lead_product_match_percentage,
    l.match_reasons as lead_match_reasons,
    l.unique_angles as lead_unique_angles,
    l.best_campaign_match as lead_best_campaign_match,
    l.personalized_icebreaker as lead_personalized_icebreaker
  FROM contacts c
  LEFT JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id = public.get_current_client_id()
  ORDER BY c.contact_date DESC;
END;
$$;

-- Bulk convert function
CREATE OR REPLACE FUNCTION public.bulk_convert_leads_to_contacts(
  p_lead_ids UUID[],
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  lead_id UUID,
  contact_id UUID,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id UUID;
  v_contact_id UUID;
  v_client_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Process each lead
  FOREACH v_lead_id IN ARRAY p_lead_ids
  LOOP
    BEGIN
      -- Try to convert each lead
      SELECT convert_lead_to_contact(v_lead_id, p_notes) INTO v_contact_id;
      RETURN QUERY SELECT v_lead_id, v_contact_id, true, NULL::TEXT;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT v_lead_id, NULL::UUID, false, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Webhook functions
CREATE OR REPLACE FUNCTION public.get_webhook_configs()
RETURNS TABLE(
  id UUID,
  client_id UUID,
  webhook_type TEXT,
  webhook_url TEXT,
  webhook_name TEXT,
  headers JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wc.id,
    wc.client_id,
    wc.webhook_type,
    wc.webhook_url,
    wc.webhook_name,
    wc.headers,
    wc.is_active,
    wc.created_at,
    wc.updated_at
  FROM webhook_configs wc
  WHERE wc.client_id = public.get_current_client_id()
  ORDER BY wc.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_webhook_config(
  p_webhook_type TEXT,
  p_webhook_url TEXT,
  p_webhook_name TEXT,
  p_headers JSONB DEFAULT '{"Content-Type": "application/json"}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_webhook_id UUID;
BEGIN
  SELECT get_current_client_id() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  INSERT INTO webhook_configs (
    client_id, 
    webhook_type, 
    webhook_url, 
    webhook_name, 
    headers, 
    is_active
  )
  VALUES (
    v_client_id,
    p_webhook_type,
    p_webhook_url,
    p_webhook_name,
    p_headers,
    true
  )
  ON CONFLICT (client_id, webhook_type) DO UPDATE SET
    webhook_url = EXCLUDED.webhook_url,
    webhook_name = EXCLUDED.webhook_name,
    headers = EXCLUDED.headers,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING id INTO v_webhook_id;
  
  RETURN v_webhook_id;
END;
$$;

-- Contact activity functions
CREATE OR REPLACE FUNCTION public.log_contact_activity(
  p_contact_id UUID,
  p_activity_type TEXT,
  p_activity_title TEXT,
  p_activity_description TEXT DEFAULT NULL,
  p_activity_outcome TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
  v_client_id UUID;
BEGIN
  SELECT get_current_client_id() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  INSERT INTO contact_activities (
    contact_id,
    client_id,
    activity_type,
    activity_title,
    activity_description,
    activity_outcome,
    created_by,
    metadata
  ) VALUES (
    p_contact_id,
    v_client_id,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_activity_outcome,
    auth.uid(),
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Add missing columns to contact_activities
ALTER TABLE public.contact_activities 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS activity_title TEXT,
ADD COLUMN IF NOT EXISTS activity_description TEXT,
ADD COLUMN IF NOT EXISTS activity_outcome TEXT,
ADD COLUMN IF NOT EXISTS activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update contact_activities structure
ALTER TABLE public.contact_activities 
RENAME COLUMN created_by TO created_by_user_id;

-- Fix contact_activities RLS policies
DROP POLICY IF EXISTS "Users can view their client contact activities" ON public.contact_activities;
DROP POLICY IF EXISTS "Users can create contact activities for their client" ON public.contact_activities;

CREATE POLICY "Users can view their client contact activities" 
  ON public.contact_activities 
  FOR SELECT 
  USING (client_id = public.get_current_client_id());

CREATE POLICY "Users can create contact activities for their client" 
  ON public.contact_activities 
  FOR INSERT 
  WITH CHECK (client_id = public.get_current_client_id());

-- 6. CREATE ALL MISSING INDEXES
CREATE INDEX IF NOT EXISTS idx_pending_registrations_token ON public.pending_registrations(token);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_client_id ON public.webhook_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_type ON public.webhook_configs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_client_id ON public.credit_usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_webhook_config_id ON public.webhook_executions(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON public.contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON public.contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON public.leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 7. INSERT DEFAULT WEBHOOK CONFIGURATION
INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers, is_active)
SELECT 
  c.id as client_id,
  'n8n' as webhook_type,
  'https://djoere.app.n8n.cloud/webhook-test/53666597-5d52-417e-924c-535a4d2256e4' as webhook_url,
  'n8n Lead Conversion Webhook' as webhook_name,
  '{"Content-Type": "application/json"}' as headers,
  true as is_active
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM webhook_configs wc 
  WHERE wc.client_id = c.id 
  AND wc.webhook_type = 'n8n'
)
ON CONFLICT (client_id, webhook_type) DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  webhook_name = EXCLUDED.webhook_name,
  is_active = true,
  updated_at = NOW();

-- 8. INSERT DEFAULT MODULES (if missing)
INSERT INTO public.modules (name, description) VALUES
  ('SARAH_AI', 'AI Sales Agent Module'),
  ('LEAD_DATABASE', 'Lead Database Management'),
  ('CAMPAIGNS', 'Campaign Management'),
  ('ANALYTICS', 'Analytics and Reporting'),
  ('INTEGRATIONS', 'Third-party Integrations')
ON CONFLICT (name) DO NOTHING;

-- 9. ENSURE ADMIN USER HAS ALL MODULES ACTIVATED
DO $$
DECLARE
  admin_client_id UUID;
BEGIN
  -- Get admin client ID
  SELECT id INTO admin_client_id 
  FROM clients 
  WHERE email = 'djoere@scailup.io' 
  LIMIT 1;
  
  IF admin_client_id IS NOT NULL THEN
    -- Ensure all modules are active for admin
    INSERT INTO public.client_modules (client_id, module, active) VALUES
      (admin_client_id, 'SARAH_AI', true),
      (admin_client_id, 'LEAD_DATABASE', true),
      (admin_client_id, 'CAMPAIGNS', true),
      (admin_client_id, 'ANALYTICS', true),
      (admin_client_id, 'INTEGRATIONS', true)
    ON CONFLICT (client_id, module) DO UPDATE SET active = true;
  END IF;
END $$;

-- 10. UPDATE TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_webhook_configs_updated_at ON public.webhook_configs;
CREATE TRIGGER update_webhook_configs_updated_at
  BEFORE UPDATE ON public.webhook_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
