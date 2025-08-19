
-- Create an index on employee_count for better filtering performance
CREATE INDEX IF NOT EXISTS idx_leads_employee_count ON public.leads(employee_count);

-- Also create a composite index for common filtering patterns
CREATE INDEX IF NOT EXISTS idx_leads_employee_count_user_filtering ON public.leads(employee_count, country, industry) WHERE employee_count IS NOT NULL;
