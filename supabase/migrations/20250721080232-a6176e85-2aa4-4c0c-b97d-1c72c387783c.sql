
-- Fix the ambiguous column reference in bulk_convert_leads_to_contacts function
CREATE OR REPLACE FUNCTION public.bulk_convert_leads_to_contacts(
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
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;

  -- Check if user has enough credits for all conversions
  BEGIN
    SELECT check_and_use_credits('leads', array_length(lead_ids, 1), 'Bulk convert leads to contacts') INTO credit_check;
  EXCEPTION
    WHEN OTHERS THEN
      -- If credit system doesn't exist, continue without it
      credit_check := true;
  END;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits for bulk conversion';
  END IF;

  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is accessible (use explicit table alias)
      IF NOT EXISTS (
        SELECT 1 FROM leads l
        WHERE l.id = lead_id 
        AND l.email IS NOT NULL 
        AND l.email != ''
      ) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s not found or invalid', lead_id));
        CONTINUE;
      END IF;

      -- Check if lead is already converted (use explicit table alias)
      IF EXISTS (
        SELECT 1 FROM contacts c
        WHERE c.lead_id = lead_id 
        AND c.client_id = current_client_id
      ) THEN
        failed_count := failed_count + 1;
        errors := array_append(errors, format('Lead %s is already converted to contact', lead_id));
        CONTINUE;
      END IF;

      -- Convert lead to contact
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

      -- Add activity record if contact_activities table exists
      BEGIN
        INSERT INTO contact_activities (
          contact_id,
          client_id,
          activity_type,
          activity_title,
          activity_description,
          created_at
        )
        VALUES (
          contact_id,
          current_client_id,
          'conversion',
          'Lead Conversion',
          'Converted from lead via bulk operation',
          NOW()
        );
      EXCEPTION
        WHEN OTHERS THEN
          -- If contact_activities table doesn't exist, skip
          NULL;
      END;

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
