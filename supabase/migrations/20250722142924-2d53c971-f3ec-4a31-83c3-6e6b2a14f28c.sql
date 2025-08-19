-- Set up default n8n webhook configuration
-- This ensures all clients have the default n8n webhook configured for lead-to-contact conversion

-- Insert default n8n webhook configuration for all existing clients
INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers, is_active)
SELECT 
  c.id,
  'n8n',
  'https://djoere.app.n8n.cloud/webhook-test/53666597-5d52-417e-924c-535a4d2256e4',
  'Default N8N Webhook',
  '{"Content-Type": "application/json"}'::jsonb,
  true
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
  updated_at = now();

-- Create function to automatically add default webhook for new clients
CREATE OR REPLACE FUNCTION setup_default_webhook_for_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  -- Add default n8n webhook configuration for the new client
  INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers, is_active)
  VALUES (
    NEW.id,
    'n8n',
    'https://djoere.app.n8n.cloud/webhook-test/53666597-5d52-417e-924c-535a4d2256e4',
    'Default N8N Webhook',
    '{"Content-Type": "application/json"}'::jsonb,
    true
  )
  ON CONFLICT (client_id, webhook_type) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically setup webhook for new clients
DROP TRIGGER IF EXISTS setup_webhook_trigger ON clients;
CREATE TRIGGER setup_webhook_trigger
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION setup_default_webhook_for_client();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION setup_default_webhook_for_client() TO authenticated;