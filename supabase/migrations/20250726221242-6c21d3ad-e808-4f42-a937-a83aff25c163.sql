
-- Add lead_id column to contacts table to track which lead the contact was converted from
ALTER TABLE public.contacts 
ADD COLUMN lead_id uuid REFERENCES public.leads(id);

-- Add an index for better query performance when looking up contacts by lead_id
CREATE INDEX idx_contacts_lead_id ON public.contacts(lead_id);

-- Add a unique constraint to prevent duplicate contacts from the same lead for the same client
ALTER TABLE public.contacts 
ADD CONSTRAINT unique_client_lead UNIQUE (client_id, lead_id);
