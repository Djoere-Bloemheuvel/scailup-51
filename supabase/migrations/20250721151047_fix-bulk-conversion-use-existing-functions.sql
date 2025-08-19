-- Fix bulk conversion to use existing robust client lookup functions
-- Update the bulk_convert_leads_to_contacts function to use get_current_client_id()

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
  lead_id UUID;
  success_count INTEGER := 0;
  failed_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
  error_msg TEXT;
  contact_id UUID;
  credit_check BOOLEAN;
BEGIN
  -- Use the existing robust client lookup function
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    -- Try to ensure client exists
    SELECT ensure_client_exists() INTO current_client_id;
    
    IF current_client_id IS NULL THEN
      RAISE EXCEPTION 'Client not found for user and could not create one';
    END IF;
  END IF;
  
  -- Log successful client lookup
  RAISE NOTICE 'Using client_id: % for bulk conversion', current_client_id;
  
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