-- Complete Database Setup Migration
-- This migration creates the entire database structure from scratch

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create basic tables
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  country TEXT,
  phone TEXT,
  linkedin_url TEXT,
  website TEXT,
  company_size TEXT,
  annual_revenue TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'new',
  source TEXT,
  notes TEXT,
  company_summary TEXT,
  product_match_percentage INTEGER,
  match_reasons TEXT[],
  unique_angles TEXT[],
  best_campaign_match TEXT,
  personalized_icebreaker TEXT,
  enrichment_status TEXT DEFAULT 'pending',
  enrichment_date TIMESTAMP WITH TIME ZONE,
  contact_status TEXT DEFAULT 'not_contacted',
  contact_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create credits system tables
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
  UNIQUE(client_id, module_id, credit_type)
);

CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_refill_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);
CREATE INDEX IF NOT EXISTS idx_leads_company_summary ON leads(company_summary);
CREATE INDEX IF NOT EXISTS idx_leads_enrichment_status ON leads(enrichment_status);

CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);

CREATE INDEX IF NOT EXISTS idx_credits_client_module_type ON credits(client_id, module_id, credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_client_type ON credit_usage_logs(client_id, credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_refill_logs_client_type ON credit_refill_logs(client_id, credit_type);

-- 4. Create RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_refill_logs ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own client" ON clients
  FOR SELECT USING (id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Leads policies
CREATE POLICY "Users can view leads from their client" ON leads
  FOR SELECT USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert leads for their client" ON leads
  FOR INSERT WITH CHECK (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update leads from their client" ON leads
  FOR UPDATE USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete leads from their client" ON leads
  FOR DELETE USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- Contacts policies
CREATE POLICY "Users can view contacts from their client" ON contacts
  FOR SELECT USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert contacts for their client" ON contacts
  FOR INSERT WITH CHECK (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update contacts from their client" ON contacts
  FOR UPDATE USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete contacts from their client" ON contacts
  FOR DELETE USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- Credits policies
CREATE POLICY "Users can view credits from their client" ON credits
  FOR SELECT USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update credits from their client" ON credits
  FOR UPDATE USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- Credit usage logs policies
CREATE POLICY "Users can view credit usage logs from their client" ON credit_usage_logs
  FOR SELECT USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert credit usage logs for their client" ON credit_usage_logs
  FOR INSERT WITH CHECK (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- Credit refill logs policies
CREATE POLICY "Users can view credit refill logs from their client" ON credit_refill_logs
  FOR SELECT USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert credit refill logs for their client" ON credit_refill_logs
  FOR INSERT WITH CHECK (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

-- 5. Create functions
CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
  current_balance INTEGER;
  credit_record RECORD;
BEGIN
  -- Get client_id for current user
  SELECT u.client_id INTO client_id
  FROM users u
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Get current credit balance
  SELECT c.* INTO credit_record
  FROM credits c
  WHERE c.client_id = check_and_use_credits.client_id
    AND c.credit_type = check_and_use_credits.credit_type
    AND (c.expires_at IS NULL OR c.expires_at > NOW())
  ORDER BY c.created_at DESC
  LIMIT 1;
  
  -- If no credits found, return false
  IF credit_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If unlimited credits, return true
  IF credit_record.is_unlimited THEN
    RETURN TRUE;
  END IF;
  
  -- Check if enough credits
  IF credit_record.balance < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE credits
  SET balance = balance - amount,
      updated_at = NOW()
  WHERE id = credit_record.id;
  
  -- Log the usage
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description)
  VALUES (check_and_use_credits.client_id, check_and_use_credits.credit_type, amount, description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_contacts_with_lead_data()
RETURNS TABLE (
  id UUID,
  lead_id UUID,
  client_id UUID,
  contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_email TEXT,
  lead_company_name TEXT,
  lead_job_title TEXT,
  lead_industry TEXT,
  lead_country TEXT,
  lead_company_summary TEXT,
  lead_product_match_percentage INTEGER,
  lead_match_reasons TEXT[],
  lead_unique_angles TEXT[],
  lead_best_campaign_match TEXT,
  lead_personalized_icebreaker TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.lead_id,
    c.client_id,
    c.contact_date,
    c.notes,
    c.status,
    c.created_at,
    c.updated_at,
    l.first_name,
    l.last_name,
    l.email,
    l.company_name,
    l.job_title,
    l.industry,
    l.country,
    l.company_summary,
    l.product_match_percentage,
    l.match_reasons,
    l.unique_angles,
    l.best_campaign_match,
    l.personalized_icebreaker
  FROM contacts c
  JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id IN (
    SELECT cl.id FROM clients cl 
    JOIN users u ON cl.id = u.client_id 
    WHERE u.id = auth.uid()
  )
  ORDER BY c.contact_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM leads 
    WHERE id = convert_lead_to_contact.lead_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid';
  END IF;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = convert_lead_to_contact.lead_id 
      AND client_id = convert_lead_to_contact.client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Check and use credits
  SELECT check_and_use_credits('leads', 1, 'Convert lead to contact') INTO credit_check;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits to convert lead';
  END IF;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
  RETURNING id INTO contact_id;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION check_and_use_credits(TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contacts_with_lead_data() TO authenticated;
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;

-- 7. Insert default modules
INSERT INTO modules (name, description) VALUES
  ('leads', 'Lead management and enrichment'),
  ('contacts', 'Contact management and conversion'),
  ('campaigns', 'Campaign management'),
  ('analytics', 'Analytics and reporting')
ON CONFLICT (name) DO NOTHING;

-- 8. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
