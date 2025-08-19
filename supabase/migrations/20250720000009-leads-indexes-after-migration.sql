-- Migration: Add indexes after leads optimization migration
-- This migration adds indexes for the new columns after they exist

-- Add indexes for new columns (only run after main migration)
CREATE INDEX IF NOT EXISTS idx_leads_duplicate ON leads(is_duplicate) WHERE is_duplicate = TRUE;
CREATE INDEX IF NOT EXISTS idx_leads_enrichment_status ON leads(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON leads(contact_status);

-- Update RLS policy to include duplicate filtering after column exists
DROP POLICY IF EXISTS "Users can view leads from their client" ON leads;

CREATE POLICY "Users can view leads from their client" ON leads
  FOR SELECT USING (
    user_id IN (
      SELECT u.id FROM users u 
      JOIN clients c ON u.client_id = c.id 
      WHERE c.id = (
        SELECT client_id FROM users WHERE id = auth.uid()
      )
    )
    AND email IS NOT NULL 
    AND email != ''
    AND is_duplicate = FALSE
  ); 