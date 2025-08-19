
-- Create the contacts_with_lead_data view to provide 1:1 UI consistency with leads table
CREATE OR REPLACE VIEW contacts_with_lead_data AS
SELECT 
  c.id,
  c.client_id,
  c.created_at,
  c.updated_at,
  -- Personal information
  c.first_name,
  c.last_name,
  c.full_name,
  c.email,
  c.mobile_phone,
  c.linkedin_url,
  -- Job information
  c.title,
  c.seniority,
  c.function_group,
  -- Company information
  c.company_name,
  c.industry,
  c.company_linkedin,
  c.company_website,
  c.company_phone,
  c.company_summary,
  c.company_keywords,
  c.organization_technologies,
  -- Location information
  c.country,
  c.state,
  c.city,
  -- Company metrics
  c.employee_count,
  -- Contact management fields
  c.contact_summary,
  c.nurture,
  c.nurture_reason,
  c.do_not_contact,
  c.matchscore,
  c.status,
  -- Lead reference
  c.lead_id
FROM contacts c;
