-- Migration: Fix leads visibility for all authenticated users
-- This migration ensures that all users with accounts can see leads
-- while maintaining full Lovable compatibility

-- First, let's create the contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead enrichment logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS lead_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  enrichment_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead deduplication logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS lead_deduplication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  existing_lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL CHECK (action_taken IN ('merged', 'marked_duplicate', 'kept_separate')),
  merge_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_enrichment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_deduplication_logs ENABLE ROW LEVEL SECURITY;

-- FIXED RLS Policies for leads - Allow all authenticated users to see leads
DROP POLICY IF EXISTS "Users can view leads from their client" ON leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;

CREATE POLICY "All authenticated users can view leads" ON leads
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND email IS NOT NULL 
    AND email != ''
  );

-- RLS Policies for contacts table - Allow users to see contacts from their client
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- RLS Policies for lead_enrichment_logs table
CREATE POLICY "Users can view their own enrichment logs" ON lead_enrichment_logs
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own enrichment logs" ON lead_enrichment_logs
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- RLS Policies for lead_deduplication_logs table
CREATE POLICY "Users can view their own deduplication logs" ON lead_deduplication_logs
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own deduplication logs" ON lead_deduplication_logs
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_logs_lead_id ON lead_enrichment_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_deduplication_logs_new_lead_id ON lead_deduplication_logs(new_lead_id); 