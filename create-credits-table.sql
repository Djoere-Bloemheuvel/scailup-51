-- Create Credits Table - Simplified Version
-- This creates just the main credits table

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

-- 3. Enable Row Level Security
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for credits table
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

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_client_module_type ON credits(client_id, module_id, credit_type);
CREATE INDEX IF NOT EXISTS idx_credits_expires_at ON credits(expires_at);
CREATE INDEX IF NOT EXISTS idx_credits_balance ON credits(balance);
CREATE INDEX IF NOT EXISTS idx_credits_is_unlimited ON credits(is_unlimited);

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON credits TO authenticated;

-- 7. Add some test data
INSERT INTO credits (client_id, module_id, credit_type, amount, balance, expires_at)
SELECT 
  c.id as client_id,
  m.id as module_id,
  'leads' as credit_type,
  100 as amount,
  100 as balance,
  NOW() + INTERVAL '3 months' as expires_at
FROM clients c
CROSS JOIN modules m
WHERE m.slug = 'lead_engine'
ON CONFLICT (client_id, module_id, credit_type) DO NOTHING; 