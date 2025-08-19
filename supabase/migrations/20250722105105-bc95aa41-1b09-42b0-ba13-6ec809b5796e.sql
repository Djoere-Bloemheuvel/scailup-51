-- Fix leads table structure by properly handling dependencies
-- First drop all dependent policies, then modify table structure

-- Drop all existing policies on leads table that depend on user_id
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads from their client" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;

-- Now safely add client_id column and drop user_id
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

-- Update existing leads to have a client_id if they have user_id
UPDATE public.leads 
SET client_id = (
  SELECT c.id FROM clients c WHERE c.user_id = leads.user_id LIMIT 1
) 
WHERE client_id IS NULL AND user_id IS NOT NULL;

-- Now drop the user_id column
ALTER TABLE public.leads DROP COLUMN IF EXISTS user_id CASCADE;

-- Add status column if it doesn't exist
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Make nullable the columns that should be nullable to match contacts
ALTER TABLE public.leads 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN company DROP NOT NULL;

-- Create new RLS policies for leads using client_id
CREATE POLICY "Users can view their client leads" ON public.leads
  FOR SELECT USING (
    client_id = public.get_current_client_id()
    AND email IS NOT NULL 
    AND email != ''
    AND (is_duplicate IS NULL OR is_duplicate = FALSE)
  );

CREATE POLICY "Users can insert leads for their client" ON public.leads
  FOR INSERT WITH CHECK (
    client_id = public.get_current_client_id()
  );

CREATE POLICY "Users can update their client leads" ON public.leads
  FOR UPDATE USING (
    client_id = public.get_current_client_id()
  );

CREATE POLICY "Users can delete their client leads" ON public.leads
  FOR DELETE USING (
    client_id = public.get_current_client_id()
  );

-- Add index for the new client_id column
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON public.leads(client_id);