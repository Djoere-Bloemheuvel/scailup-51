
-- Step 1: Core table structure restoration
-- First, let's ensure all core tables exist with proper structure

-- Ensure leads table has all required columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_number INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_size_text TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags_normalized TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Ensure contacts table has proper structure
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure clients table has proper user_id relationship
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create unique constraint on clients.user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_user_id_key') THEN
        ALTER TABLE clients ADD CONSTRAINT clients_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Ensure users table has proper client_id relationship
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- Add updated_at triggers for core tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
