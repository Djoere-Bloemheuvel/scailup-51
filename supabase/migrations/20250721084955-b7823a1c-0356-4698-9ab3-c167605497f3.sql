
-- Create the get_lead_status_counts function that returns lead status counts for the current client
CREATE OR REPLACE FUNCTION public.get_lead_status_counts()
RETURNS TABLE(total bigint, new bigint, contacts bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  total_count BIGINT;
  new_count BIGINT;
  contacts_count BIGINT;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, return zeros
  IF current_client_id IS NULL THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Count total leads with valid emails
  SELECT COUNT(*) INTO total_count
  FROM leads l
  WHERE l.email IS NOT NULL 
    AND l.email != '';
  
  -- Count new leads (not converted by current client)
  SELECT COUNT(*) INTO new_count
  FROM leads l
  WHERE l.email IS NOT NULL 
    AND l.email != ''
    AND NOT EXISTS (
      SELECT 1 FROM contacts c 
      WHERE c.lead_id = l.id 
        AND c.client_id = current_client_id
    );
  
  -- Count contacts (converted by current client)  
  SELECT COUNT(*) INTO contacts_count
  FROM leads l
  WHERE l.email IS NOT NULL 
    AND l.email != ''
    AND EXISTS (
      SELECT 1 FROM contacts c 
      WHERE c.lead_id = l.id 
        AND c.client_id = current_client_id
    );
  
  -- Return the counts
  RETURN QUERY SELECT total_count, new_count, contacts_count;
END;
$$;
