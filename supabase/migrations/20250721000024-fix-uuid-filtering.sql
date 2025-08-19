-- Migration: Fix UUID Filtering and Client ID Function
-- This migration ensures proper UUID handling and client identification for lead filtering
-- while maintaining full Lovable compatibility

-- Create or replace the get_current_client_id function with proper error handling
CREATE OR REPLACE FUNCTION get_current_client_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
  user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the client ID for this user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = user_id
  LIMIT 1;
  
  RETURN client_id;
END;
$$;

-- Create a helper function to get converted lead IDs with proper UUID validation
CREATE OR REPLACE FUNCTION get_converted_lead_ids(client_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_ids UUID[];
BEGIN
  -- Get converted lead IDs for the client with proper UUID validation
  SELECT ARRAY_AGG(c.lead_id) INTO lead_ids
  FROM contacts c
  WHERE c.client_id = get_converted_lead_ids.client_id
    AND c.lead_id IS NOT NULL;
  
  -- Return empty array if no results
  IF lead_ids IS NULL THEN
    RETURN ARRAY[]::UUID[];
  END IF;
  
  RETURN lead_ids;
END;
$$;

-- Create a function to get new leads count (not converted by client)
CREATE OR REPLACE FUNCTION get_new_leads_count(client_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  converted_ids UUID[];
  new_count INTEGER;
BEGIN
  -- Get converted lead IDs
  converted_ids := get_converted_lead_ids(client_id);
  
  -- Count leads that are not in the converted list
  IF array_length(converted_ids, 1) IS NULL OR array_length(converted_ids, 1) = 0 THEN
    -- No converted leads, all leads with email are new
    SELECT COUNT(*) INTO new_count
    FROM leads
    WHERE email IS NOT NULL AND email != '';
  ELSE
    -- Exclude converted leads
    SELECT COUNT(*) INTO new_count
    FROM leads
    WHERE email IS NOT NULL 
      AND email != ''
      AND id != ALL(converted_ids);
  END IF;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Create a function to get contacts count (converted by client)
CREATE OR REPLACE FUNCTION get_contacts_count(client_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contacts_count INTEGER;
BEGIN
  -- Count contacts for this client
  SELECT COUNT(*) INTO contacts_count
  FROM contacts c
  WHERE c.client_id = get_contacts_count.client_id
    AND c.lead_id IS NOT NULL;
  
  RETURN COALESCE(contacts_count, 0);
END;
$$;

-- Create a function to get lead status counts efficiently
CREATE OR REPLACE FUNCTION get_lead_status_counts()
RETURNS TABLE(
  total INTEGER,
  new INTEGER,
  contacts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  total_count INTEGER;
  new_count INTEGER;
  contacts_count INTEGER;
BEGIN
  -- Get current client ID
  current_client_id := get_current_client_id();
  
  IF current_client_id IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;
  
  -- Get total leads count
  SELECT COUNT(*) INTO total_count
  FROM leads
  WHERE email IS NOT NULL AND email != '';
  
  -- Get new and contacts counts
  new_count := get_new_leads_count(current_client_id);
  contacts_count := get_contacts_count(current_client_id);
  
  RETURN QUERY SELECT 
    COALESCE(total_count, 0),
    COALESCE(new_count, 0),
    COALESCE(contacts_count, 0);
END;
$$;

-- Create improved RLS policies for better performance
-- Update contacts table policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;

CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (
    client_id = get_current_client_id()
  );

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (
    client_id = get_current_client_id()
  );

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (
    client_id = get_current_client_id()
  );

-- Create indexes for better UUID query performance
CREATE INDEX IF NOT EXISTS idx_contacts_client_lead_id ON contacts(client_id, lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_email_not_null ON leads(id) WHERE email IS NOT NULL AND email != '';
CREATE INDEX IF NOT EXISTS idx_leads_created_at_email ON leads(created_at DESC) WHERE email IS NOT NULL AND email != '';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_converted_lead_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_new_leads_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contacts_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_lead_status_counts() TO authenticated; 