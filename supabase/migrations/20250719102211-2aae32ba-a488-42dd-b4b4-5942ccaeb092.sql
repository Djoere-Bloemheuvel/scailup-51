
-- Create services table to replace localStorage storage
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
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

-- Add Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Users can view their own services" 
  ON public.services 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = services.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own services" 
  ON public.services 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = services.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own services" 
  ON public.services 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = services.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own services" 
  ON public.services 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = services.client_id 
    AND clients.user_id = auth.uid()
  ));

-- Add constraint to limit max 5 services per client
CREATE OR REPLACE FUNCTION check_service_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.services WHERE client_id = NEW.client_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 services allowed per client';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_limit_trigger
  BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION check_service_limit();
