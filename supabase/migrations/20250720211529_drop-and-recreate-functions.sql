-- Drop and recreate functions to fix ambiguous column references
-- This resolves the "column reference 'lead_id' is ambiguous" error

-- 1. Drop all existing problematic functions
DROP FUNCTION IF EXISTS convert_lead_to_contact(UUID, TEXT);
DROP FUNCTION IF EXISTS get_contacts_with_lead_data();
DROP FUNCTION IF EXISTS is_lead_contact(UUID);

-- 2. Recreate convert_lead_to_contact function with fixed column references
CREATE OR REPLACE FUNCTION convert_lead_to_contact(input_lead_id UUID, input_notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  current_client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get current user email for debugging
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Ensure client exists for current user
  SELECT ensure_client_exists() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create or find client for user: %', user_email;
  END IF;
  
  -- Check if lead exists and is accessible (fully qualified column names)
  SELECT EXISTS(
    SELECT 1 FROM leads AS l
    WHERE l.id = input_lead_id
      AND l.email IS NOT NULL 
      AND l.email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid (ID: %)', input_lead_id;
  END IF;
  
  -- Check if contact already exists (fully qualified column names)
  SELECT EXISTS(
    SELECT 1 FROM contacts AS c
    WHERE c.lead_id = input_lead_id 
      AND c.client_id = current_client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead and client';
  END IF;
  
  -- Check and use credits (if credit system exists)
  BEGIN
    SELECT check_and_use_credits('leads', 1, 'Convert lead to contact') INTO credit_check;
  EXCEPTION
    WHEN OTHERS THEN
      -- If credit system doesn't exist, continue without it
      credit_check := true;
  END;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits to convert lead';
  END IF;
  
  -- Insert new contact (fully qualified column names)
  INSERT INTO contacts (lead_id, client_id, notes, status, contact_date)
  VALUES (input_lead_id, current_client_id, input_notes, 'active', NOW())
  RETURNING id INTO contact_id;
  
  -- Log the conversion (if credit system exists)
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (current_client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- If credit_usage_logs doesn't exist, skip logging
      NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate get_contacts_with_lead_data function
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
DECLARE
  current_client_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, return empty result
  IF current_client_id IS NULL THEN
    RETURN;
  END IF;
  
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
  WHERE c.client_id = current_client_id
  ORDER BY c.contact_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate is_lead_contact function  
CREATE OR REPLACE FUNCTION is_lead_contact(input_lead_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_client_id UUID;
  contact_exists BOOLEAN;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, return false
  IF current_client_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if contact exists (fully qualified column names)
  SELECT EXISTS(
    SELECT 1 FROM contacts c
    WHERE c.lead_id = input_lead_uuid 
      AND c.client_id = current_client_id
  ) INTO contact_exists;
  
  RETURN contact_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant all necessary permissions
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contacts_with_lead_data() TO authenticated;
GRANT EXECUTE ON FUNCTION is_lead_contact(UUID) TO authenticated;
