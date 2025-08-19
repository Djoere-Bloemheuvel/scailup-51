-- Fix client-user relationship and make convert_lead_to_contact function robust
-- This migration addresses the "Client not found for user" error

-- 1. First, let's understand the current relationship structure
-- Check if we have the correct client-user relationships

-- 2. Create a robust function to get client_id for current user
CREATE OR REPLACE FUNCTION get_current_client_id()
RETURNS UUID AS $$
DECLARE
  client_id UUID;
BEGIN
  -- Try method 1: Direct client lookup by user_id
  SELECT c.id INTO client_id
  FROM clients c
  WHERE c.user_id = auth.uid();
  
  -- If found, return it
  IF client_id IS NOT NULL THEN
    RETURN client_id;
  END IF;
  
  -- Try method 2: Lookup via users table
  SELECT u.client_id INTO client_id
  FROM users u
  WHERE u.id = auth.uid();
  
  -- If found, return it
  IF client_id IS NOT NULL THEN
    RETURN client_id;
  END IF;
  
  -- Try method 3: Lookup by email (for admin users)
  SELECT c.id INTO client_id
  FROM clients c
  WHERE c.email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
  AND c.admin = true
  LIMIT 1;
  
  -- If found, return it
  IF client_id IS NOT NULL THEN
    RETURN client_id;
  END IF;
  
  -- If no client found, return NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to ensure client exists for current user
CREATE OR REPLACE FUNCTION ensure_client_exists()
RETURNS UUID AS $$
DECLARE
  client_id UUID;
  user_email TEXT;
  user_id UUID;
BEGIN
  -- Get current user info
  SELECT id, email INTO user_id, user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Try to get existing client
  SELECT get_current_client_id() INTO client_id;
  
  -- If client exists, return it
  IF client_id IS NOT NULL THEN
    RETURN client_id;
  END IF;
  
  -- Create a new client if none exists
  INSERT INTO clients (
    user_id,
    email,
    first_name,
    last_name,
    company_name,
    is_active,
    admin,
    plan,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    COALESCE(split_part(user_email, '@', 1), 'User'),
    'User',
    COALESCE(split_part(user_email, '@', 2), 'Company'),
    true,
    false,
    'free',
    NOW(),
    NOW()
  )
  RETURNING id INTO client_id;
  
  -- Also create user record if it doesn't exist
  INSERT INTO users (id, email, client_id, created_at)
  VALUES (user_id, user_email, client_id, NOW())
  ON CONFLICT (id) DO UPDATE SET
    client_id = EXCLUDED.client_id,
    email = EXCLUDED.email;
  
  RETURN client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Replace the convert_lead_to_contact function with robust error handling
CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
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
  SELECT ensure_client_exists() INTO client_id;
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create or find client for user: %', user_email;
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM leads 
    WHERE id = convert_lead_to_contact.lead_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid (ID: %)', convert_lead_to_contact.lead_id;
  END IF;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = convert_lead_to_contact.lead_id 
      AND client_id = client_id
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
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status, contact_date)
  VALUES (convert_lead_to_contact.lead_id, client_id, convert_lead_to_contact.notes, 'active', NOW())
  RETURNING id INTO contact_id;
  
  -- Log the conversion (if credit system exists)
  BEGIN
    INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
    VALUES (client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- If credit_usage_logs doesn't exist, skip logging
      NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update the get_contacts_with_lead_data function to use the new client lookup
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

-- 6. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_client_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contacts_with_lead_data() TO authenticated;

-- 7. Create a function to check if a lead is already a contact for current user
CREATE OR REPLACE FUNCTION is_lead_contact(lead_uuid UUID)
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
  
  -- Check if contact exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = lead_uuid 
      AND client_id = current_client_id
  ) INTO contact_exists;
  
  RETURN contact_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_lead_contact(UUID) TO authenticated;

-- 8. Add some debugging functions
CREATE OR REPLACE FUNCTION debug_user_client_info()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  client_id UUID,
  client_email TEXT,
  client_company TEXT,
  lookup_method TEXT
) AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  direct_client_id UUID;
  user_client_id UUID;
  email_client_id UUID;
BEGIN
  -- Get current user info
  SELECT id, email INTO current_user_id, current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Try different lookup methods
  SELECT c.id INTO direct_client_id
  FROM clients c
  WHERE c.user_id = current_user_id;
  
  SELECT u.client_id INTO user_client_id
  FROM users u
  WHERE u.id = current_user_id;
  
  SELECT c.id INTO email_client_id
  FROM clients c
  WHERE c.email = current_user_email
  AND c.admin = true
  LIMIT 1;
  
  -- Return results
  RETURN QUERY
  SELECT 
    current_user_id,
    current_user_email,
    COALESCE(direct_client_id, user_client_id, email_client_id),
    c.email,
    c.company_name,
    CASE 
      WHEN direct_client_id IS NOT NULL THEN 'direct_user_id'
      WHEN user_client_id IS NOT NULL THEN 'via_users_table'
      WHEN email_client_id IS NOT NULL THEN 'via_email_admin'
      ELSE 'not_found'
    END
  FROM clients c
  WHERE c.id = COALESCE(direct_client_id, user_client_id, email_client_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION debug_user_client_info() TO authenticated;
