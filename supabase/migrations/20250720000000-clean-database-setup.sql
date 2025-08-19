-- Clean Database Setup Migration
-- Removes admin account and ensures proper auth flow
-- DIRECT LOVABLE COMPATIBILITY - SQL only

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS trigger_link_admin_user ON auth.users;
DROP TRIGGER IF EXISTS trigger_ensure_admin_credits ON clients;
DROP FUNCTION IF EXISTS link_admin_user();
DROP FUNCTION IF EXISTS ensure_admin_credits();

-- Clean up any existing admin records
DELETE FROM clients WHERE email = 'djoere@scailup.io' AND admin = true;
DELETE FROM users WHERE email = 'djoere@scailup.io';
DELETE FROM credit_balances WHERE client_id IN (
  SELECT id FROM clients WHERE email = 'djoere@scailup.io'
);

-- Create function to automatically link user to client
CREATE OR REPLACE FUNCTION link_user_to_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is already linked
  IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Create new client for this user
  INSERT INTO clients (
    user_id,
    email,
    first_name,
    last_name,
    company_name,
    is_active,
    plan,
    admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    true,
    'free',
    false,
    NOW(),
    NOW()
  );

  -- Link user to client
  INSERT INTO users (
    id,
    client_id,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    (SELECT id FROM clients WHERE user_id = NEW.id),
    NEW.email,
    NOW(),
    NOW()
  );

  -- Create credit balance for new client
  INSERT INTO credit_balances (
    client_id,
    credits,
    unlimited,
    created_at,
    updated_at
  ) VALUES (
    (SELECT id FROM clients WHERE user_id = NEW.id),
    100,
    false,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically link user on auth.users insert
CREATE TRIGGER trigger_link_user_to_client
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_user_to_client();

-- Update RLS policies for proper access control
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Clients can view own data" ON clients;
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clients can update own data" ON clients;
CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Credit balances can view own data" ON credit_balances;
CREATE POLICY "Credit balances can view own data" ON credit_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = credit_balances.client_id 
      AND c.user_id = auth.uid()
    )
  );

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY; 