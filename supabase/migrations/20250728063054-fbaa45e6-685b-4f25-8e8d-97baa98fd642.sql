
-- Fix unlimited access for djoere@scailup.io
-- Using the correct client_id from the network logs

DO $$
DECLARE
  v_client_id UUID := 'b4244c5f-d4a7-45f8-be3e-1e1485d3cc70';
  v_user_id UUID := 'a499bec7-8693-4ca2-a62f-ab65a0cce4c8';
  v_module_record RECORD;
  v_tier_record RECORD;
  v_credit_record RECORD;
BEGIN
  -- First, let's check what we have
  RAISE NOTICE 'Setting up unlimited access for client: %', v_client_id;
  
  -- Ensure we have the basic modules in module_tiers
  INSERT INTO module_tiers (id, module, tier, name, description, is_active) VALUES 
    (gen_random_uuid(), 'lead_engine', 'unlimited', 'Unlimited Lead Engine', 'Unlimited access to lead generation', true),
    (gen_random_uuid(), 'marketing_engine', 'unlimited', 'Unlimited Marketing Engine', 'Unlimited access to marketing tools', true),
    (gen_random_uuid(), 'sales_engine', 'unlimited', 'Unlimited Sales Engine', 'Unlimited access to sales tools', true)
  ON CONFLICT (module, tier) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true;

  -- Add unlimited credits for each module tier
  FOR v_tier_record IN 
    SELECT id, module, tier FROM module_tiers 
    WHERE tier = 'unlimited' AND is_active = true
  LOOP
    -- Add unlimited credits for common credit types
    INSERT INTO module_tier_credits (id, module_tier_id, credit_type, amount, reset_interval, rollover_months) VALUES
      (gen_random_uuid(), v_tier_record.id, 'leads', 999999, 'monthly', 12),
      (gen_random_uuid(), v_tier_record.id, 'emails', 999999, 'monthly', 12),
      (gen_random_uuid(), v_tier_record.id, 'linkedin', 999999, 'monthly', 12)
    ON CONFLICT (module_tier_id, credit_type) DO UPDATE SET
      amount = 999999,
      reset_interval = 'monthly',
      rollover_months = 12;
  END LOOP;

  -- Activate all unlimited modules for the client
  FOR v_module_record IN 
    SELECT module FROM module_tiers WHERE tier = 'unlimited' AND is_active = true
  LOOP
    INSERT INTO client_modules (
      id, client_id, module, tier, module_name, is_active, activated_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_client_id, v_module_record.module, 'unlimited', 
      CASE v_module_record.module
        WHEN 'lead_engine' THEN 'Lead Engine Unlimited'
        WHEN 'marketing_engine' THEN 'Marketing Engine Unlimited'
        WHEN 'sales_engine' THEN 'Sales Engine Unlimited'
        ELSE v_module_record.module || ' Unlimited'
      END,
      true, NOW(), NOW(), NOW()
    ) ON CONFLICT (client_id, module) DO UPDATE SET
      tier = 'unlimited',
      module_name = EXCLUDED.module_name,
      is_active = true,
      activated_at = NOW(),
      updated_at = NOW();
  END LOOP;

  -- Set unlimited credits directly in client_credits
  FOR v_module_record IN 
    SELECT module FROM module_tiers WHERE tier = 'unlimited' AND is_active = true
  LOOP
    -- Insert/update credits for each credit type
    INSERT INTO client_credits (
      id, client_id, module, credit_type, monthly_limit, used_this_period, period_start, reset_interval, rollover_months, created_at, updated_at
    ) VALUES 
      (gen_random_uuid(), v_client_id, v_module_record.module, 'leads', 999999, 0, DATE_TRUNC('month', NOW()), 'monthly', 12, NOW(), NOW()),
      (gen_random_uuid(), v_client_id, v_module_record.module, 'emails', 999999, 0, DATE_TRUNC('month', NOW()), 'monthly', 12, NOW(), NOW()),
      (gen_random_uuid(), v_client_id, v_module_record.module, 'linkedin', 999999, 0, DATE_TRUNC('month', NOW()), 'monthly', 12, NOW(), NOW())
    ON CONFLICT (client_id, module, credit_type) DO UPDATE SET
      monthly_limit = 999999,
      reset_interval = 'monthly',
      rollover_months = 12,
      updated_at = NOW();
  END LOOP;

  -- Also set unlimited credits in the old credits table for backward compatibility
  FOR v_module_record IN 
    SELECT id, slug FROM modules WHERE slug IN ('lead_engine', 'marketing_engine', 'sales_engine')
  LOOP
    INSERT INTO credits (
      id, client_id, module_id, credit_type, amount, balance, is_unlimited, expires_at, created_at, updated_at
    ) VALUES 
      (gen_random_uuid(), v_client_id, v_module_record.id, 'leads', 999999, 999999, true, NOW() + INTERVAL '10 years', NOW(), NOW()),
      (gen_random_uuid(), v_client_id, v_module_record.id, 'emails', 999999, 999999, true, NOW() + INTERVAL '10 years', NOW(), NOW()),
      (gen_random_uuid(), v_client_id, v_module_record.id, 'linkedin', 999999, 999999, true, NOW() + INTERVAL '10 years', NOW(), NOW())
    ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
      amount = 999999,
      balance = 999999,
      is_unlimited = true,
      expires_at = NOW() + INTERVAL '10 years',
      updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Successfully set up unlimited access for client: %', v_client_id;
END $$;

-- Verify the setup
SELECT 'CLIENT_MODULES' as table_name, * FROM client_modules WHERE client_id = 'b4244c5f-d4a7-45f8-be3e-1e1485d3cc70';
SELECT 'CLIENT_CREDITS' as table_name, * FROM client_credits WHERE client_id = 'b4244c5f-d4a7-45f8-be3e-1e1485d3cc70';
SELECT 'CREDITS' as table_name, * FROM credits WHERE client_id = 'b4244c5f-d4a7-45f8-be3e-1e1485d3cc70';
