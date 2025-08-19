
-- Add instantly_campaign_id column to campaigns table if it doesn't exist
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS instantly_campaign_id TEXT;
