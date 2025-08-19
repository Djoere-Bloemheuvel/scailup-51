
-- Create credit_type_enum first
CREATE TYPE credit_type_enum AS ENUM ('leads', 'emails', 'linkedin');

-- Drop existing module_tiers table if it exists and recreate with new structure
DROP TABLE IF EXISTS public.module_tier_credits CASCADE;
DROP TABLE IF EXISTS public.module_tiers CASCADE;

-- Create module_tiers table with new structure
CREATE TABLE public.module_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  tier TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (module, tier)
);

-- Create module_tier_credits table
CREATE TABLE public.module_tier_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_tier_id UUID NOT NULL REFERENCES module_tiers(id) ON DELETE CASCADE,
  credit_type credit_type_enum NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  reset_interval TEXT NOT NULL CHECK (reset_interval IN ('monthly', 'weekly')),
  rollover_months INTEGER DEFAULT 0 CHECK (rollover_months >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (module_tier_id, credit_type)
);

-- Create indexes for performance
CREATE INDEX idx_module_tiers_module ON module_tiers(module);
CREATE INDEX idx_module_tiers_active ON module_tiers(is_active) WHERE is_active = true;
CREATE INDEX idx_module_tier_credits_tier_id ON module_tier_credits(module_tier_id);
CREATE INDEX idx_module_tier_credits_type ON module_tier_credits(credit_type);

-- Add updated_at trigger for module_tiers
CREATE TRIGGER update_module_tiers_updated_at
  BEFORE UPDATE ON module_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data for lead_engine module
WITH tier_data AS (
  INSERT INTO module_tiers (module, tier, name, description) VALUES
    ('lead_engine', 'tier_1', 'Starter', 'Perfect for small teams getting started'),
    ('lead_engine', 'tier_2', 'Professional', 'Ideal for growing businesses'),
    ('lead_engine', 'tier_3', 'Enterprise', 'For large teams with high volume needs'),
    ('lead_engine', 'unlimited', 'Unlimited', 'Internal use - unlimited access')
  RETURNING id, tier
),
tier_mapping AS (
  SELECT 
    id as module_tier_id,
    tier,
    CASE 
      WHEN tier = 'tier_1' THEN 
        ARRAY[
          ROW('leads', 1000, 'monthly', 3),
          ROW('emails', 4000, 'monthly', 3),
          ROW('linkedin', 50, 'weekly', 0)
        ]
      WHEN tier = 'tier_2' THEN 
        ARRAY[
          ROW('leads', 2500, 'monthly', 3),
          ROW('emails', 10000, 'monthly', 3),
          ROW('linkedin', 100, 'weekly', 0)
        ]
      WHEN tier = 'tier_3' THEN 
        ARRAY[
          ROW('leads', 5000, 'monthly', 3),
          ROW('emails', 20000, 'monthly', 3),
          ROW('linkedin', 100, 'weekly', 0)
        ]
      WHEN tier = 'unlimited' THEN 
        ARRAY[
          ROW('leads', 999999, 'monthly', 12),
          ROW('emails', 999999, 'monthly', 12),
          ROW('linkedin', 999999, 'weekly', 0)
        ]
    END as credits
  FROM tier_data
)
INSERT INTO module_tier_credits (module_tier_id, credit_type, amount, reset_interval, rollover_months)
SELECT 
  tm.module_tier_id,
  (credit_row).f1::credit_type_enum as credit_type,
  (credit_row).f2::INTEGER as amount,
  (credit_row).f3::TEXT as reset_interval,
  (credit_row).f4::INTEGER as rollover_months
FROM tier_mapping tm
CROSS JOIN LATERAL unnest(tm.credits) as credit_row;

-- Enable RLS on new tables
ALTER TABLE module_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_tier_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read module tiers based on their client modules
CREATE POLICY "Users can view module tiers for their client modules"
  ON module_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_modules cm
      JOIN client_users cu ON cm.client_id = cu.client_id
      WHERE cu.user_id = auth.uid()
      AND cm.module::TEXT = module_tiers.module
    )
  );

-- RLS Policy: Users can read tier credits based on their client modules
CREATE POLICY "Users can view tier credits for their client modules"
  ON module_tier_credits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM module_tiers mt
      JOIN client_modules cm ON mt.module = cm.module::TEXT
      JOIN client_users cu ON cm.client_id = cu.client_id
      WHERE cu.user_id = auth.uid()
      AND mt.id = module_tier_credits.module_tier_id
    )
  );

-- Service role policies for write operations (only service role can write)
CREATE POLICY "Service role can manage module tiers"
  ON module_tiers FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage tier credits"
  ON module_tier_credits FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Update client_modules table to reference module_tiers properly
-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_modules_module_tier_fk'
  ) THEN
    -- First ensure we have a module_tier_id column in client_modules
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'client_modules' AND column_name = 'module_tier_id'
    ) THEN
      ALTER TABLE client_modules ADD COLUMN module_tier_id UUID;
    END IF;
    
    -- Update existing client_modules to reference the new module_tiers
    UPDATE client_modules SET module_tier_id = (
      SELECT mt.id FROM module_tiers mt 
      WHERE mt.module = client_modules.module::TEXT 
      AND mt.tier = client_modules.tier
      LIMIT 1
    );
    
    -- Add the foreign key constraint
    ALTER TABLE client_modules 
    ADD CONSTRAINT client_modules_module_tier_fk 
    FOREIGN KEY (module_tier_id) REFERENCES module_tiers(id);
  END IF;
END $$;

-- Create a view for easy credit lookup per client
CREATE OR REPLACE VIEW client_available_credits AS
SELECT 
  cu.client_id,
  cu.user_id,
  cm.module,
  cm.tier,
  mt.name as tier_name,
  mtc.credit_type,
  mtc.amount as monthly_limit,
  mtc.reset_interval,
  mtc.rollover_months,
  COALESCE(cc.used_this_period, 0) as used_this_period,
  GREATEST(0, mtc.amount - COALESCE(cc.used_this_period, 0)) as remaining_credits
FROM client_users cu
JOIN client_modules cm ON cu.client_id = cm.client_id
JOIN module_tiers mt ON cm.module_tier_id = mt.id
JOIN module_tier_credits mtc ON mt.id = mtc.module_tier_id
LEFT JOIN client_credits cc ON (
  cc.client_id = cu.client_id 
  AND cc.module = cm.module 
  AND cc.credit_type = mtc.credit_type::TEXT
);

-- Grant access to the view
GRANT SELECT ON client_available_credits TO authenticated;

-- Add RLS to the view (inherited from base tables)
ALTER VIEW client_available_credits SET (security_invoker = true);
