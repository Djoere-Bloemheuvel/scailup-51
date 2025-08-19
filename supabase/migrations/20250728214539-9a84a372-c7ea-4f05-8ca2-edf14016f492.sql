
-- Create the offers table for client offerings
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  audience TEXT[] DEFAULT ARRAY[]::TEXT[],
  problems TEXT[] DEFAULT ARRAY[]::TEXT[],
  differentiation TEXT,
  use_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  inserted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Users can view offers from their client
CREATE POLICY "Users can view offers from their client" 
  ON public.offers 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = offers.client_id
  ));

-- Users can insert offers for their client
CREATE POLICY "Users can insert offers for their client" 
  ON public.offers 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = offers.client_id
  ));

-- Users can update offers from their client
CREATE POLICY "Users can update offers from their client" 
  ON public.offers 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = offers.client_id
  ));

-- Users can delete offers from their client (for archiving)
CREATE POLICY "Users can delete offers from their client" 
  ON public.offers 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = offers.client_id
  ));

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION update_offers_updated_at();
