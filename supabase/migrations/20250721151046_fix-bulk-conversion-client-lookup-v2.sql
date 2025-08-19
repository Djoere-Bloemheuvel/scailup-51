-- Fix bulk conversion client lookup v2 - use same method as single conversion
-- Update the bulk_convert_leads_to_contacts function to use the same client lookup as convert_lead_to_contact

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
  current_user_email TEXT;
  lead_id UUID;
  success_count INTEGER := 0;
  failed_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
  error_msg TEXT;
  contact_id UUID;
  credit_check BOOLEAN;
BEGIN
  -- Get current user's email first (same as single conversion)
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF current_user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found for auth.uid(): %', auth.uid();
  END IF;
  
  -- Get client_id using the SAME method as convert_lead_to_contact
  SELECT c.id INTO current_client_id
  FROM clients c
  WHERE c.email = current_user_email;
  
  IF current_client_id IS NULL THEN
    -- Try alternative method: get client from users table
    SELECT u.client_id INTO current_client_id
    FROM users u
    WHERE u.id = auth.uid();
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Client not found for user email: % (auth.uid: %)', current_user_email, auth.uid();
    END IF;
  END IF;
  
  -- Log successful client lookup
  RAISE NOTICE 'Found client_id: % for user: %', current_client_id, current_user_email;
  
  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is not already converted
      IF NOT EXISTS (SELECT 1 FROM leads WHERE id = lead_id) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s not found', lead_id));
        CONTINUE;
      END IF;
      
      IF EXISTS (SELECT 1 FROM contacts WHERE lead_id = lead_id AND client_id = current_client_id) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s already converted to contact', lead_id));
        CONTINUE;
      END IF;
      
      -- Check and use credits (1 credit per lead)
      credit_check := check_and_use_credits('leads', 1, format('Bulk convert lead %s', lead_id));
      
      IF NOT credit_check THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Insufficient credits for lead %s', lead_id));
        CONTINUE;
      END IF;
      
      -- Insert new contact (simplified for clean contacts table)
      INSERT INTO contacts (lead_id, client_id, notes, status)
      VALUES (lead_id, current_client_id, notes, 'active')
      RETURNING id INTO contact_id;
      
      -- Log the conversion in credit usage
      INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
      VALUES (current_client_id, 'leads', 1, format('Bulk converted lead to contact', lead_id), contact_id);
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      error_msg := format('Error converting lead %s: %s', lead_id, SQLERRM);
      errors := array_append(errors, error_msg);
    END;
  END LOOP;
  
  RETURN QUERY SELECT success_count, failed_count, errors;
END;
$$; 