
-- Add missing instantly_mailbox_id column to campaigns table
ALTER TABLE campaigns ADD COLUMN instantly_mailbox_id TEXT;
