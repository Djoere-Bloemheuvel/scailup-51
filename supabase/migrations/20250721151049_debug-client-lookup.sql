-- Debug and fix client lookup issue
-- Add debugging functions and ensure proper user-client relationship

-- 1. First, let's create a comprehensive debugging function
CREATE OR REPLACE FUNCTION debug_current_user_client_status()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  auth_user_exists BOOLEAN,
  users_table_exists BOOLEAN,
  users_client_id UUID,
  clients_user_id_exists BOOLEAN,
  clients_email_exists BOOLEAN,
  final_client_id UUID,
  lookup_method TEXT,
  debug_info JSONB
) AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  auth_user_exists BOOLEAN;
  users_table_exists BOOLEAN;
  users_client_id UUID;
  clients_user_id_exists BOOLEAN;
  clients_email_exists BOOLEAN;
  final_client_id UUID;
  lookup_method TEXT;
  debug_info JSONB;
BEGIN
  -- Get current user info
  SELECT id, email INTO current_user_id, current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  auth_user_exists := current_user_id IS NOT NULL;
  
  -- Check if user exists in users table
  SELECT EXISTS(SELECT 1 FROM users WHERE id = current_user_id) INTO users_table_exists;
  
  -- Get client_id from users table
  SELECT client_id INTO users_client_id
  FROM users
  WHERE id = current_user_id;
  
  -- Check if client exists with user_id
  SELECT EXISTS(SELECT 1 FROM clients WHERE user_id = current_user_id) INTO clients_user_id_exists;
  
  -- Check if client exists with email
  SELECT EXISTS(SELECT 1 FROM clients WHERE email = current_user_email) INTO clients_email_exists;
  
  -- Try to get final client_id using existing function
  SELECT get_current_client_id() INTO final_client_id;
  
  -- Determine lookup method
  IF final_client_id IS NOT NULL THEN
    IF EXISTS(SELECT 1 FROM clients WHERE user_id = current_user_id AND id = final_client_id) THEN
      lookup_method := 'clients.user_id';
    ELSIF EXISTS(SELECT 1 FROM users WHERE id = current_user_id AND client_id = final_client_id) THEN
      lookup_method := 'users.client_id';
    ELSIF EXISTS(SELECT 1 FROM clients WHERE email = current_user_email AND id = final_client_id) THEN
      lookup_method := 'clients.email';
    ELSE
      lookup_method := 'unknown';
    END IF;
  ELSE
    lookup_method := 'not_found';
  END IF;
  
  -- Build debug info
  debug_info := jsonb_build_object(
    'auth_uid', auth.uid(),
    'current_user_id', current_user_id,
    'current_user_email', current_user_email,
    'users_table_count', (SELECT COUNT(*) FROM users),
    'clients_table_count', (SELECT COUNT(*) FROM clients),
    'clients_with_user_id', (SELECT COUNT(*) FROM clients WHERE user_id IS NOT NULL),
    'clients_with_email', (SELECT COUNT(*) FROM clients WHERE email IS NOT NULL)
  );
  
  RETURN QUERY
  SELECT 
    current_user_id,
    current_user_email,
    auth_user_exists,
    users_table_exists,
    users_client_id,
    clients_user_id_exists,
    clients_email_exists,
    final_client_id,
    lookup_method,
    debug_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to fix user-client relationship
CREATE OR REPLACE FUNCTION fix_user_client_relationship()
RETURNS UUID AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  existing_client_id UUID;
  new_client_id UUID;
BEGIN
  -- Get current user info
  SELECT id, email INTO current_user_id, current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- First, try to find existing client by email
  SELECT id INTO existing_client_id
  FROM clients
  WHERE email = current_user_email
  LIMIT 1;
  
  -- If no client found by email, create one
  IF existing_client_id IS NULL THEN
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
      current_user_id,
      current_user_email,
      COALESCE(split_part(current_user_email, '@', 1), 'User'),
      'User',
      COALESCE(split_part(current_user_email, '@', 2), 'Company'),
      true,
      false,
      'free',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_client_id;
  ELSE
    new_client_id := existing_client_id;
    
    -- Update existing client with user_id if not set
    UPDATE clients 
    SET user_id = current_user_id,
        updated_at = NOW()
    WHERE id = existing_client_id 
    AND user_id IS NULL;
  END IF;
  
  -- Ensure user record exists in users table
  INSERT INTO users (id, email, client_id, created_at)
  VALUES (current_user_id, current_user_email, new_client_id, NOW())
  ON CONFLICT (id) DO UPDATE SET
    client_id = EXCLUDED.client_id,
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN new_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the bulk conversion function to use the fix function
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[],
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success_count INTEGER,
  failed_count INTEGER,
  errors TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  current_lead_id UUID;
  success_count INTEGER := 0;
  failed_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
  error_msg TEXT;
  contact_id UUID;
  credit_check BOOLEAN;
BEGIN
  -- Try to get client_id using existing function
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, try to fix the relationship
  IF current_client_id IS NULL THEN
    SELECT fix_user_client_relationship() INTO current_client_id;
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create or find client for user';
    END IF;
  END IF;
  
  -- Log successful client lookup
  RAISE NOTICE 'Using client_id: % for bulk conversion', current_client_id;
  
  -- Process each lead
  FOREACH current_lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is not already converted
      IF NOT EXISTS (SELECT 1 FROM leads WHERE id = current_lead_id) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s not found', current_lead_id));
        CONTINUE;
      END IF;
      
      IF EXISTS (SELECT 1 FROM contacts WHERE lead_id = current_lead_id AND client_id = current_client_id) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s already converted to contact', current_lead_id));
        CONTINUE;
      END IF;
      
      -- Check and use credits (1 credit per lead)
      credit_check := check_and_use_credits('leads', 1, format('Bulk convert lead %s', current_lead_id));
      
      IF NOT credit_check THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Insufficient credits for lead %s', current_lead_id));
        CONTINUE;
      END IF;
      
      -- Insert new contact (simplified for clean contacts table)
      INSERT INTO contacts (lead_id, client_id, notes, status)
      VALUES (current_lead_id, current_client_id, notes, 'active')
      RETURNING id INTO contact_id;
      
      -- Log the conversion in credit usage
      INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
      VALUES (current_client_id, 'leads', 1, format('Bulk converted lead to contact', current_lead_id), contact_id);
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      error_msg := format('Error converting lead %s: %s', current_lead_id, SQLERRM);
      errors := array_append(errors, error_msg);
    END;
  END LOOP;
  
  RETURN QUERY SELECT success_count, failed_count, errors;
END;
$$;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION debug_current_user_client_status() TO authenticated;
GRANT EXECUTE ON FUNCTION fix_user_client_relationship() TO authenticated; 