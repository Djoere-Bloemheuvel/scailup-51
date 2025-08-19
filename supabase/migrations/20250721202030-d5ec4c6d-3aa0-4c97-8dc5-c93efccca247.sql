
-- Update webhook configuration with the new URL
UPDATE webhook_configs 
SET webhook_url = 'https://djoere.app.n8n.cloud/webhook-test/000b7e1d-5e42-44df-b2ec-5d17038e6c6c',
    updated_at = NOW()
WHERE webhook_type = 'n8n' 
AND is_active = true;

-- Insert webhook config if it doesn't exist for any client
INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers, is_active)
SELECT 
  c.id as client_id,
  'n8n' as webhook_type,
  'https://djoere.app.n8n.cloud/webhook-test/000b7e1d-5e42-44df-b2ec-5d17038e6c6c' as webhook_url,
  'n8n Lead Conversion Webhook' as webhook_name,
  '{"Content-Type": "application/json"}' as headers,
  true as is_active
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM webhook_configs wc 
  WHERE wc.client_id = c.id 
  AND wc.webhook_type = 'n8n'
)
ON CONFLICT (client_id, webhook_type) DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  webhook_name = EXCLUDED.webhook_name,
  is_active = true,
  updated_at = NOW();

-- Add missing database functions for webhook management
CREATE OR REPLACE FUNCTION public.get_webhook_configs()
RETURNS TABLE(
  id UUID,
  client_id UUID,
  webhook_type TEXT,
  webhook_url TEXT,
  webhook_name TEXT,
  headers JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    wc.id,
    wc.client_id,
    wc.webhook_type,
    wc.webhook_url,
    wc.webhook_name,
    wc.headers,
    wc.is_active,
    wc.created_at,
    wc.updated_at
  FROM webhook_configs wc
  WHERE wc.client_id = current_client_id
  ORDER BY wc.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_webhook_config(
  p_webhook_type TEXT,
  p_webhook_url TEXT,
  p_webhook_name TEXT,
  p_headers JSONB DEFAULT '{"Content-Type": "application/json"}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  webhook_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Upsert webhook config
  INSERT INTO webhook_configs (
    client_id, 
    webhook_type, 
    webhook_url, 
    webhook_name, 
    headers, 
    is_active
  )
  VALUES (
    current_client_id,
    p_webhook_type,
    p_webhook_url,
    p_webhook_name,
    p_headers,
    true
  )
  ON CONFLICT (client_id, webhook_type) DO UPDATE SET
    webhook_url = EXCLUDED.webhook_url,
    webhook_name = EXCLUDED.webhook_name,
    headers = EXCLUDED.headers,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING id INTO webhook_id;
  
  RETURN webhook_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_webhook_executions(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  event_type TEXT,
  event_data JSONB,
  webhook_url TEXT,
  response_status INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, return empty results since we don't have webhook_executions table yet
  -- This function exists to prevent TypeScript errors
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_contact_activity(
  p_contact_id UUID,
  p_activity_type TEXT,
  p_activity_title TEXT,
  p_activity_description TEXT DEFAULT NULL,
  p_activity_outcome TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
  current_client_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Insert activity
  INSERT INTO contact_activities (
    contact_id,
    client_id,
    activity_type,
    activity_title,
    activity_description,
    activity_outcome,
    created_by_user_id,
    metadata
  ) VALUES (
    p_contact_id,
    current_client_id,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_activity_outcome,
    auth.uid(),
    p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_contact_activities_with_lead_data(
  p_contact_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  contact_id UUID,
  activity_type VARCHAR,
  activity_title VARCHAR,
  activity_description TEXT,
  activity_outcome VARCHAR,
  activity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  IF current_client_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    ca.id,
    ca.contact_id,
    ca.activity_type,
    ca.activity_title,
    ca.activity_description,
    ca.activity_outcome,
    ca.activity_date,
    ca.created_at
  FROM contact_activities ca
  WHERE ca.client_id = current_client_id
    AND (p_contact_id IS NULL OR ca.contact_id = p_contact_id)
  ORDER BY ca.activity_date DESC;
END;
$$;
