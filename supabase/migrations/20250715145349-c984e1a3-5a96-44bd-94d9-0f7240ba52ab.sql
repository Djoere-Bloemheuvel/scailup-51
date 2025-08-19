
-- Create pending_registrations table
CREATE TABLE public.pending_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to pending registrations (for registration flow)
CREATE POLICY "Anyone can view pending registrations by token" 
  ON public.pending_registrations 
  FOR SELECT 
  USING (true);

-- Create policy for updating registration status
CREATE POLICY "Anyone can update registration status" 
  ON public.pending_registrations 
  FOR UPDATE 
  USING (true);

-- Create index on token for faster lookups
CREATE INDEX idx_pending_registrations_token ON public.pending_registrations(token);
CREATE INDEX idx_pending_registrations_status ON public.pending_registrations(status);
