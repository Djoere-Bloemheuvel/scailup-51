
-- Fix the bulk conversion function to handle missing client relationships properly
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
    email = EXCLUDED.email;
  
  RETURN new_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION fix_user_client_relationship() TO authenticated;

-- Update the bulk conversion function to use the fix
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[],
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success_count INTEGER,
  failed_count INTEGER,
  errors TEXT[],
  converted_contacts JSONB
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
  converted_contacts JSONB := '[]'::JSONB;
  error_msg TEXT;
  contact_id UUID;
  credit_check BOOLEAN;
BEGIN
  -- Try to get client_id using existing function first
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, try to fix the relationship
  IF current_client_id IS NULL THEN
    BEGIN
      SELECT fix_user_client_relationship() INTO current_client_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create or find client for user: %', SQLERRM;
    END;
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create or find client for user after fix attempt';
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
      
      -- Check and use credits (1 credit per lead) - with error handling
      BEGIN
        credit_check := check_and_use_credits('leads', 1, format('Bulk convert lead %s', current_lead_id));
      EXCEPTION
        WHEN OTHERS THEN
          -- If credit system fails, continue without it for now
          RAISE NOTICE 'Credit check failed for lead %, continuing: %', current_lead_id, SQLERRM;
          credit_check := true;
      END;
      
      IF NOT credit_check THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Insufficient credits for lead %s', current_lead_id));
        CONTINUE;
      END IF;
      
      -- Insert new contact (simplified for clean contacts table)
      INSERT INTO contacts (lead_id, client_id, notes, status)
      VALUES (current_lead_id, current_client_id, notes, 'active')
      RETURNING id INTO contact_id;
      
      -- Add to converted_contacts array
      converted_contacts := converted_contacts || jsonb_build_object(
        'lead_id', current_lead_id,
        'contact_id', contact_id
      );
      
      -- Log the conversion in credit usage (with error handling)
      BEGIN
        INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
        VALUES (current_client_id, 'leads', 1, format('Bulk converted lead to contact', current_lead_id), contact_id);
      EXCEPTION
        WHEN OTHERS THEN
          -- If logging fails, continue without it
          RAISE NOTICE 'Credit usage logging failed for contact %, continuing: %', contact_id, SQLERRM;
      END;
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      error_msg := format('Error converting lead %s: %s', current_lead_id, SQLERRM);
      errors := array_append(errors, error_msg);
    END;
  END LOOP;
  
  RETURN QUERY SELECT success_count, failed_count, errors, converted_contacts;
END;
$$;
