
-- Create secure function to add contacts to campaigns
CREATE OR REPLACE FUNCTION add_contact_to_campaign(
  p_contact_id uuid,
  p_campaign_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id uuid;
  v_existing_status text;
  v_campaign_client_id uuid;
  v_contact_client_id uuid;
BEGIN
  -- Get current user's client ID
  v_client_id := get_current_user_client_id();
  
  IF v_client_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Authentication required'
    );
  END IF;

  -- Verify campaign belongs to user's client
  SELECT client_id INTO v_campaign_client_id
  FROM campaigns 
  WHERE id = p_campaign_id;
  
  IF v_campaign_client_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CAMPAIGN_NOT_FOUND',
      'message', 'Campaign not found'
    );
  END IF;
  
  IF v_campaign_client_id != v_client_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Access denied'
    );
  END IF;

  -- Verify contact belongs to user's client
  SELECT client_id INTO v_contact_client_id
  FROM contacts 
  WHERE id = p_contact_id;
  
  IF v_contact_client_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONTACT_NOT_FOUND',
      'message', 'Contact not found'
    );
  END IF;
  
  IF v_contact_client_id != v_client_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Access denied'
    );
  END IF;

  -- Check if contact is already in this campaign
  SELECT status INTO v_existing_status
  FROM campaign_contacts
  WHERE campaign_id = p_campaign_id AND contact_id = p_contact_id;
  
  IF FOUND THEN
    -- If contact already completed the campaign, don't allow re-adding
    IF v_existing_status = 'Afgerond' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'CAMPAIGN_COMPLETED',
        'message', 'Contact heeft deze campagne al doorlopen.'
      );
    END IF;
    
    -- If contact is already in campaign with different status, return info
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ALREADY_IN_CAMPAIGN',
      'message', 'Contact is already in this campaign',
      'current_status', v_existing_status
    );
  END IF;

  -- Add contact to campaign with 'scheduled' status
  INSERT INTO campaign_contacts (campaign_id, contact_id, status)
  VALUES (p_campaign_id, p_contact_id, 'scheduled');

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Contact successfully added to campaign'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'SYSTEM_ERROR',
    'message', 'An error occurred while adding contact to campaign'
  );
END;
$$;
