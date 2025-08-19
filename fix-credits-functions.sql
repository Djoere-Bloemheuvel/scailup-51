-- Fix Credits Functions - Drop old functions first
-- This script drops the old functions and recreates them with the correct parameters

-- 1. Drop existing functions that might conflict
DROP FUNCTION IF EXISTS check_and_use_credits(text, integer, text);
DROP FUNCTION IF EXISTS check_and_use_credits(credit_type text, amount integer, description text);
DROP FUNCTION IF EXISTS add_credits(UUID, UUID, TEXT, INTEGER, TIMESTAMP WITH TIME ZONE, TEXT);
DROP FUNCTION IF EXISTS use_credits(UUID, UUID, TEXT, INTEGER, TEXT, UUID);
DROP FUNCTION IF EXISTS get_credit_balance(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS set_unlimited_credits(UUID, UUID, TEXT);

-- 2. Create function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT,
  p_amount INTEGER,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_credit_id UUID;
  v_balance_before INTEGER;
  v_balance_after INTEGER;
BEGIN
  -- Insert or update credits record
  INSERT INTO credits (
    client_id, 
    module_id, 
    credit_type, 
    amount, 
    balance, 
    expires_at
  ) VALUES (
    p_client_id, 
    p_module_id, 
    p_credit_type, 
    p_amount, 
    p_amount, 
    COALESCE(p_expires_at, NOW() + INTERVAL '1 year')
  )
  ON CONFLICT (client_id, module_id, credit_type) 
  DO UPDATE SET 
    amount = credits.amount + EXCLUDED.amount,
    balance = credits.balance + EXCLUDED.amount,
    expires_at = COALESCE(EXCLUDED.expires_at, credits.expires_at),
    updated_at = NOW()
  RETURNING id, balance INTO v_credit_id, v_balance_after;
  
  -- Get balance before for transaction log
  SELECT COALESCE(balance - p_amount, 0) INTO v_balance_before
  FROM credits 
  WHERE id = v_credit_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to use credits
CREATE OR REPLACE FUNCTION use_credits(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_credit_id UUID;
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_is_unlimited BOOLEAN;
BEGIN
  -- Get current credit record
  SELECT id, balance, is_unlimited INTO v_credit_id, v_balance_before, v_is_unlimited
  FROM credits 
  WHERE client_id = p_client_id 
    AND module_id = p_module_id 
    AND credit_type = p_credit_type
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Check if credits exist and are sufficient
  IF v_credit_id IS NULL THEN
    RAISE EXCEPTION 'No credits found for client % module % type %', p_client_id, p_module_id, p_credit_type;
  END IF;
  
  IF NOT v_is_unlimited AND v_balance_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: % available, % required', v_balance_before, p_amount;
  END IF;
  
  -- Calculate new balance
  v_balance_after := CASE 
    WHEN v_is_unlimited THEN v_balance_before 
    ELSE v_balance_before - p_amount 
  END;
  
  -- Update credits
  UPDATE credits 
  SET balance = v_balance_after,
      updated_at = NOW()
  WHERE id = v_credit_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to check and use credits (for backward compatibility)
CREATE OR REPLACE FUNCTION check_and_use_credits(
  p_credit_type TEXT,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_client_id UUID;
  v_module_id UUID;
BEGIN
  -- Get current client ID
  SELECT c.id INTO v_client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Get module ID (default to lead_engine for backward compatibility)
  SELECT id INTO v_module_id
  FROM modules
  WHERE slug = CASE 
    WHEN p_credit_type = 'leads' THEN 'lead_engine'
    WHEN p_credit_type = 'emails' THEN 'marketing_engine'
    ELSE 'lead_engine'
  END
  LIMIT 1;
  
  IF v_module_id IS NULL THEN
    RAISE EXCEPTION 'Module not found';
  END IF;
  
  -- Use credits
  PERFORM use_credits(v_client_id, v_module_id, p_credit_type, p_amount, p_description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to get credit balance
CREATE OR REPLACE FUNCTION get_credit_balance(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT COALESCE(balance, 0) INTO v_balance
  FROM credits 
  WHERE client_id = p_client_id 
    AND module_id = p_module_id 
    AND credit_type = p_credit_type
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to set unlimited credits
CREATE OR REPLACE FUNCTION set_unlimited_credits(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_credit_id UUID;
BEGIN
  -- Insert or update credits record with unlimited flag
  INSERT INTO credits (
    client_id, 
    module_id, 
    credit_type, 
    amount, 
    balance, 
    is_unlimited
  ) VALUES (
    p_client_id, 
    p_module_id, 
    p_credit_type, 
    999999999, 
    999999999, 
    true
  )
  ON CONFLICT (client_id, module_id, credit_type) 
  DO UPDATE SET 
    is_unlimited = true,
    amount = 999999999,
    balance = 999999999,
    updated_at = NOW()
  RETURNING id INTO v_credit_id;
  
  RETURN v_credit_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION add_credits(UUID, UUID, TEXT, INTEGER, TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION use_credits(UUID, UUID, TEXT, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_use_credits(TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_balance(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_unlimited_credits(UUID, UUID, TEXT) TO authenticated;

-- 8. Add default credits for existing clients
DO $$
DECLARE
  client_record RECORD;
  module_record RECORD;
BEGIN
  -- Add default credits for all existing clients
  FOR client_record IN SELECT id FROM clients LOOP
    FOR module_record IN SELECT id, slug FROM modules LOOP
      -- Add default credits based on module
      CASE module_record.slug
        WHEN 'lead_engine' THEN
          PERFORM add_credits(client_record.id, module_record.id, 'leads', 100, NOW() + INTERVAL '3 months', 'Default credits for new client');
        WHEN 'marketing_engine' THEN
          PERFORM add_credits(client_record.id, module_record.id, 'emails', 1000, NOW() + INTERVAL '3 months', 'Default credits for new client');
          PERFORM add_credits(client_record.id, module_record.id, 'linkedin', 50, NOW() + INTERVAL '3 months', 'Default credits for new client');
        WHEN 'analytics' THEN
          PERFORM add_credits(client_record.id, module_record.id, 'reports', 10, NOW() + INTERVAL '3 months', 'Default credits for new client');
        ELSE
          PERFORM add_credits(client_record.id, module_record.id, 'standard', 100, NOW() + INTERVAL '3 months', 'Default credits for new client');
      END CASE;
    END LOOP;
  END LOOP;
END $$; 