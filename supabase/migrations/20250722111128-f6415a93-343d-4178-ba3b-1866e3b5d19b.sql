
-- Step 2: Restore Row Level Security (RLS) policies
-- This ensures proper data access control and security

-- Enable RLS on all core tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their client leads" ON leads;
DROP POLICY IF EXISTS "Users can insert leads for their client" ON leads;
DROP POLICY IF EXISTS "Users can update their client leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their client leads" ON leads;

DROP POLICY IF EXISTS "Users can view their client contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their client contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their client contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their client contacts" ON contacts;

DROP POLICY IF EXISTS "Users can view their own client" ON clients;
DROP POLICY IF EXISTS "Users can update their own client" ON clients;
DROP POLICY IF EXISTS "System can create client records" ON clients;
DROP POLICY IF EXISTS "Allow email-based client lookup for registration" ON clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;

DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;

-- Create RLS policies for leads table
CREATE POLICY "Users can view their client leads" ON leads
  FOR SELECT USING (
    client_id = get_current_client_id() 
    AND email IS NOT NULL 
    AND email <> '' 
    AND (is_duplicate IS NULL OR is_duplicate = false)
  );

CREATE POLICY "Users can insert leads for their client" ON leads
  FOR INSERT WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can update their client leads" ON leads
  FOR UPDATE USING (client_id = get_current_client_id());

CREATE POLICY "Users can delete their client leads" ON leads
  FOR DELETE USING (client_id = get_current_client_id());

-- Create RLS policies for contacts table
CREATE POLICY "Users can view their client contacts" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.client_id = contacts.client_id
    )
  );

CREATE POLICY "Users can insert their client contacts" ON contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.client_id = contacts.client_id
    )
  );

CREATE POLICY "Users can update their client contacts" ON contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.client_id = contacts.client_id
    )
  );

CREATE POLICY "Users can delete their client contacts" ON contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.client_id = contacts.client_id
    )
  );

-- Create RLS policies for clients table
CREATE POLICY "Users can view their own client" ON clients
  FOR SELECT USING (
    id = get_current_client_id() OR admin = true
  );

CREATE POLICY "Users can update their own client" ON clients
  FOR UPDATE USING (id = get_current_client_id());

CREATE POLICY "System can create client records" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow email-based client lookup for registration" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.user_id = auth.uid() AND c.admin = true
    )
  );

-- Create RLS policies for users table
CREATE POLICY "Users can view their own record" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (id = auth.uid());
