
-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.credit_logs CASCADE;
DROP TABLE IF EXISTS public.client_credits CASCADE;
DROP TABLE IF EXISTS public.module_tiers CASCADE;
DROP TABLE IF EXISTS public.client_modules CASCADE;
DROP TABLE IF EXISTS public.client_users CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Create enum types for better data integrity
CREATE TYPE public.app_module AS ENUM ('lead_engine', 'marketing_engine', 'sales_engine');
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE public.reset_interval AS ENUM ('monthly', 'weekly');

-- 1. clients table - Basic company information
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    company_email TEXT UNIQUE NOT NULL,
    company_domain TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. client_users table - Links Supabase Auth users to clients with roles
CREATE TABLE public.client_users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    role public.app_role DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, client_id)
);

-- 3. client_modules table - Tracks which modules a client has activated and at what tier
CREATE TABLE public.client_modules (
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    module public.app_module NOT NULL,
    tier TEXT NOT NULL,
    activated_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (client_id, module)
);

-- 4. module_tiers table - Defines credit limits per module, tier, and credit type
CREATE TABLE public.module_tiers (
    module public.app_module,
    tier TEXT,
    credit_type TEXT,
    monthly_limit INTEGER NOT NULL,
    weekly_limit INTEGER,
    rollover_months INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (module, tier, credit_type)
);

-- 5. client_credits table - Stores current credit usage per client/module/type
CREATE TABLE public.client_credits (
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    module public.app_module,
    credit_type TEXT,
    used_this_period INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    reset_interval public.reset_interval DEFAULT 'monthly',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (client_id, module, credit_type)
);

-- 6. credit_logs table - Audit log for credit usage
CREATE TABLE public.credit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    module public.app_module,
    credit_type TEXT,
    change INTEGER NOT NULL,
    reason TEXT,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables except module_tiers
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user's client ID
CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS UUID AS $$
  SELECT client_users.client_id 
  FROM public.client_users 
  WHERE client_users.user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user has access to client
CREATE OR REPLACE FUNCTION public.user_has_client_access(target_client_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_users
    WHERE client_users.user_id = auth.uid()
    AND client_users.client_id = target_client_id
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get user role for client
CREATE OR REPLACE FUNCTION public.get_user_role_for_client(target_client_id UUID)
RETURNS TEXT AS $$
  SELECT client_users.role::TEXT
  FROM public.client_users
  WHERE client_users.user_id = auth.uid()
  AND client_users.client_id = target_client_id
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for clients table
CREATE POLICY "Users can view their own clients"
  ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = clients.id
    )
  );

CREATE POLICY "Admins can insert clients"
  ON public.clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update their clients"
  ON public.clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = clients.id
      AND client_users.role = 'admin'
    )
  );

-- RLS Policies for client_users table
CREATE POLICY "Users can view their client relationships"
  ON public.client_users
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.client_users cu
      WHERE cu.user_id = auth.uid()
      AND cu.client_id = client_users.client_id
      AND cu.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage client users"
  ON public.client_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.client_users cu
      WHERE cu.user_id = auth.uid()
      AND cu.client_id = client_users.client_id
      AND cu.role = 'admin'
    )
  );

-- RLS Policies for client_modules table
CREATE POLICY "Users can view their client modules"
  ON public.client_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = client_modules.client_id
    )
  );

CREATE POLICY "Admins can manage client modules"
  ON public.client_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = client_modules.client_id
      AND client_users.role = 'admin'
    )
  );

-- RLS Policies for client_credits table
CREATE POLICY "Users can read their client credits"
  ON public.client_credits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = client_credits.client_id
    )
  );

CREATE POLICY "System can manage client credits"
  ON public.client_credits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = client_credits.client_id
    )
  );

-- RLS Policies for credit_logs table
CREATE POLICY "Users can view their credit logs"
  ON public.credit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = credit_logs.client_id
    )
  );

CREATE POLICY "System can insert credit logs"
  ON public.credit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.user_id = auth.uid()
      AND client_users.client_id = credit_logs.client_id
    )
  );

-- Insert default module tiers (example data)
INSERT INTO public.module_tiers (module, tier, credit_type, monthly_limit, weekly_limit, rollover_months) VALUES
-- Lead Engine tiers
('lead_engine', 'tier_1', 'leads', 100, 25, 3),
('lead_engine', 'tier_2', 'leads', 500, 125, 3),
('lead_engine', 'tier_3', 'leads', 1000, 250, 6),
('lead_engine', 'unlimited', 'leads', 999999, 999999, 12),

-- Marketing Engine tiers
('marketing_engine', 'tier_1', 'emails', 1000, 250, 3),
('marketing_engine', 'tier_2', 'emails', 5000, 1250, 3),
('marketing_engine', 'tier_3', 'emails', 10000, 2500, 6),
('marketing_engine', 'unlimited', 'emails', 999999, 999999, 12),

-- Sales Engine tiers
('sales_engine', 'tier_1', 'linkedin', 50, 12, 3),
('sales_engine', 'tier_2', 'linkedin', 200, 50, 3),
('sales_engine', 'tier_3', 'linkedin', 500, 125, 6),
('sales_engine', 'unlimited', 'linkedin', 999999, 999999, 12);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_modules_updated_at BEFORE UPDATE ON public.client_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_module_tiers_updated_at BEFORE UPDATE ON public.module_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_credits_updated_at BEFORE UPDATE ON public.client_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
