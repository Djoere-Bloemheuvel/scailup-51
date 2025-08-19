
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_modules table
CREATE TABLE public.client_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, module)
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients table
CREATE POLICY "Users can view their own client record" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client record" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for client_modules table
CREATE POLICY "Users can view their own client modules" 
  ON public.client_modules 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_modules.client_id 
    AND clients.user_id = auth.uid()
  ));

-- Function to automatically create client record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.clients (user_id, is_active, plan)
  VALUES (NEW.id, false, 'free');
  RETURN NEW;
END;
$$;

-- Trigger to create client record on user creation
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_client();
