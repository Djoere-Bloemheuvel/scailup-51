
-- Add status column to leads table
ALTER TABLE public.leads 
ADD COLUMN status text DEFAULT 'New';

-- Create an index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Update some sample data with different statuses for testing
UPDATE public.leads 
SET status = CASE 
  WHEN random() < 0.3 THEN 'Active'
  WHEN random() < 0.6 THEN 'Converted'
  ELSE 'New'
END
WHERE status IS NULL OR status = 'New';
