
-- Add job_title_raw column to store original titles
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS job_title_raw TEXT;

-- Update existing records to preserve current job_title in job_title_raw
UPDATE public.leads 
SET job_title_raw = job_title 
WHERE job_title_raw IS NULL AND job_title IS NOT NULL;

-- Create function for job title normalization
CREATE OR REPLACE FUNCTION public.normalize_job_title(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized_title TEXT;
  mapping_rules TEXT[][] := ARRAY[
    ['experienced managing director with a demonstrated history', 'Managing Director'],
    ['founder & ceo', 'Founder'],
    ['head of growth', 'Head of Growth'],
    ['sales manager benelux', 'Sales Manager'],
    ['freelance marketeer', 'Freelance Marketeer'],
    ['cmo (chief marketing officer)', 'CMO'],
    ['strategisch marketeer & copywriter', 'Strategisch Marketeer'],
    ['managing director', 'Managing Director'],
    ['chief executive officer', 'CEO'],
    ['chief technology officer', 'CTO'],
    ['chief marketing officer', 'CMO'],
    ['chief financial officer', 'CFO'],
    ['chief operating officer', 'COO'],
    ['vice president', 'VP'],
    ['senior manager', 'Senior Manager'],
    ['account manager', 'Account Manager'],
    ['project manager', 'Project Manager'],
    ['product manager', 'Product Manager'],
    ['business development manager', 'Business Development Manager'],
    ['marketing manager', 'Marketing Manager'],
    ['sales manager', 'Sales Manager'],
    ['operations manager', 'Operations Manager'],
    ['hr manager', 'HR Manager'],
    ['finance manager', 'Finance Manager']
  ];
  rule TEXT[];
BEGIN
  -- Return NULL if input is NULL or empty
  IF title IS NULL OR TRIM(title) = '' THEN
    RETURN NULL;
  END IF;

  -- Convert to lowercase for processing
  normalized_title := LOWER(TRIM(title));

  -- Remove common noise phrases using regex
  normalized_title := REGEXP_REPLACE(normalized_title, '\s*(with\s+experience\s+in|demonstrated\s+history|skilled\s+in|experienced\s+in|specializing\s+in|focused\s+on).*$', '', 'gi');
  normalized_title := REGEXP_REPLACE(normalized_title, '\s*(at\s+[a-zA-Z0-9\s&]+)$', '', 'gi');
  normalized_title := REGEXP_REPLACE(normalized_title, '\s*\([^)]*\)\s*', ' ', 'g');
  normalized_title := REGEXP_REPLACE(normalized_title, '\s+', ' ', 'g');
  normalized_title := TRIM(normalized_title);

  -- Apply mapping rules
  FOREACH rule SLICE 1 IN ARRAY mapping_rules
  LOOP
    IF normalized_title ILIKE '%' || rule[1] || '%' THEN
      normalized_title := rule[2];
      EXIT;
    END IF;
  END LOOP;

  -- Capitalize first letter of each word
  normalized_title := INITCAP(normalized_title);

  -- Clean up common patterns
  normalized_title := REPLACE(normalized_title, ' & ', ' & ');
  normalized_title := REPLACE(normalized_title, '  ', ' ');

  RETURN TRIM(normalized_title);
END;
$$;

-- Create trigger function to automatically normalize job titles on insert/update
CREATE OR REPLACE FUNCTION public.normalize_job_title_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Store original title if not already set
  IF NEW.job_title_raw IS NULL AND NEW.job_title IS NOT NULL THEN
    NEW.job_title_raw := NEW.job_title;
  END IF;

  -- Normalize the job title
  IF NEW.job_title IS NOT NULL THEN
    NEW.job_title := public.normalize_job_title(NEW.job_title);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for automatic normalization
DROP TRIGGER IF EXISTS normalize_job_title_trigger ON public.leads;
CREATE TRIGGER normalize_job_title_trigger
  BEFORE INSERT OR UPDATE OF job_title ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_job_title_trigger();

-- Add better index for job title searching
DROP INDEX IF EXISTS idx_leads_job_title_lower;
CREATE INDEX idx_leads_job_title_lower ON public.leads (LOWER(job_title)) WHERE job_title IS NOT NULL;

-- Also create index for job_title_raw for backup searches
CREATE INDEX IF NOT EXISTS idx_leads_job_title_raw_lower ON public.leads (LOWER(job_title_raw)) WHERE job_title_raw IS NOT NULL;
