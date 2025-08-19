-- Recreate missing pending_registrations table and fix registration issues

-- Create pending_registrations table that was missing
CREATE TABLE IF NOT EXISTS public.pending_registrations (
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

-- Enable RLS on pending_registrations
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for registration flow
CREATE POLICY "Public access for registration flow" 
  ON public.pending_registrations 
  FOR ALL
  USING (true);

-- Add indexes for pending_registrations
CREATE INDEX IF NOT EXISTS idx_pending_registrations_token ON public.pending_registrations(token);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);

-- Also ensure the services table has proper policies for registration
DROP POLICY IF EXISTS "Users can view their own services" ON public.services;
DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;

CREATE POLICY "Users can manage services for their client" 
  ON public.services 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = services.client_id 
    AND (c.user_id = auth.uid() OR auth.uid() IS NULL) -- Allow for registration flow
  ));

-- Make sure client_modules table has proper policies
CREATE POLICY "Users can view modules for their client" 
  ON public.client_modules 
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_modules.client_id 
    AND (c.user_id = auth.uid() OR auth.uid() IS NULL)
  ));

CREATE POLICY "System can manage client modules" 
  ON public.client_modules 
  FOR ALL
  USING (true); -- Allow system to create default modules

-- Fix any user_id constraint issues in clients table
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_id_unique 
  ON public.clients(user_id) 
  WHERE user_id IS NOT NULL;