-- Fix bulk conversion function for clean contacts table
-- Update the bulk_convert_leads_to_contacts function to work with the simplified contacts table

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
  -- Get current user's client_id
  SELECT c.id INTO current_client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;

  -- Check if user has enough credits for all conversions
  SELECT check_and_use_credits('leads', array_length(lead_ids, 1), 'Bulk convert leads to contacts') INTO credit_check;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits for bulk conversion';
  END IF;

  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is accessible
      IF NOT EXISTS (
        SELECT 1 FROM leads 
        WHERE id = lead_id 
        AND email IS NOT NULL 
        AND email != ''
      ) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s not found or not accessible', lead_id));
        CONTINUE;
      END IF;

      -- Check if lead is already converted
      IF EXISTS (
        SELECT 1 FROM contacts 
        WHERE lead_id = lead_id 
        AND client_id = current_client_id
      ) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s is already converted to contact', lead_id));
        CONTINUE;
      END IF;

      -- Convert lead to contact (using simplified contacts table structure)
      INSERT INTO contacts (
        lead_id,
        client_id,
        notes,
        status,
        contact_date,
        created_at,
        updated_at
      )
      VALUES (
        lead_id,
        current_client_id,
        COALESCE(notes, 'Bulk converted from lead'),
        'active',
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id INTO contact_id;

      -- Log the conversion in credit usage
      INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
      VALUES (current_client_id, 'leads', 1, 'Bulk converted lead to contact', contact_id);

      success_count := success_count + 1;

    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      error_msg := format('Lead %s: %s', lead_id, SQLERRM);
      errors := array_append(errors, error_msg);
    END;
  END LOOP;

  -- Return results
  RETURN QUERY SELECT success_count, failed_count, errors;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) IS 
'Bulk convert multiple leads to contacts with clean table structure and credit system integration'; 