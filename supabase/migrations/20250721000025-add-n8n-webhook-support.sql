-- Add n8n webhook support for lead-to-contact conversion
-- This migration adds webhook functionality to trigger n8n workflows when leads are converted

-- 1. Create webhook configuration table
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL CHECK (webhook_type IN ('n8n', 'zapier', 'custom')),
  webhook_url TEXT NOT NULL,
  webhook_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, webhook_type)
);

-- Enable RLS on webhook_configs
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webhook_configs
CREATE POLICY "Users can view their own webhook configs" ON webhook_configs
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own webhook configs" ON webhook_configs
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own webhook configs" ON webhook_configs
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own webhook configs" ON webhook_configs
  FOR DELETE USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 2. Create webhook execution log table
CREATE TABLE IF NOT EXISTS webhook_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  webhook_url TEXT NOT NULL,
  request_headers JSONB DEFAULT '{}',
  request_body JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on webhook_executions
ALTER TABLE webhook_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webhook_executions
CREATE POLICY "Users can view their own webhook executions" ON webhook_executions
  FOR SELECT USING (
    webhook_config_id IN (
      SELECT wc.id FROM webhook_configs wc
      JOIN clients c ON wc.client_id = c.id
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  );

-- 3. Create function to execute webhooks
CREATE OR REPLACE FUNCTION execute_webhook(
  p_webhook_url TEXT,
  p_headers JSONB DEFAULT '{}',
  p_body JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  http_response JSONB;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  execution_time_ms INTEGER;
BEGIN
  start_time := clock_timestamp();
  
  -- Execute HTTP request using pg_net extension
  SELECT content::jsonb INTO http_response
  FROM net.http_post(
    url := p_webhook_url,
    headers := p_headers,
    body := p_body::text
  );
  
  end_time := clock_timestamp();
  execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  RETURN jsonb_build_object(
    'response', http_response,
    'execution_time_ms', execution_time_ms
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'execution_time_ms', 0
    );
END;
$$;

-- 4. Create function to trigger webhooks for lead conversion
CREATE OR REPLACE FUNCTION trigger_lead_conversion_webhooks(
  p_contact_id UUID,
  p_lead_id UUID,
  p_client_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_config RECORD;
  webhook_result JSONB;
  execution_id UUID;
  lead_data RECORD;
  contact_data RECORD;
BEGIN
  -- Get lead data
  SELECT * INTO lead_data FROM leads WHERE id = p_lead_id;
  
  -- Get contact data
  SELECT * INTO contact_data FROM contacts WHERE id = p_contact_id;
  
  -- Get webhook configs for this client
  FOR webhook_config IN 
    SELECT * FROM webhook_configs 
    WHERE client_id = p_client_id 
      AND webhook_type = 'n8n' 
      AND is_active = true
  LOOP
    -- Prepare webhook payload
    webhook_result := execute_webhook(
      webhook_config.webhook_url,
      webhook_config.headers,
      jsonb_build_object(
        'event_type', 'lead_converted_to_contact',
        'timestamp', NOW(),
        'contact_id', p_contact_id,
        'lead_id', p_lead_id,
        'client_id', p_client_id,
        'lead_data', to_jsonb(lead_data),
        'contact_data', to_jsonb(contact_data),
        'notes', p_notes
      )
    );
    
    -- Log the execution
    INSERT INTO webhook_executions (
      webhook_config_id,
      event_type,
      event_data,
      webhook_url,
      request_headers,
      request_body,
      response_status,
      response_body,
      execution_time_ms,
      success,
      error_message
    ) VALUES (
      webhook_config.id,
      'lead_converted_to_contact',
      jsonb_build_object(
        'contact_id', p_contact_id,
        'lead_id', p_lead_id,
        'client_id', p_client_id,
        'notes', p_notes
      ),
      webhook_config.webhook_url,
      webhook_config.headers,
      jsonb_build_object(
        'event_type', 'lead_converted_to_contact',
        'timestamp', NOW(),
        'contact_id', p_contact_id,
        'lead_id', p_lead_id,
        'client_id', p_client_id,
        'lead_data', to_jsonb(lead_data),
        'contact_data', to_jsonb(contact_data),
        'notes', p_notes
      ),
      CASE 
        WHEN webhook_result ? 'response' THEN (webhook_result->'response'->>'status')::integer
        ELSE NULL
      END,
      CASE 
        WHEN webhook_result ? 'response' THEN webhook_result->'response'->>'content'
        ELSE NULL
      END,
      (webhook_result->>'execution_time_ms')::integer,
      NOT (webhook_result ? 'error'),
      CASE 
        WHEN webhook_result ? 'error' THEN webhook_result->>'error'
        ELSE NULL
      END
    );
  END LOOP;
END;
$$;

-- 5. Update the convert_lead_to_contact function to trigger webhooks
CREATE OR REPLACE FUNCTION convert_lead_to_contact(
  input_lead_id UUID, 
  input_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  lead_data RECORD;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if lead exists and is accessible
  SELECT EXISTS(
    SELECT 1 FROM leads 
    WHERE id = input_lead_id
      AND email IS NOT NULL 
      AND email != ''
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    RAISE EXCEPTION 'Lead not found or invalid (ID: %)', input_lead_id;
  END IF;
  
  -- Get lead data for webhook
  SELECT * INTO lead_data FROM leads WHERE id = input_lead_id;
  
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE lead_id = input_lead_id 
      AND client_id = client_id
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Check and use credits
  SELECT check_and_use_credits('leads', 1, 'Convert lead to contact') INTO credit_check;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits to convert lead';
  END IF;
  
  -- Insert new contact
  INSERT INTO contacts (lead_id, client_id, notes, status)
  VALUES (input_lead_id, client_id, input_notes, 'active')
  RETURNING id INTO contact_id;
  
  -- Log the conversion
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
  VALUES (client_id, 'leads', 1, 'Converted lead to contact', contact_id);
  
  -- Trigger webhooks (asynchronously to avoid blocking the conversion)
  PERFORM trigger_lead_conversion_webhooks(contact_id, input_lead_id, client_id, input_notes);
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update the bulk_convert_leads_to_contacts function to trigger webhooks
CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[], 
  notes TEXT DEFAULT NULL
)
RETURNS UUID[] AS $$
DECLARE
  client_id UUID;
  converted_contact_ids UUID[] := '{}';
  lead_id UUID;
  contact_id UUID;
  credit_check BOOLEAN;
  lead_exists BOOLEAN;
  contact_exists BOOLEAN;
  lead_data RECORD;
  total_credits_needed INTEGER;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Calculate total credits needed
  total_credits_needed := array_length(lead_ids, 1);
  
  -- Check and use credits
  SELECT check_and_use_credits('leads', total_credits_needed, 'Bulk convert leads to contacts') INTO credit_check;
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient credits for bulk conversion';
  END IF;
  
  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    -- Check if lead exists and is accessible
    SELECT EXISTS(
      SELECT 1 FROM leads 
      WHERE id = lead_id
        AND email IS NOT NULL 
        AND email != ''
    ) INTO lead_exists;
    
    IF NOT lead_exists THEN
      RAISE NOTICE 'Lead not found or invalid (ID: %), skipping', lead_id;
      CONTINUE;
    END IF;
    
    -- Get lead data for webhook
    SELECT * INTO lead_data FROM leads WHERE id = lead_id;
    
    -- Check if contact already exists
    SELECT EXISTS(
      SELECT 1 FROM contacts 
      WHERE lead_id = lead_id 
        AND client_id = client_id
    ) INTO contact_exists;
    
    IF contact_exists THEN
      RAISE NOTICE 'Contact already exists for lead (ID: %), skipping', lead_id;
      CONTINUE;
    END IF;
    
    -- Insert new contact
    INSERT INTO contacts (lead_id, client_id, notes, status)
    VALUES (lead_id, client_id, notes, 'active')
    RETURNING id INTO contact_id;
    
    -- Add to converted contacts array
    converted_contact_ids := array_append(converted_contact_ids, contact_id);
    
    -- Trigger webhooks for this conversion
    PERFORM trigger_lead_conversion_webhooks(contact_id, lead_id, client_id, notes);
  END LOOP;
  
  -- Log the bulk conversion
  INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
  VALUES (client_id, 'leads', total_credits_needed, 'Bulk converted leads to contacts', NULL);
  
  RETURN converted_contact_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to manage webhook configurations
CREATE OR REPLACE FUNCTION upsert_webhook_config(
  p_webhook_type TEXT,
  p_webhook_url TEXT,
  p_webhook_name TEXT,
  p_headers JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
  webhook_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Insert or update webhook config
  INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers)
  VALUES (client_id, p_webhook_type, p_webhook_url, p_webhook_name, p_headers)
  ON CONFLICT (client_id, webhook_type) 
  DO UPDATE SET
    webhook_url = EXCLUDED.webhook_url,
    webhook_name = EXCLUDED.webhook_name,
    headers = EXCLUDED.headers,
    updated_at = NOW()
  RETURNING id INTO webhook_id;
  
  RETURN webhook_id;
END;
$$;

-- 8. Create function to get webhook configurations
CREATE OR REPLACE FUNCTION get_webhook_configs()
RETURNS TABLE(
  id UUID,
  webhook_type TEXT,
  webhook_url TEXT,
  webhook_name TEXT,
  is_active BOOLEAN,
  headers JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    wc.id,
    wc.webhook_type,
    wc.webhook_url,
    wc.webhook_name,
    wc.is_active,
    wc.headers,
    wc.created_at,
    wc.updated_at
  FROM webhook_configs wc
  WHERE wc.client_id = client_id
  ORDER BY wc.created_at DESC;
END;
$$;

-- 9. Create function to get webhook execution logs
CREATE OR REPLACE FUNCTION get_webhook_executions(
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
DECLARE
  client_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    we.id,
    we.event_type,
    we.event_data,
    we.webhook_url,
    we.response_status,
    we.execution_time_ms,
    we.success,
    we.error_message,
    we.created_at
  FROM webhook_executions we
  JOIN webhook_configs wc ON we.webhook_config_id = wc.id
  WHERE wc.client_id = client_id
  ORDER BY we.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION execute_webhook(TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_lead_conversion_webhooks(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_webhook_config(TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_configs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_executions(INTEGER, INTEGER) TO authenticated;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_configs_client_type ON webhook_configs(client_id, webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_config_created ON webhook_executions(webhook_config_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_success_created ON webhook_executions(success, created_at DESC);

-- 12. Add updated_at trigger for webhook_configs
CREATE OR REPLACE FUNCTION update_webhook_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_webhook_configs_updated_at
  BEFORE UPDATE ON webhook_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_configs_updated_at(); 