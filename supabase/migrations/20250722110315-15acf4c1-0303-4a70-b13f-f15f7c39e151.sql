-- Fix RLS policy syntax and complete registration setup

-- Create services table first
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_roles JSONB,
  target_companies TEXT,
  problem_solved TEXT,
  unique_value TEXT,
  use_cases TEXT,
  status TEXT NOT NULL DEFAULT 'concept',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create correct policies for services
CREATE POLICY "Users can manage services for their client" 
  ON public.services 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = services.client_id 
    AND c.user_id = auth.uid()
  ));

-- Fix client_modules policies with correct syntax
DROP POLICY IF EXISTS "Users can view their own client modules" ON public.client_modules;

CREATE POLICY "Users can view modules for their client" 
  ON public.client_modules 
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_modules.client_id 
    AND c.user_id = auth.uid()
  ));

-- Separate INSERT policy with WITH CHECK
CREATE POLICY "System can create client modules" 
  ON public.client_modules 
  FOR INSERT
  WITH CHECK (true); -- Allow system to create default modules

CREATE POLICY "Users can update their client modules" 
  ON public.client_modules 
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_modules.client_id 
    AND c.user_id = auth.uid()
  ));

-- Add service limit trigger
CREATE OR REPLACE FUNCTION check_service_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.services WHERE client_id = NEW.client_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 services allowed per client';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_limit_trigger ON public.services;
CREATE TRIGGER service_limit_trigger
  BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION check_service_limit();