
-- First, update the module_pricing table to add Stripe integration and audit fields
ALTER TABLE module_pricing 
ADD COLUMN stripe_product_id TEXT,
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN created_by UUID REFERENCES auth.users(id),
ADD COLUMN updated_by UUID REFERENCES auth.users(id),
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN archived_at TIMESTAMPTZ,
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create client_modules table for tracking client subscriptions
CREATE TABLE client_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES module_pricing(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Ensure one active subscription per client per module
  UNIQUE(client_id, module_id, is_active) WHERE is_active = true
);

-- Enable RLS on client_modules
ALTER TABLE client_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_modules
CREATE POLICY "Users can view their client modules" 
  ON client_modules 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage client modules" 
  ON client_modules 
  FOR ALL 
  USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_modules_updated_at
  BEFORE UPDATE ON client_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_client_modules_updated_at();

-- Create trigger to set created_by on insert
CREATE OR REPLACE FUNCTION set_client_modules_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_modules_created_by
  BEFORE INSERT ON client_modules
  FOR EACH ROW
  EXECUTE FUNCTION set_client_modules_created_by();

-- Update module_pricing with Stripe IDs and enforce dependencies
UPDATE module_pricing SET 
  stripe_product_id = 'prod_sales_engine_placeholder',
  stripe_price_id = 'price_sales_engine_monthly_placeholder',
  requires_lead_engine = true,
  is_standalone = false,
  updated_at = NOW()
WHERE module_slug = 'sales_engine';

UPDATE module_pricing SET 
  stripe_product_id = 'prod_marketing_engine_placeholder',
  stripe_price_id = 'price_marketing_engine_monthly_placeholder',
  requires_lead_engine = false,
  is_standalone = true,
  updated_at = NOW()
WHERE module_slug = 'marketing_engine';

-- Create function to check module dependencies
CREATE OR REPLACE FUNCTION check_module_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  requires_lead BOOLEAN;
  has_lead_engine BOOLEAN;
BEGIN
  -- Get module requirements
  SELECT requires_lead_engine INTO requires_lead
  FROM module_pricing 
  WHERE id = NEW.module_id;
  
  -- If module requires lead_engine, check if client has active lead_engine
  IF requires_lead THEN
    SELECT EXISTS(
      SELECT 1 FROM client_modules cm
      JOIN module_pricing mp ON cm.module_id = mp.id
      WHERE cm.client_id = NEW.client_id 
        AND mp.module_slug = 'lead_engine' 
        AND cm.is_active = true
    ) INTO has_lead_engine;
    
    IF NOT has_lead_engine THEN
      RAISE EXCEPTION 'Cannot activate % module without active lead_engine module', 
        (SELECT module_name FROM module_pricing WHERE id = NEW.module_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce dependencies on insert/update
CREATE TRIGGER enforce_module_dependencies
  BEFORE INSERT OR UPDATE ON client_modules
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION check_module_dependencies();

-- Create indexes for better performance
CREATE INDEX idx_client_modules_client_id ON client_modules(client_id);
CREATE INDEX idx_client_modules_module_id ON client_modules(module_id);
CREATE INDEX idx_client_modules_active ON client_modules(is_active) WHERE is_active = true;
CREATE INDEX idx_client_modules_stripe_subscription ON client_modules(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_module_pricing_stripe_product ON module_pricing(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
CREATE INDEX idx_module_pricing_active ON module_pricing(archived_at) WHERE archived_at IS NULL;

-- Create view for active client modules with pricing info
CREATE VIEW active_client_modules AS
SELECT 
  cm.id,
  cm.client_id,
  cm.module_id,
  cm.start_date,
  cm.stripe_subscription_id,
  mp.module_slug,
  mp.module_name,
  mp.monthly_price,
  mp.description,
  mp.value_proposition,
  mp.stripe_product_id,
  mp.stripe_price_id,
  mp.requires_lead_engine,
  mp.is_standalone
FROM client_modules cm
JOIN module_pricing mp ON cm.module_id = mp.id
WHERE cm.is_active = true 
  AND mp.archived_at IS NULL;

-- Grant permissions on the view
GRANT SELECT ON active_client_modules TO authenticated;

-- Add RLS policy for the view
CREATE POLICY "Users can view their active client modules" 
  ON active_client_modules 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  );
