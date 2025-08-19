-- Quick fix migration: Create contacts table with proper relationships
-- This migration resolves the "Could not find a relationship between 'contacts' and 'leads'" error

-- Drop existing contacts table if it exists (to recreate with proper relationships)
DROP TABLE IF EXISTS contacts CASCADE;

-- Create contacts table with proper foreign key relationships
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  client_id UUID NOT NULL,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add foreign key constraints
  CONSTRAINT fk_contacts_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_contacts_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create indexes
CREATE INDEX idx_contacts_client_id ON contacts(client_id);
CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX idx_contacts_contact_date ON contacts(contact_date);

-- Create the convert_lead_to_contact function
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
  
  -- Update lead status if the column exists
  BEGIN
    UPDATE leads SET
      contact_status = 'contact',
      contact_date = NOW(),
      updated_at = NOW()
    WHERE id = lead_id;
  EXCEPTION WHEN undefined_column THEN
    -- Column doesn't exist yet, skip the update
    NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 