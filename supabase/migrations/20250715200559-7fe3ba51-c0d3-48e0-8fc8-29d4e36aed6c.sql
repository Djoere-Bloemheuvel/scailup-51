
-- Add index on LOWER(job_title) for performance if it doesn't already exist
CREATE INDEX IF NOT EXISTS idx_leads_job_title_lower ON public.leads (LOWER(job_title)) WHERE job_title IS NOT NULL;
