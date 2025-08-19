
-- Create modules table
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  tier integer NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'weekly')),
  max_credit_duration interval NOT NULL DEFAULT '3 months',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create plan_credit_limits table
CREATE TABLE public.plan_credit_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
  credit_type text NOT NULL,
  amount integer NOT NULL,
  period text NOT NULL CHECK (period IN ('monthly', 'weekly')),
  carry_over boolean NOT NULL DEFAULT false,
  expires_after interval NOT NULL DEFAULT '1 week',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create client_subscriptions table
CREATE TABLE public.client_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL DEFAULT current_date,
  billing_day integer NOT NULL DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 31),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, module_id)
);

-- Create credit_balances table
CREATE TABLE public.credit_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  credit_type text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create credit_usage_logs table
CREATE TABLE public.credit_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  credit_type text NOT NULL,
  amount integer NOT NULL,
  used_at timestamp with time zone DEFAULT now(),
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default modules
INSERT INTO public.modules (slug, name) VALUES 
('lead_engine', 'Lead Engine'),
('marketing_engine', 'Marketing Engine');

-- Insert default plans for lead_engine
INSERT INTO public.plans (module_id, name, tier, billing_cycle, max_credit_duration)
SELECT 
  m.id,
  'Tier ' || tier_num,
  tier_num,
  'monthly',
  '3 months'::interval
FROM public.modules m
CROSS JOIN (VALUES (1), (2), (3)) AS t(tier_num)
WHERE m.slug = 'lead_engine';

-- Insert default plans for marketing_engine
INSERT INTO public.plans (module_id, name, tier, billing_cycle, max_credit_duration)
SELECT 
  m.id,
  'Tier ' || tier_num,
  tier_num,
  'monthly',
  '3 months'::interval
FROM public.modules m
CROSS JOIN (VALUES (1), (2), (3)) AS t(tier_num)
WHERE m.slug = 'marketing_engine';

-- Insert default credit limits for lead_engine plans
INSERT INTO public.plan_credit_limits (plan_id, credit_type, amount, period, carry_over, expires_after)
SELECT 
  p.id,
  credit_data.credit_type,
  credit_data.amount,
  'monthly',
  credit_data.carry_over,
  credit_data.expires_after::interval
FROM public.plans p
JOIN public.modules m ON p.module_id = m.id
CROSS JOIN (
  VALUES 
    ('leads', 5000, true, '3 months'),
    ('emails', 10000, true, '3 months'),
    ('linkedin', 50, false, '1 week')
) AS credit_data(credit_type, amount, carry_over, expires_after)
WHERE m.slug = 'lead_engine' AND p.tier = 3;

-- Insert default credit limits for marketing_engine plans
INSERT INTO public.plan_credit_limits (plan_id, credit_type, amount, period, carry_over, expires_after)
SELECT 
  p.id,
  credit_data.credit_type,
  credit_data.amount,
  'monthly',
  credit_data.carry_over,
  credit_data.expires_after::interval
FROM public.plans p
JOIN public.modules m ON p.module_id = m.id
CROSS JOIN (
  VALUES 
    ('seo_reports', 100, true, '3 months'),
    ('social_posts', 500, true, '3 months'),
    ('campaigns', 20, true, '3 months')
) AS credit_data(credit_type, amount, carry_over, expires_after)
WHERE m.slug = 'marketing_engine' AND p.tier = 3;

-- Enable RLS on all tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_credit_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for modules (public read)
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);

-- RLS policies for plans (public read)
CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (true);

-- RLS policies for plan_credit_limits (public read)
CREATE POLICY "Anyone can view plan credit limits" ON public.plan_credit_limits FOR SELECT USING (true);

-- RLS policies for client_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.client_subscriptions
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = client_subscriptions.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own subscriptions" ON public.client_subscriptions
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = client_subscriptions.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can update their own subscriptions" ON public.client_subscriptions
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = client_subscriptions.client_id 
  AND clients.user_id = auth.uid()
));

-- RLS policies for credit_balances
CREATE POLICY "Users can view their own credit balances" ON public.credit_balances
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = credit_balances.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own credit balances" ON public.credit_balances
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = credit_balances.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can update their own credit balances" ON public.credit_balances
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = credit_balances.client_id 
  AND clients.user_id = auth.uid()
));

-- RLS policies for credit_usage_logs
CREATE POLICY "Users can view their own usage logs" ON public.credit_usage_logs
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = credit_usage_logs.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own usage logs" ON public.credit_usage_logs
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = credit_usage_logs.client_id 
  AND clients.user_id = auth.uid()
));

-- Create function to automatically add default subscription for new clients
CREATE OR REPLACE FUNCTION public.handle_new_client_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_engine_module_id uuid;
  tier3_plan_id uuid;
BEGIN
  -- Get lead_engine module id
  SELECT id INTO lead_engine_module_id 
  FROM public.modules 
  WHERE slug = 'lead_engine';
  
  -- Get tier 3 plan id for lead_engine
  SELECT id INTO tier3_plan_id 
  FROM public.plans 
  WHERE module_id = lead_engine_module_id AND tier = 3;
  
  -- Insert default subscription
  INSERT INTO public.client_subscriptions (client_id, module_id, plan_id, billing_day)
  VALUES (NEW.id, lead_engine_module_id, tier3_plan_id, 1);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new client subscriptions
CREATE TRIGGER on_client_created_subscription
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client_subscription();

-- Create indexes for better performance
CREATE INDEX idx_client_subscriptions_client_id ON public.client_subscriptions(client_id);
CREATE INDEX idx_client_subscriptions_module_id ON public.client_subscriptions(module_id);
CREATE INDEX idx_credit_balances_client_module ON public.credit_balances(client_id, module_id);
CREATE INDEX idx_credit_balances_expires_at ON public.credit_balances(expires_at);
CREATE INDEX idx_credit_usage_logs_client_module ON public.credit_usage_logs(client_id, module_id);
CREATE INDEX idx_credit_usage_logs_used_at ON public.credit_usage_logs(used_at);
