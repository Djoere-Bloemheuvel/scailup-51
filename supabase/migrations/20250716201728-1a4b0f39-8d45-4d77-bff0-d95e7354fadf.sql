
-- Remove the trigger that automatically normalizes job titles
DROP TRIGGER IF EXISTS normalize_job_title_trigger ON public.leads;

-- Remove the trigger function
DROP FUNCTION IF EXISTS public.normalize_job_title_trigger();

-- Remove the normalization function
DROP FUNCTION IF EXISTS public.normalize_job_title(text);

-- Remove the indexes that were created for normalized job titles
DROP INDEX IF EXISTS idx_leads_job_title_lower;
DROP INDEX IF EXISTS idx_leads_job_title_raw_lower;
DROP INDEX IF EXISTS idx_leads_lower_job_title;
DROP INDEX IF EXISTS idx_leads_job_title_gin;
DROP INDEX IF EXISTS idx_leads_job_title_btree;

-- Optional: Remove the job_title_raw column if you don't need it anymore
-- (Uncomment the line below if you want to remove it)
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS job_title_raw;
