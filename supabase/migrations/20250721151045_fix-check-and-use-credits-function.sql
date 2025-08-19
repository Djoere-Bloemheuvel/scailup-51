-- Fix check_and_use_credits function by removing modules table dependency
-- Update the function to work without the modules table

CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
  available_credits INTEGER := 0;
  credit_balance RECORD;
  remaining_amount INTEGER;
BEGIN
  -- Get current user's client
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check available credits
  SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
  FROM credit_balances cb
  WHERE cb.client_id = client_id
    AND cb.credit_type = check_and_use_credits.credit_type
    AND cb.expires_at > NOW()
    AND cb.amount > 0;
  
  -- Check if enough credits are available
  IF available_credits < amount THEN
    RAISE EXCEPTION 'Insufficient credits: % available, % required', available_credits, amount;
  END IF;
  
  -- Use credits (deduct from balances)
  remaining_amount := amount;
  
  FOR credit_balance IN
    SELECT cb.id, cb.amount
    FROM credit_balances cb
    WHERE cb.client_id = client_id
      AND cb.credit_type = check_and_use_credits.credit_type
      AND cb.expires_at > NOW()
      AND cb.amount > 0
    ORDER BY cb.expires_at ASC
  LOOP
    IF remaining_amount <= 0 THEN
      EXIT;
    END IF;
    
    IF credit_balance.amount >= remaining_amount THEN
      -- This balance has enough credits
      UPDATE credit_balances
      SET amount = amount - remaining_amount
      WHERE id = credit_balance.id;
      remaining_amount := 0;
    ELSE
      -- Use all credits from this balance
      UPDATE credit_balances
      SET amount = 0
      WHERE id = credit_balance.id;
      remaining_amount := remaining_amount - credit_balance.amount;
    END IF;
  END LOOP;
  
  -- Log the credit usage (without modules table dependency)
  INSERT INTO credit_usage_logs (
    client_id,
    credit_type,
    amount,
    description,
    used_at
  )
  VALUES (
    client_id,
    check_and_use_credits.credit_type,
    check_and_use_credits.amount,
    check_and_use_credits.description,
    NOW()
  );
  
  RETURN TRUE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_and_use_credits(TEXT, INTEGER, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION check_and_use_credits(TEXT, INTEGER, TEXT) IS 
'Check and use credits for a client, without modules table dependency'; 