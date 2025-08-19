
-- Add employee_number field to the leads table
ALTER TABLE public.leads ADD COLUMN employee_number INTEGER;

-- Create an index for better performance on employee_number filtering
CREATE INDEX idx_leads_employee_number ON public.leads(employee_number);
