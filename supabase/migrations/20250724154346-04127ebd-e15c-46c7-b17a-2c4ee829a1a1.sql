
-- First, clean up any existing tables that might conflict
DROP TABLE IF EXISTS public.client_subscriptions CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.plan_credit_limits CASCADE;
DROP TABLE IF EXISTS public.credits CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.credit_balances CASCADE;
DROP TABLE IF EXISTS public.credit_usage_logs CASCADE;

-- Drop existing functions that reference old structure
DROP FUNCTION IF EXISTS public.bulk_convert_leads_to_contacts(uuid[], text);
DROP FUNCTION IF EXISTS public.use_credits(uuid, text, text, integer, text, uuid);
DROP FUNCTION IF EXISTS public.add_credits(uuid, text, text, integer, timestamp with time zone, text);
DROP FUNCTION IF EXISTS public.check_and_use_credits(text, integer, text);

-- Ensure client_users table has correct structure
ALTER TABLE public.client_users DROP CONSTRAINT IF EXISTS client_users_role_check;
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
ALTER TABLE public.client_users ALTER COLUMN role TYPE public.app_role USING role::public.app_role;
ALTER TABLE public.client_users ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

-- Ensure module enum is correct
DROP TYPE IF EXISTS public.module_enum CASCADE;
CREATE TYPE public.module_enum AS ENUM ('lead_engine', 'marketing_engine', 'sales_engine');

-- Ensure reset_interval enum is correct
DROP TYPE IF EXISTS public.reset_interval CASCADE;
CREATE TYPE public.reset_interval AS ENUM ('monthly', 'weekly');

-- Update client_modules table structure
ALTER TABLE public.client_modules 
  ALTER COLUMN module TYPE public.module_enum USING module::public.module_enum;

-- Update module_tiers table structure to have all required columns
ALTER TABLE public.module_tiers 
  ALTER COLUMN module TYPE public.module_enum USING module::public.module_enum,
  ALTER COLUMN reset_interval TYPE public.reset_interval USING reset_interval::public.reset_interval;

-- Update client_credits table structure
ALTER TABLE public.client_credits 
  ALTER COLUMN module TYPE public.module_enum USING module::public.module_enum,
  ALTER COLUMN reset_interval TYPE public.reset_interval USING reset_interval::public.reset_interval;

-- Add missing columns to clients table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'is_active') THEN
    ALTER TABLE public.clients ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'admin') THEN
    ALTER TABLE public.clients ADD COLUMN admin boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'lead_engine') THEN
    ALTER TABLE public.clients ADD COLUMN lead_engine boolean DEFAULT false;
  END IF;
END $$;

-- Ensure contacts table has client_id column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'client_id') THEN
    ALTER TABLE public.contacts ADD COLUMN client_id uuid REFERENCES public.clients(id);
  END IF;
END $$;

-- Create function to get client ID for current user
CREATE OR REPLACE FUNCTION public.get_current_client_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT cu.client_id 
  FROM public.client_users cu
  WHERE cu.user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.client_users cu
    WHERE cu.user_id = _user_id
      AND cu.role = _role
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT cu.role::text
  FROM public.client_users cu
  WHERE cu.user_id = auth.uid()
  LIMIT 1;
$$;

-- Create function to get current client data
CREATE OR REPLACE FUNCTION public.get_current_client_data()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT row_to_json(c.*)
  FROM public.clients c
  JOIN public.client_users cu ON c.id = cu.client_id
  WHERE cu.user_id = auth.uid()
  LIMIT 1;
$$;

-- Create function to get all clients (admin only)
CREATE OR REPLACE FUNCTION public.get_all_clients()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(c.*)), '[]'::json)
  FROM public.clients c
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

-- Create function to convert lead to contact
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(
  lead_id uuid,
  notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id uuid;
  lead_record record;
  contact_id uuid;
BEGIN
  -- Get current user's client ID
  SELECT public.get_current_client_id() INTO client_id;
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'User not associated with any client';
  END IF;
  
  -- Get lead data
  SELECT * FROM public.leads WHERE id = lead_id INTO lead_record;
  
  IF lead_record IS NULL THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;
  
  -- Insert into contacts
  INSERT INTO public.contacts (
    client_id,
    first_name,
    last_name,
    full_name,
    title,
    email,
    mobile_phone,
    linkedin_url,
    country,
    state,
    city,
    company_name,
    company_website,
    company_phone,
    company_linkedin,
    company_summary,
    industry,
    seniority,
    employee_count,
    company_keywords,
    organization_technologies,
    contact_summary
  ) VALUES (
    client_id,
    lead_record.first_name,
    lead_record.last_name,
    lead_record.full_name,
    lead_record.title,
    lead_record.email,
    lead_record.mobile_phone,
    lead_record.linkedin_url,
    lead_record.country,
    lead_record.state,
    lead_record.city,
    lead_record.company_name,
    lead_record.company_website,
    lead_record.company_phone,
    lead_record.company_linkedin,
    lead_record.company_summary,
    lead_record.industry,
    lead_record.seniority,
    lead_record.employee_count,
    CASE 
      WHEN lead_record.company_keywords IS NOT NULL 
      THEN string_to_array(lead_record.company_keywords, ',')
      ELSE NULL
    END,
    CASE 
      WHEN lead_record.organization_technologies IS NOT NULL 
      THEN string_to_array(lead_record.organization_technologies, ',')
      ELSE NULL
    END,
    notes
  ) RETURNING id INTO contact_id;
  
  -- Delete the lead
  DELETE FROM public.leads WHERE id = lead_id;
  
  RETURN json_build_object(
    'success', true,
    'contact_id', contact_id
  );
END;
$$;

-- Update RLS policies for new structure
DROP POLICY IF EXISTS "Users can view their client credits" ON public.client_credits;
DROP POLICY IF EXISTS "System can manage client credits" ON public.client_credits;

CREATE POLICY "Users can view their client credits" 
ON public.client_credits FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = client_credits.client_id
  )
);

CREATE POLICY "System can manage client credits" 
ON public.client_credits FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = client_credits.client_id
  )
);

-- Add RLS policies for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client contacts" 
ON public.contacts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = contacts.client_id
  )
);

CREATE POLICY "Users can insert contacts for their client" 
ON public.contacts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = contacts.client_id
  )
);

CREATE POLICY "Users can update their client contacts" 
ON public.contacts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = contacts.client_id
  )
);

-- Add RLS policies for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client campaigns" 
ON public.campaigns FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = campaigns.client_id
  )
);

CREATE POLICY "Users can insert campaigns for their client" 
ON public.campaigns FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = campaigns.client_id
  )
);

CREATE POLICY "Users can update their client campaigns" 
ON public.campaigns FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = campaigns.client_id
  )
);

-- Add RLS policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client products" 
ON public.products FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = products.client_id
  )
);

CREATE POLICY "Users can insert products for their client" 
ON public.products FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = products.client_id
  )
);

CREATE POLICY "Users can update their client products" 
ON public.products FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.client_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.client_id = products.client_id
  )
);

-- Enable RLS on leads (public access for now, can be refined later)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view leads" 
ON public.leads FOR SELECT 
USING (true);

CREATE POLICY "Public can insert leads" 
ON public.leads FOR INSERT 
WITH CHECK (true);
