
-- Add initial_tier column to clients table to track onboarding path
ALTER TABLE clients ADD COLUMN initial_tier TEXT;

-- Add first_activated_at column to client_modules to support one-time bonus detection
ALTER TABLE client_modules ADD COLUMN first_activated_at TIMESTAMP WITH TIME ZONE;

-- Add composite indexes for performance on credits table
CREATE INDEX IF NOT EXISTS idx_credits_client_module_type ON credits(client_id, module_id, credit_type);
CREATE INDEX IF NOT EXISTS idx_credits_expires_at ON credits(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to handle tier-based credit bonuses
CREATE OR REPLACE FUNCTION handle_tier_credit_bonus(
  p_client_id UUID,
  p_module TEXT,
  p_new_tier TEXT,
  p_is_first_activation BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  v_module_id UUID;
  v_initial_tier TEXT;
  v_bonus_leads INTEGER := 0;
  v_bonus_emails INTEGER := 0;
  v_bonus_linkedin INTEGER := 0;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_result JSONB := '{"bonuses_applied": []}'::JSONB;
BEGIN
  -- Get module_id for lead_engine
  SELECT id INTO v_module_id FROM modules WHERE slug = p_module LIMIT 1;
  
  IF v_module_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Module not found');
  END IF;
  
  -- Get client's initial tier
  SELECT initial_tier INTO v_initial_tier FROM clients WHERE id = p_client_id;
  
  -- Set expiry date (1 month from now)
  v_expires_at := NOW() + INTERVAL '1 month';
  
  -- Apply bonus logic based on tier and initial tier
  IF p_new_tier = 'start' AND (v_initial_tier IS NULL OR v_initial_tier = 'start') THEN
    -- Start bonus: 1000 leads, 2000 emails, 200 LinkedIn (1-month expiry)
    v_bonus_leads := 1000;
    v_bonus_emails := 2000;
    v_bonus_linkedin := 200;
    
    -- Update initial_tier if not set
    IF v_initial_tier IS NULL THEN
      UPDATE clients SET initial_tier = 'start' WHERE id = p_client_id;
    END IF;
    
  ELSIF p_new_tier = 'grow' AND p_is_first_activation THEN
    -- Check if client skipped Start (initial_tier != 'start')
    IF v_initial_tier IS NULL OR v_initial_tier != 'start' THEN
      v_bonus_leads := 2000;
      -- Update initial_tier if not set
      IF v_initial_tier IS NULL THEN
        UPDATE clients SET initial_tier = 'grow' WHERE id = p_client_id;
      END IF;
    END IF;
    
  ELSIF p_new_tier = 'scale' AND p_is_first_activation THEN
    -- Check if client skipped Start (initial_tier != 'start')
    IF v_initial_tier IS NULL OR v_initial_tier != 'start' THEN
      v_bonus_leads := 5000;
      -- Update initial_tier if not set
      IF v_initial_tier IS NULL THEN
        UPDATE clients SET initial_tier = 'scale' WHERE id = p_client_id;
      END IF;
    END IF;
    
  ELSIF p_new_tier = 'dominate' AND p_is_first_activation THEN
    -- Check if client skipped Start (initial_tier != 'start')
    IF v_initial_tier IS NULL OR v_initial_tier != 'start' THEN
      v_bonus_leads := 10000;
      -- Update initial_tier if not set
      IF v_initial_tier IS NULL THEN
        UPDATE clients SET initial_tier = 'dominate' WHERE id = p_client_id;
      END IF;
    END IF;
    
  ELSIF p_new_tier = 'unlimited' THEN
    -- Set unlimited credits for all types
    PERFORM set_unlimited_credits(p_client_id, v_module_id, 'leads');
    PERFORM set_unlimited_credits(p_client_id, v_module_id, 'emails');
    PERFORM set_unlimited_credits(p_client_id, v_module_id, 'linkedin');
    
    v_result := jsonb_build_object(
      'bonuses_applied', 
      jsonb_build_array('unlimited_leads', 'unlimited_emails', 'unlimited_linkedin')
    );
    
    RETURN v_result;
  END IF;
  
  -- Apply lead bonus if applicable
  IF v_bonus_leads > 0 THEN
    PERFORM add_credits(p_client_id, v_module_id, 'leads', v_bonus_leads, v_expires_at, 
                       format('Tier bonus: %s leads for %s tier', v_bonus_leads, p_new_tier));
    v_result := jsonb_set(v_result, '{bonuses_applied}', 
                         (v_result->'bonuses_applied') || jsonb_build_array(format('leads_%s', v_bonus_leads)));
  END IF;
  
  -- Apply email bonus if applicable
  IF v_bonus_emails > 0 THEN
    PERFORM add_credits(p_client_id, v_module_id, 'emails', v_bonus_emails, v_expires_at,
                       format('Tier bonus: %s emails for %s tier', v_bonus_emails, p_new_tier));
    v_result := jsonb_set(v_result, '{bonuses_applied}', 
                         (v_result->'bonuses_applied') || jsonb_build_array(format('emails_%s', v_bonus_emails)));
  END IF;
  
  -- Apply linkedin bonus if applicable
  IF v_bonus_linkedin > 0 THEN
    PERFORM add_credits(p_client_id, v_module_id, 'linkedin', v_bonus_linkedin, v_expires_at,
                       format('Tier bonus: %s LinkedIn for %s tier', v_bonus_linkedin, p_new_tier));
    v_result := jsonb_set(v_result, '{bonuses_applied}', 
                         (v_result->'bonuses_applied') || jsonb_build_array(format('linkedin_%s', v_bonus_linkedin)));
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle monthly credit refills
CREATE OR REPLACE FUNCTION handle_monthly_credit_refill(p_client_id UUID, p_module TEXT)
RETURNS JSONB AS $$
DECLARE
  v_module_id UUID;
  v_tier_info RECORD;
  v_current_date DATE := CURRENT_DATE;
  v_result JSONB := '{"refills_applied": []}'::JSONB;
BEGIN
  -- Get module_id
  SELECT id INTO v_module_id FROM modules WHERE slug = p_module LIMIT 1;
  
  IF v_module_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Module not found');
  END IF;
  
  -- Get client's current tier and credits info
  SELECT 
    cm.tier,
    mt.name as tier_name
  INTO v_tier_info
  FROM client_modules cm
  JOIN module_tiers mt ON mt.module = cm.module AND mt.tier = cm.tier
  WHERE cm.client_id = p_client_id 
    AND cm.module = p_module::module_type
    AND cm.activated_at IS NOT NULL;
  
  IF v_tier_info IS NULL THEN
    RETURN jsonb_build_object('error', 'No active tier found for client');
  END IF;
  
  -- Skip refill for unlimited tier
  IF v_tier_info.tier = 'unlimited' THEN
    RETURN jsonb_build_object('message', 'Unlimited tier - no refill needed');
  END IF;
  
  -- Get tier credit amounts from module_tier_credits
  FOR v_credit_record IN 
    SELECT mtc.credit_type, mtc.amount, mtc.reset_interval
    FROM module_tier_credits mtc
    JOIN module_tiers mt ON mt.id = mtc.module_tier_id
    WHERE mt.module = p_module::module_type 
      AND mt.tier = v_tier_info.tier
      AND mt.is_active = true
  LOOP
    -- Check if refill is needed based on reset interval
    DECLARE
      v_should_refill BOOLEAN := FALSE;
      v_last_refill_date DATE;
    BEGIN
      -- Get last refill date from client_credits
      SELECT period_start INTO v_last_refill_date
      FROM client_credits
      WHERE client_id = p_client_id 
        AND module = p_module::module_type
        AND credit_type = v_credit_record.credit_type;
      
      -- Determine if refill is needed
      IF v_credit_record.reset_interval = 'monthly' THEN
        v_should_refill := (v_last_refill_date IS NULL OR 
                           v_last_refill_date < DATE_TRUNC('month', v_current_date));
      ELSIF v_credit_record.reset_interval = 'weekly' THEN
        v_should_refill := (v_last_refill_date IS NULL OR 
                           v_last_refill_date < DATE_TRUNC('week', v_current_date));
      END IF;
      
      IF v_should_refill THEN
        -- Add credits for refill
        PERFORM add_credits(
          p_client_id, 
          v_module_id, 
          v_credit_record.credit_type, 
          v_credit_record.amount, 
          CASE 
            WHEN v_credit_record.reset_interval = 'monthly' THEN v_current_date + INTERVAL '1 month'
            WHEN v_credit_record.reset_interval = 'weekly' THEN v_current_date + INTERVAL '1 week'
          END,
          format('Monthly refill: %s %s credits', v_credit_record.amount, v_credit_record.credit_type)
        );
        
        -- Update client_credits tracking
        INSERT INTO client_credits (client_id, module, credit_type, used_this_period, period_start, reset_interval)
        VALUES (p_client_id, p_module::module_type, v_credit_record.credit_type, 0, v_current_date, v_credit_record.reset_interval)
        ON CONFLICT (client_id, module, credit_type)
        DO UPDATE SET 
          used_this_period = 0,
          period_start = v_current_date,
          updated_at = NOW();
          
        v_result := jsonb_set(v_result, '{refills_applied}', 
                             (v_result->'refills_applied') || jsonb_build_array(format('%s_%s', v_credit_record.credit_type, v_credit_record.amount)));
      END IF;
    END;
  END LOOP;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic tier bonus application
CREATE OR REPLACE FUNCTION trigger_tier_bonus_on_module_activation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a new activation (first time or reactivation)
  IF NEW.activated_at IS NOT NULL AND (OLD.activated_at IS NULL OR OLD.tier != NEW.tier) THEN
    -- Set first_activated_at if not already set for this tier
    IF NEW.first_activated_at IS NULL THEN
      NEW.first_activated_at := NEW.activated_at;
    END IF;
    
    -- Apply tier bonus for lead_engine module
    IF NEW.module = 'lead_engine' THEN
      PERFORM handle_tier_credit_bonus(
        NEW.client_id, 
        NEW.module::TEXT, 
        NEW.tier, 
        TRUE -- is_first_activation
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic tier bonus application
DROP TRIGGER IF EXISTS trigger_client_module_tier_bonus ON client_modules;
CREATE TRIGGER trigger_client_module_tier_bonus
  BEFORE UPDATE ON client_modules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_tier_bonus_on_module_activation();

-- Grant permissions
GRANT EXECUTE ON FUNCTION handle_tier_credit_bonus(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_monthly_credit_refill(UUID, TEXT) TO authenticated;
