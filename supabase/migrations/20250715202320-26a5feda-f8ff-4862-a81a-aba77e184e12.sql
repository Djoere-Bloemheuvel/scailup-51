
-- Ensure the index on LOWER(job_title) exists for better performance
CREATE INDEX IF NOT EXISTS idx_leads_lower_job_title ON public.leads (LOWER(job_title));

-- Update any existing records that might have empty job_title but have job_title_raw
-- This ensures all records use the normalized title
UPDATE public.leads 
SET job_title = public.normalize_job_title(job_title_raw)
WHERE (job_title IS NULL OR job_title = '') 
  AND job_title_raw IS NOT NULL 
  AND job_title_raw != '';

-- Ensure the trigger is properly set to normalize on insert/update
-- This prevents fallback to old titles
DROP TRIGGER IF EXISTS normalize_job_title_trigger ON public.leads;
CREATE TRIGGER normalize_job_title_trigger
  BEFORE INSERT OR UPDATE OF job_title, job_title_raw ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_job_title_trigger();
