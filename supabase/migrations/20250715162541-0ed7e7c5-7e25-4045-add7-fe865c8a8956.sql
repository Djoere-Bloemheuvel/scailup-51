
-- Add index for job title filtering performance
CREATE INDEX IF NOT EXISTS idx_leads_job_title_gin ON public.leads USING gin(to_tsvector('simple', job_title));

-- Add btree index for exact job title matching
CREATE INDEX IF NOT EXISTS idx_leads_job_title_btree ON public.leads (job_title);
