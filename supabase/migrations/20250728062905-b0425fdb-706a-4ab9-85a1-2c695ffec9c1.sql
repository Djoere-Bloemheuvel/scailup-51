
-- Give djoere@scailup.io unlimited access to all modules
-- First, get the client_id for djoere@scailup.io
DO $$
DECLARE
    target_client_id uuid;
BEGIN
    -- Get the client_id for djoere@scailup.io
    SELECT c.id INTO target_client_id
    FROM clients c
    JOIN client_users cu ON cu.client_id = c.id
    WHERE cu.email = 'djoere@scailup.io'
    LIMIT 1;
    
    IF target_client_id IS NULL THEN
        RAISE EXCEPTION 'Client not found for djoere@scailup.io';
    END IF;
    
    -- Insert/update client_modules for all modules with unlimited tier
    INSERT INTO client_modules (client_id, module, tier, activated_at, updated_at)
    VALUES 
        (target_client_id, 'lead_engine', 'unlimited', NOW(), NOW()),
        (target_client_id, 'marketing_engine', 'unlimited', NOW(), NOW()),
        (target_client_id, 'sales_engine', 'unlimited', NOW(), NOW())
    ON CONFLICT (client_id, module) 
    DO UPDATE SET 
        tier = 'unlimited',
        activated_at = NOW(),
        updated_at = NOW();
    
    -- Insert/update client_credits for all module/credit_type combinations with unlimited access
    INSERT INTO client_credits (client_id, module, credit_type, used_this_period, period_start, reset_interval, created_at, updated_at)
    VALUES 
        -- Lead Engine credits
        (target_client_id, 'lead_engine', 'leads', 0, CURRENT_DATE, 'monthly', NOW(), NOW()),
        -- Marketing Engine credits  
        (target_client_id, 'marketing_engine', 'emails', 0, CURRENT_DATE, 'monthly', NOW(), NOW()),
        (target_client_id, 'marketing_engine', 'linkedin', 0, CURRENT_DATE, 'monthly', NOW(), NOW()),
        -- Sales Engine credits
        (target_client_id, 'sales_engine', 'leads', 0, CURRENT_DATE, 'monthly', NOW(), NOW())
    ON CONFLICT (client_id, module, credit_type, period_start) 
    DO UPDATE SET 
        used_this_period = 0,
        reset_interval = 'monthly',
        updated_at = NOW();
    
    -- Create module tiers for unlimited access if they don't exist
    INSERT INTO module_tiers (module, tier, name, description, is_active, created_at)
    VALUES 
        ('lead_engine', 'unlimited', 'Unlimited Lead Engine', 'Unlimited access to Lead Engine features', true, NOW()),
        ('marketing_engine', 'unlimited', 'Unlimited Marketing Engine', 'Unlimited access to Marketing Engine features', true, NOW()),
        ('sales_engine', 'unlimited', 'Unlimited Sales Engine', 'Unlimited access to Sales Engine features', true, NOW())
    ON CONFLICT (module, tier) 
    DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = true;
    
    -- Create module tier credits for unlimited access (999999999 credits)
    INSERT INTO module_tier_credits (module_tier_id, credit_type, amount, reset_interval, rollover_months, created_at)
    SELECT 
        mt.id,
        'leads'::credit_type,
        999999999,
        'monthly'::reset_interval,
        12,
        NOW()
    FROM module_tiers mt
    WHERE mt.tier = 'unlimited' AND mt.module = 'lead_engine'
    ON CONFLICT (module_tier_id, credit_type) 
    DO UPDATE SET 
        amount = 999999999,
        reset_interval = 'monthly',
        rollover_months = 12;
        
    INSERT INTO module_tier_credits (module_tier_id, credit_type, amount, reset_interval, rollover_months, created_at)
    SELECT 
        mt.id,
        'emails'::credit_type,
        999999999,
        'monthly'::reset_interval,
        12,
        NOW()
    FROM module_tiers mt
    WHERE mt.tier = 'unlimited' AND mt.module = 'marketing_engine'
    ON CONFLICT (module_tier_id, credit_type) 
    DO UPDATE SET 
        amount = 999999999,
        reset_interval = 'monthly',
        rollover_months = 12;
        
    INSERT INTO module_tier_credits (module_tier_id, credit_type, amount, reset_interval, rollover_months, created_at)
    SELECT 
        mt.id,
        'linkedin'::credit_type,
        999999999,
        'monthly'::reset_interval,
        12,
        NOW()
    FROM module_tiers mt
    WHERE mt.tier = 'unlimited' AND mt.module = 'marketing_engine'
    ON CONFLICT (module_tier_id, credit_type) 
    DO UPDATE SET 
        amount = 999999999,
        reset_interval = 'monthly',
        rollover_months = 12;
        
    INSERT INTO module_tier_credits (module_tier_id, credit_type, amount, reset_interval, rollover_months, created_at)
    SELECT 
        mt.id,
        'leads'::credit_type,
        999999999,
        'monthly'::reset_interval,
        12,
        NOW()
    FROM module_tiers mt
    WHERE mt.tier = 'unlimited' AND mt.module = 'sales_engine'
    ON CONFLICT (module_tier_id, credit_type) 
    DO UPDATE SET 
        amount = 999999999,
        reset_interval = 'monthly',
        rollover_months = 12;
    
    RAISE NOTICE 'Successfully granted unlimited access to all modules for djoere@scailup.io';
END $$;
