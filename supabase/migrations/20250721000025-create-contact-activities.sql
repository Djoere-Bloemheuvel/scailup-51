-- Create Contact Activities Table
-- This table tracks all activities related to contacts for comprehensive CRM functionality

-- 1. Create contact_activities table
CREATE TABLE IF NOT EXISTS contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  client_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'email_sent', 'email_received', 'call_made', 'call_received', 
    'meeting_scheduled', 'meeting_completed', 'note_added', 'status_changed',
    'enrichment_completed', 'webhook_triggered', 'lead_converted', 'follow_up_scheduled'
  )),
  activity_title VARCHAR(255) NOT NULL,
  activity_description TEXT,
  activity_outcome VARCHAR(100),
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_contact_activities_contact_id FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  CONSTRAINT fk_contact_activities_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 2. Enable RLS
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view their own contact activities" ON contact_activities
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own contact activities" ON contact_activities
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own contact activities" ON contact_activities
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own contact activities" ON contact_activities
  FOR DELETE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 4. Create indexes for performance
CREATE INDEX idx_contact_activities_contact_id ON contact_activities(contact_id);
CREATE INDEX idx_contact_activities_client_id ON contact_activities(client_id);
CREATE INDEX idx_contact_activities_activity_type ON contact_activities(activity_type);
CREATE INDEX idx_contact_activities_activity_date ON contact_activities(activity_date);
CREATE INDEX idx_contact_activities_created_at ON contact_activities(created_at);

-- 5. Create function to log contact activities
CREATE OR REPLACE FUNCTION log_contact_activity(
  p_contact_id UUID,
  p_activity_type VARCHAR(50),
  p_activity_title VARCHAR(255),
  p_activity_description TEXT DEFAULT NULL,
  p_activity_outcome VARCHAR(100) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
  v_activity_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO v_client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Verify contact belongs to this client
  IF NOT EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = p_contact_id AND client_id = v_client_id
  ) THEN
    RAISE EXCEPTION 'Contact not found or access denied';
  END IF;
  
  -- Insert activity
  INSERT INTO contact_activities (
    contact_id,
    client_id,
    activity_type,
    activity_title,
    activity_description,
    activity_outcome,
    metadata
  ) VALUES (
    p_contact_id,
    v_client_id,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_activity_outcome,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get contact activities with lead data
CREATE OR REPLACE FUNCTION get_contact_activities_with_lead_data(p_contact_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  contact_id UUID,
  client_id UUID,
  activity_type VARCHAR(50),
  activity_title VARCHAR(255),
  activity_description TEXT,
  activity_outcome VARCHAR(100),
  activity_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  -- Lead data
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_email TEXT,
  lead_company_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.contact_id,
    ca.client_id,
    ca.activity_type,
    ca.activity_title,
    ca.activity_description,
    ca.activity_outcome,
    ca.activity_date,
    ca.metadata,
    ca.created_at,
    ca.updated_at,
    l.first_name,
    l.last_name,
    l.email,
    l.company_name
  FROM contact_activities ca
  JOIN contacts c ON ca.contact_id = c.id
  JOIN leads l ON c.lead_id = l.id
  WHERE ca.client_id IN (
    SELECT cl.id FROM clients cl 
    JOIN users u ON cl.id = u.client_id 
    WHERE u.id = auth.uid()
  )
  AND (p_contact_id IS NULL OR ca.contact_id = p_contact_id)
  ORDER BY ca.activity_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update the convert_lead_to_contact function to log activity
CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  lead_data RECORD;
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
    RAISE EXCEPTION 'Lead not found or not accessible';
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
  
  -- Get lead data for activity logging
  SELECT * INTO lead_data FROM leads WHERE id = convert_lead_to_contact.lead_id;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
  RETURNING id INTO contact_id;
  
  -- Log the conversion activity
  PERFORM log_contact_activity(
    contact_id,
    'lead_converted',
    'Lead converted to contact',
    COALESCE(convert_lead_to_contact.notes, 'Lead successfully converted to contact'),
    'success',
    jsonb_build_object(
      'lead_name', COALESCE(lead_data.first_name || ' ' || lead_data.last_name, 'Unknown'),
      'company_name', lead_data.company_name,
      'email', lead_data.email
    )
  );
  
  -- Log the conversion in credit usage
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
  VALUES (convert_lead_to_contact.client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_activities_updated_at
  BEFORE UPDATE ON contact_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_activities_updated_at(); 