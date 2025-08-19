-- Complete Credits System Migration
-- This migration creates the entire credits system with full functionality

-- 1. Drop existing credit-related tables if they exist
DROP TABLE IF EXISTS credit_balances CASCADE;
DROP TABLE IF EXISTS credit_usage_logs CASCADE;
DROP TABLE IF EXISTS credit_refill_logs CASCADE;

-- 2. Create the main credits table
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  balance INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_unlimited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of client, module, and credit type
  UNIQUE(client_id, module_id, credit_type)
);

-- 3. Create credit transactions table for logging all credit activities
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID REFERENCES credits(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add', 'subtract', 'expire', 'refill')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_id UUID, -- For linking to specific actions (leads, contacts, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create credit usage logs table (for backward compatibility)
CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for credits table
CREATE POLICY "Users can view their own credits" 
  ON credits 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "System can manage all credits" 
  ON credits 
  FOR ALL 
  USING (true);

-- 7. Create RLS policies for credit_transactions table
CREATE POLICY "Users can view their own credit transactions" 
  ON credit_transactions 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "System can create credit transactions" 
  ON credit_transactions 
  FOR INSERT 
  WITH CHECK (true);

-- 8. Create RLS policies for credit_usage_logs table (backward compatibility)
CREATE POLICY "Users can view their own credit usage logs" 
  ON credit_usage_logs 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "System can create credit usage logs" 
  ON credit_usage_logs 
  FOR INSERT 
  WITH CHECK (true);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_client_module_type ON credits(client_id, module_id, credit_type);
CREATE INDEX IF NOT EXISTS idx_credits_expires_at ON credits(expires_at);
CREATE INDEX IF NOT EXISTS idx_credits_balance ON credits(balance);
CREATE INDEX IF NOT EXISTS idx_credits_is_unlimited ON credits(is_unlimited);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_credit_id ON credit_transactions(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_client_id ON credit_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_client_id ON credit_usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_used_at ON credit_usage_logs(used_at);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_credit_type ON credit_usage_logs(credit_type);

-- 10. Create function to add credits
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
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    credit_id,
    client_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    v_credit_id,
    p_client_id,
    'add',
    p_amount,
    v_balance_before,
    v_balance_after,
    COALESCE(p_description, 'Credits added')
  );
  
  -- Also log in credit_usage_logs for backward compatibility
  INSERT INTO credit_usage_logs (
    client_id,
    module_id,
    credit_type,
    amount,
    description
  ) VALUES (
    p_client_id,
    p_module_id,
    p_credit_type,
    p_amount,
    COALESCE(p_description, 'Credits added')
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to use credits
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
  -- Get credit record
  SELECT id, balance, is_unlimited INTO v_credit_id, v_balance_before, v_is_unlimited
  FROM credits 
  WHERE client_id = p_client_id 
    AND module_id = p_module_id 
    AND credit_type = p_credit_type;
  
  -- If no record exists, return false
  IF v_credit_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If unlimited credits, always allow
  IF v_is_unlimited THEN
    -- Log the usage without deducting
    INSERT INTO credit_transactions (
      credit_id,
      client_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      related_id
    ) VALUES (
      v_credit_id,
      p_client_id,
      'subtract',
      p_amount,
      v_balance_before,
      v_balance_before,
      COALESCE(p_description, 'Credits used (unlimited)'),
      p_related_id
    );
    
    -- Also log in credit_usage_logs for backward compatibility
    INSERT INTO credit_usage_logs (
      client_id,
      module_id,
      credit_type,
      amount,
      description,
      related_id
    ) VALUES (
      p_client_id,
      p_module_id,
      p_credit_type,
      p_amount,
      COALESCE(p_description, 'Credits used (unlimited)'),
      p_related_id
    );
    
    RETURN TRUE;
  END IF;
  
  -- Check if enough credits available
  IF v_balance_before < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new balance
  v_balance_after := v_balance_before - p_amount;
  
  -- Update credits
  UPDATE credits SET
    balance = v_balance_after,
    updated_at = NOW()
  WHERE id = v_credit_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    credit_id,
    client_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    related_id
  ) VALUES (
    v_credit_id,
    p_client_id,
    'subtract',
    p_amount,
    v_balance_before,
    v_balance_after,
    COALESCE(p_description, 'Credits used'),
    p_related_id
  );
  
  -- Also log in credit_usage_logs for backward compatibility
  INSERT INTO credit_usage_logs (
    client_id,
    module_id,
    credit_type,
    amount,
    description,
    related_id
  ) VALUES (
    p_client_id,
    p_module_id,
    p_credit_type,
    p_amount,
    COALESCE(p_description, 'Credits used'),
    p_related_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to check and use credits (backward compatibility)
CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
  module_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get module_id for lead_engine
  SELECT id INTO module_id
  FROM modules
  WHERE slug = 'lead_engine'
  LIMIT 1;
  
  IF module_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use the new use_credits function
  RETURN use_credits(client_id, module_id, credit_type, amount, description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to get credit balance
CREATE OR REPLACE FUNCTION get_credit_balance(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
  v_is_unlimited BOOLEAN;
BEGIN
  SELECT balance, is_unlimited INTO v_balance, v_is_unlimited
  FROM credits 
  WHERE client_id = p_client_id 
    AND module_id = p_module_id 
    AND credit_type = p_credit_type;
  
  IF v_is_unlimited THEN
    RETURN 999999999;
  END IF;
  
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to set unlimited credits
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

-- 15. Grant permissions
GRANT SELECT, INSERT, UPDATE ON credits TO authenticated;
GRANT SELECT, INSERT ON credit_transactions TO authenticated;
GRANT SELECT, INSERT ON credit_usage_logs TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits(UUID, UUID, TEXT, INTEGER, TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION use_credits(UUID, UUID, TEXT, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_use_credits(TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_balance(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_unlimited_credits(UUID, UUID, TEXT) TO authenticated;

-- 16. Add default credits for existing clients
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

-- 17. Set up super admin with unlimited credits
DO $$
DECLARE
  admin_client_id UUID;
  module_record RECORD;
BEGIN
  -- Find admin client
  SELECT id INTO admin_client_id
  FROM clients 
  WHERE admin = true 
  LIMIT 1;
  
  IF admin_client_id IS NOT NULL THEN
    -- Add unlimited credits for all modules and credit types
    FOR module_record IN SELECT id, slug FROM modules LOOP
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'leads');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'emails');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'linkedin');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'campaigns');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'webhooks');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'api_calls');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'seo_reports');
      PERFORM set_unlimited_credits(admin_client_id, module_record.id, 'social_posts');
    END LOOP;
  END IF;
END $$;

-- 18. Create trigger function for new clients
CREATE OR REPLACE FUNCTION handle_new_client_credits()
RETURNS TRIGGER AS $$
DECLARE
  module_record RECORD;
BEGIN
  -- Add default credits for new client
  FOR module_record IN SELECT id, slug FROM modules LOOP
    CASE module_record.slug
      WHEN 'lead_engine' THEN
        PERFORM add_credits(NEW.id, module_record.id, 'leads', 100, NOW() + INTERVAL '3 months', 'Welcome credits for new client');
      WHEN 'marketing_engine' THEN
        PERFORM add_credits(NEW.id, module_record.id, 'emails', 1000, NOW() + INTERVAL '3 months', 'Welcome credits for new client');
        PERFORM add_credits(NEW.id, module_record.id, 'linkedin', 50, NOW() + INTERVAL '3 months', 'Welcome credits for new client');
      WHEN 'analytics' THEN
        PERFORM add_credits(NEW.id, module_record.id, 'reports', 10, NOW() + INTERVAL '3 months', 'Welcome credits for new client');
      ELSE
        PERFORM add_credits(NEW.id, module_record.id, 'standard', 100, NOW() + INTERVAL '3 months', 'Welcome credits for new client');
    END CASE;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new clients
DROP TRIGGER IF EXISTS trigger_new_client_credits ON clients;
CREATE TRIGGER trigger_new_client_credits
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_client_credits();

-- 19. Create view for credit balances (for backward compatibility)
CREATE OR REPLACE VIEW credit_balances AS
SELECT 
  c.id,
  c.client_id,
  c.module_id,
  c.credit_type,
  c.balance as amount,
  c.expires_at,
  c.created_at,
  c.updated_at
FROM credits c;

-- Grant permissions on the view
GRANT SELECT ON credit_balances TO authenticated;

-- 20. Log the migration
INSERT INTO admin_logs (
  action,
  details,
  created_at
) VALUES (
  'credits_system_created',
  '{"action": "created_complete_credits_system", "main_table": "credits", "backward_compatible": true, "lovable_compatible": true}',
  NOW()
);
