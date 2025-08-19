
-- Add indexes for tag filtering performance
CREATE INDEX IF NOT EXISTS idx_leads_tags_gin ON public.leads USING gin(tags);

-- Create function to get unique tags from leads table
CREATE OR REPLACE FUNCTION public.get_unique_tags()
RETURNS TABLE(tag text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT DISTINCT unnest(tags) as tag
  FROM public.leads
  WHERE tags IS NOT NULL 
    AND array_length(tags, 1) > 0
    AND user_id = auth.uid()
  ORDER BY tag;
$$;
