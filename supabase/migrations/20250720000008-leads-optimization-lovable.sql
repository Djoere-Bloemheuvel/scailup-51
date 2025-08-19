-- Migration: Leads Optimization for Lovable Compatibility
-- This migration adds necessary columns and functions for lead optimization
-- while maintaining full Lovable compatibility

-- Add new columns to leads table for optimization
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS duplicate_of_lead_id UUID REFERENCES leads(id),
ADD COLUMN IF NOT EXISTS company_summary TEXT,
ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER,
ADD COLUMN IF NOT EXISTS match_reasons TEXT[],
ADD COLUMN IF NOT EXISTS unique_angles TEXT[],
ADD COLUMN IF NOT EXISTS best_campaign_match TEXT,
ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'enriched', 'failed')),
ADD COLUMN IF NOT EXISTS enrichment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'lead' CHECK (contact_status IN ('lead', 'contact', 'converted')),
ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP WITH TIME ZONE;

-- Create contacts table for converted leads
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

-- Create lead enrichment logs table
CREATE TABLE IF NOT EXISTS lead_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  enrichment_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  enrichment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead deduplication logs table
CREATE TABLE IF NOT EXISTS lead_deduplication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  existing_lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('merged', 'marked_duplicate', 'kept_separate')),
  merged_fields TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_enrichment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_deduplication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts table
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

-- Function to check for duplicate leads by email
CREATE OR REPLACE FUNCTION check_lead_duplicate(new_email TEXT, new_lead_id UUID DEFAULT NULL)
RETURNS TABLE(
  is_duplicate BOOLEAN,
  existing_lead_id UUID,
  existing_lead_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as is_duplicate,
    l.id as existing_lead_id,
    to_jsonb(l.*) as existing_lead_data
  FROM leads l
  WHERE l.email = new_email 
    AND l.email IS NOT NULL 
    AND l.email != ''
    AND (new_lead_id IS NULL OR l.id != new_lead_id)
    AND l.is_duplicate = FALSE
  LIMIT 1;
  
  -- If no duplicate found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to merge lead data (only fill empty fields)
CREATE OR REPLACE FUNCTION merge_lead_data(new_lead_data JSONB, existing_lead_id UUID)
RETURNS JSONB AS $$
DECLARE
  existing_lead JSONB;
  merged_data JSONB;
  field_name TEXT;
  field_value JSONB;
BEGIN
  -- Get existing lead data
  SELECT to_jsonb(l.*) INTO existing_lead
  FROM leads l
  WHERE l.id = existing_lead_id;
  
  IF existing_lead IS NULL THEN
    RETURN new_lead_data;
  END IF;
  
  -- Start with existing data
  merged_data := existing_lead;
  
  -- Merge only empty fields from new data
  FOR field_name, field_value IN SELECT * FROM jsonb_each(new_lead_data)
  LOOP
    -- Skip id, created_at, updated_at fields
    IF field_name NOT IN ('id', 'created_at', 'updated_at') THEN
      -- If existing field is null/empty and new field has value, use new value
      IF (existing_lead->>field_name IS NULL OR existing_lead->>field_name = '') 
         AND field_value IS NOT NULL AND field_value != '""' AND field_value != 'null' THEN
        merged_data := jsonb_set(merged_data, ARRAY[field_name], field_value);
      END IF;
    END IF;
  END LOOP;
  
  RETURN merged_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if lead needs enrichment
CREATE OR REPLACE FUNCTION check_lead_enrichment_needs(lead_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lead_record RECORD;
BEGIN
  SELECT * INTO lead_record
  FROM leads
  WHERE id = lead_id;
  
  -- Check if lead needs enrichment (missing company_summary)
  RETURN lead_record.company_summary IS NULL OR lead_record.company_summary = '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark lead as enriched
CREATE OR REPLACE FUNCTION mark_lead_enriched(
  lead_id UUID,
  company_summary TEXT,
  product_match_percentage INTEGER,
  match_reasons TEXT[],
  unique_angles TEXT[],
  best_campaign_match TEXT,
  personalized_icebreaker TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE leads SET
    company_summary = mark_lead_enriched.company_summary,
    product_match_percentage = mark_lead_enriched.product_match_percentage,
    match_reasons = mark_lead_enriched.match_reasons,
    unique_angles = mark_lead_enriched.unique_angles,
    best_campaign_match = mark_lead_enriched.best_campaign_match,
    personalized_icebreaker = mark_lead_enriched.personalized_icebreaker,
    enrichment_status = 'enriched',
    enrichment_date = NOW(),
    updated_at = NOW()
  WHERE id = lead_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get enrichment workflow data for N8N
CREATE OR REPLACE FUNCTION get_enrichment_workflow_data(lead_id UUID)
RETURNS JSONB AS $$
DECLARE
  lead_data JSONB;
  client_data JSONB;
  result JSONB;
BEGIN
  -- Get lead data
  SELECT to_jsonb(l.*) INTO lead_data
  FROM leads l
  WHERE l.id = lead_id;
  
  -- Get client data for the lead
  SELECT to_jsonb(c.*) INTO client_data
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid()
  LIMIT 1;
  
  -- Combine data for N8N workflow
  result := jsonb_build_object(
    'lead', lead_data,
    'client', client_data,
    'workflow_timestamp', NOW(),
    'enrichment_required', lead_data->>'company_summary' IS NULL OR lead_data->>'company_summary' = ''
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert lead to contact
CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Create contact record
  INSERT INTO contacts (lead_id, client_id, notes)
  VALUES (lead_id, client_id, notes)
  RETURNING id INTO contact_id;
  
  -- Update lead status
  UPDATE leads SET
    contact_status = 'contact',
    contact_date = NOW(),
    updated_at = NOW()
  WHERE id = lead_id;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and use credits for lead actions
CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
  available_credits INTEGER;
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
  
  -- Check available credits
  SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
  FROM credit_balances cb
  WHERE cb.client_id = check_and_use_credits.client_id
    AND cb.credit_type = check_and_use_credits.credit_type
    AND cb.module_id = module_id
    AND cb.expires_at > NOW();
  
  -- If enough credits, use them
  IF available_credits >= amount THEN
    -- Deduct credits
    UPDATE credit_balances SET
      amount = amount - check_and_use_credits.amount,
      updated_at = NOW()
    WHERE client_id = check_and_use_credits.client_id
      AND credit_type = check_and_use_credits.credit_type
      AND module_id = module_id
      AND expires_at > NOW()
      AND amount >= check_and_use_credits.amount
    LIMIT 1;
    
    -- Log usage
    INSERT INTO credit_usage_logs (client_id, module_id, credit_type, amount, description)
    VALUES (client_id, module_id, credit_type, amount, description);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing leads RLS policy to filter out duplicates and leads without emails
DROP POLICY IF EXISTS "Users can view leads from their client" ON leads;

CREATE POLICY "Users can view leads from their client" ON leads
  FOR SELECT USING (
    user_id IN (
      SELECT u.id FROM users u 
      JOIN clients c ON u.client_id = c.id 
      WHERE c.id = (
        SELECT client_id FROM users WHERE id = auth.uid()
      )
    )
    AND email IS NOT NULL 
    AND email != ''
  );

-- Create indexes for better performance (only if columns exist)
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- Note: Additional indexes for new columns will be created in a separate migration
-- after the columns exist to ensure backwards compatibility

CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_logs_lead_id ON lead_enrichment_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_deduplication_logs_new_lead_id ON lead_deduplication_logs(new_lead_id); 