
-- Add missing columns to credit_usage_logs table
ALTER TABLE credit_usage_logs 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS module_id TEXT;

-- Add slug column to modules table  
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update existing modules with slug values
UPDATE modules 
SET slug = CASE 
  WHEN name = 'Lead Engine' THEN 'lead_engine'
  WHEN name = 'Marketing Engine' THEN 'marketing_engine'
  ELSE lower(replace(name, ' ', '_'))
END
WHERE slug IS NULL;

-- Create client_subscriptions table
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  plan_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  billing_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  price DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for client_subscriptions
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client subscriptions" ON client_subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients c 
    WHERE c.id = client_subscriptions.client_id 
    AND c.user_id = auth.uid()
  )
);

-- Add RLS policies for plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view plans" ON plans
FOR SELECT USING (true);

-- Add missing columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'linkedin',
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS product_description TEXT;

-- Update existing campaigns with user_id from client relationship
UPDATE campaigns 
SET user_id = c.user_id 
FROM clients c 
WHERE campaigns.client_id = c.id AND campaigns.user_id IS NULL;
