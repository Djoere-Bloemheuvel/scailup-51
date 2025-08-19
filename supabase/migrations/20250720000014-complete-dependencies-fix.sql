-- Complete Dependencies Fix Migration
-- This migration creates all missing tables and dependencies for enrichment and client management
-- while maintaining full Lovable compatibility

-- 1. Create modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tier INTEGER NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'weekly')),
  max_credit_duration INTERVAL NOT NULL DEFAULT '3 months',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create plan_credit_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS plan_credit_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly')),
  carry_over BOOLEAN NOT NULL DEFAULT false,
  expires_after INTERVAL NOT NULL DEFAULT '1 week',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create client_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT current_date,
  billing_day INTEGER NOT NULL DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, module_id)
);

-- 5. Create credit_balances table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create credit_usage_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create users table if it doesn't exist (for client relationships)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Insert default modules if they don't exist
INSERT INTO modules (slug, name) VALUES 
  ('lead_engine', 'Lead Engine'),
  ('marketing_engine', 'Marketing Engine'),
  ('sarah_ai', 'SARAH AI'),
  ('analytics', 'Analytics'),
  ('integrations', 'Integrations')
ON CONFLICT (slug) DO NOTHING;

-- 9. Insert default plans for lead_engine if they don't exist
INSERT INTO plans (module_id, name, tier, billing_cycle, max_credit_duration)
SELECT 
  m.id,
  'Tier ' || tier_num,
  tier_num,
  'monthly',
  '3 months'::interval
FROM modules m
CROSS JOIN (VALUES (1), (2), (3)) AS t(tier_num)
WHERE m.slug = 'lead_engine'
ON CONFLICT DO NOTHING;

-- 10. Insert default plans for marketing_engine if they don't exist
INSERT INTO plans (module_id, name, tier, billing_cycle, max_credit_duration)
SELECT 
  m.id,
  'Tier ' || tier_num,
  tier_num,
  'monthly',
  '3 months'::interval
FROM modules m
CROSS JOIN (VALUES (1), (2), (3)) AS t(tier_num)
WHERE m.slug = 'marketing_engine'
ON CONFLICT DO NOTHING;

-- 11. Insert default credit limits for lead_engine plans if they don't exist
INSERT INTO plan_credit_limits (plan_id, credit_type, amount, period, carry_over, expires_after)
SELECT 
  p.id,
  credit_data.credit_type,
  credit_data.amount,
  'monthly',
  credit_data.carry_over,
  credit_data.expires_after::interval
FROM plans p
JOIN modules m ON p.module_id = m.id
CROSS JOIN (
  VALUES 
    ('leads', 5000, true, '3 months'),
    ('emails', 10000, true, '3 months'),
    ('linkedin', 50, false, '1 week')
) AS credit_data(credit_type, amount, carry_over, expires_after)
WHERE m.slug = 'lead_engine' AND p.tier = 3
ON CONFLICT DO NOTHING;

-- 12. Insert default credit limits for marketing_engine plans if they don't exist
INSERT INTO plan_credit_limits (plan_id, credit_type, amount, period, carry_over, expires_after)
SELECT 
  p.id,
  credit_data.credit_type,
  credit_data.amount,
  'monthly',
  credit_data.carry_over,
  credit_data.expires_after::interval
FROM plans p
JOIN modules m ON p.module_id = m.id
CROSS JOIN (
  VALUES 
    ('seo_reports', 100, true, '3 months'),
    ('social_posts', 500, true, '3 months'),
    ('campaigns', 20, true, '3 months')
) AS credit_data(credit_type, amount, carry_over, expires_after)
WHERE m.slug = 'marketing_engine' AND p.tier = 3
ON CONFLICT DO NOTHING;

-- 13. Enable RLS on all tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_credit_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for modules (public read)
CREATE POLICY "Anyone can view modules" ON modules FOR SELECT USING (true);

-- 15. Create RLS policies for plans (public read)
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);

-- 16. Create RLS policies for plan_credit_limits (public read)
CREATE POLICY "Anyone can view plan credit limits" ON plan_credit_limits FOR SELECT USING (true);

-- 17. Create RLS policies for client_subscriptions
CREATE POLICY "Users can view their own client subscriptions" ON client_subscriptions
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own client subscriptions" ON client_subscriptions
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 18. Create RLS policies for credit_balances
CREATE POLICY "Users can view their own credit balances" ON credit_balances
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own credit balances" ON credit_balances
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own credit balances" ON credit_balances
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 19. Create RLS policies for credit_usage_logs
CREATE POLICY "Users can view their own credit usage logs" ON credit_usage_logs
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own credit usage logs" ON credit_usage_logs
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 20. Create RLS policies for users
CREATE POLICY "Users can view their own user record" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own user record" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own user record" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 21. Create function to automatically add default subscription for new clients
CREATE OR REPLACE FUNCTION handle_new_client_subscription()
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
  FROM modules 
  WHERE slug = 'lead_engine';
  
  -- Get tier 3 plan id for lead_engine
  SELECT id INTO tier3_plan_id 
  FROM plans 
  WHERE module_id = lead_engine_module_id AND tier = 3;
  
  -- Insert default subscription
  INSERT INTO client_subscriptions (client_id, module_id, plan_id, billing_day)
  VALUES (NEW.id, lead_engine_module_id, tier3_plan_id, 1)
  ON CONFLICT (client_id, module_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 22. Create trigger for new client subscriptions
DROP TRIGGER IF EXISTS on_client_created_subscription ON clients;
CREATE TRIGGER on_client_created_subscription
  AFTER INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION handle_new_client_subscription();

-- 23. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client_id ON client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_module_id ON client_subscriptions(module_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_client_module ON credit_balances(client_id, module_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_expires_at ON credit_balances(expires_at);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_client_module ON credit_usage_logs(client_id, module_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_used_at ON credit_usage_logs(used_at);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 24. Add missing columns to leads table for enrichment
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS company_summary TEXT,
ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER,
ADD COLUMN IF NOT EXISTS match_reasons TEXT[],
ADD COLUMN IF NOT EXISTS unique_angles TEXT[],
ADD COLUMN IF NOT EXISTS best_campaign_match TEXT,
ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'enriched', 'failed')),
ADD COLUMN IF NOT EXISTS enrichment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'lead' CHECK (contact_status IN ('lead', 'contact', 'converted')),
ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS duplicate_of_lead_id UUID REFERENCES leads(id);

-- 25. Create enrichment functions
CREATE OR REPLACE FUNCTION check_lead_enrichment_needs(lead_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lead_record RECORD;
BEGIN
  SELECT * INTO lead_record
  FROM leads
  WHERE id = lead_id;
  
  -- Check if lead needs enrichment (missing company_summary)
  RETURN lead_record.company_summary IS NULL OR lead_record.company_summary = '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 26. Create function to mark lead as enriched
CREATE OR REPLACE FUNCTION mark_lead_enriched(
  lead_id UUID,
  company_summary TEXT,
  product_match_percentage INTEGER,
  match_reasons TEXT[],
  unique_angles TEXT[],
  best_campaign_match TEXT,
  personalized_icebreaker TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE leads SET
    company_summary = mark_lead_enriched.company_summary,
    product_match_percentage = mark_lead_enriched.product_match_percentage,
    match_reasons = mark_lead_enriched.match_reasons,
    unique_angles = mark_lead_enriched.unique_angles,
    best_campaign_match = mark_lead_enriched.best_campaign_match,
    personalized_icebreaker = mark_lead_enriched.personalized_icebreaker,
    enrichment_status = 'enriched',
    enrichment_date = NOW(),
    updated_at = NOW()
  WHERE id = lead_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 27. Create function to get enrichment workflow data
CREATE OR REPLACE FUNCTION get_enrichment_workflow_data(lead_id UUID)
RETURNS JSONB AS $$
DECLARE
  lead_data JSONB;
  client_data JSONB;
  result JSONB;
BEGIN
  -- Get lead data
  SELECT to_jsonb(l.*) INTO lead_data
  FROM leads l
  WHERE l.id = lead_id;
  
  -- Get client data for the lead
  SELECT to_jsonb(c.*) INTO client_data
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid()
  LIMIT 1;
  
  -- Combine data for N8N workflow
  result := jsonb_build_object(
    'lead', lead_data,
    'client', client_data,
    'workflow_timestamp', NOW(),
    'enrichment_required', lead_data->>'company_summary' IS NULL OR lead_data->>'company_summary' = ''
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 