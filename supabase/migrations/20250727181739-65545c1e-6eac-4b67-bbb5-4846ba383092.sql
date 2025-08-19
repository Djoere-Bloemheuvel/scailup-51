
-- Drop and recreate the available_leads view with client-specific filtering
DROP VIEW IF EXISTS available_leads;

CREATE VIEW available_leads AS
SELECT l.*
FROM leads l
WHERE NOT EXISTS (
    SELECT 1 
    FROM contacts c 
    WHERE c.lead_id = l.id 
    AND c.client_id = get_current_user_client_id()
);

-- Add a comment to document the view's purpose
COMMENT ON VIEW available_leads IS 'Shows leads that have not been converted to contacts by the current user''s client. Each client sees their own filtered view of available leads.';
