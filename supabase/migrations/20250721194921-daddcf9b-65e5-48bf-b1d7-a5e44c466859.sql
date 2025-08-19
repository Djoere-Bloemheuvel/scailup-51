
-- Update webhook configuration with the correct URL for the client
UPDATE webhook_configs 
SET webhook_url = 'https://djoere.app.n8n.cloud/webhook-test/53666597-5d52-417e-924c-535a4d2256e4'
WHERE webhook_type = 'n8n' 
AND is_active = true;

-- Insert webhook config if it doesn't exist for any client
INSERT INTO webhook_configs (client_id, webhook_type, webhook_url, webhook_name, headers, is_active)
SELECT 
  c.id as client_id,
  'n8n' as webhook_type,
  'https://djoere.app.n8n.cloud/webhook-test/53666597-5d52-417e-924c-535a4d2256e4' as webhook_url,
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
