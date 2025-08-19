
-- Create callback_requests table
CREATE TABLE public.callback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voornaam TEXT NOT NULL,
  achternaam TEXT NOT NULL,
  email TEXT NOT NULL,
  telefoonnummer TEXT NOT NULL,
  bericht TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert callback requests (public form)
CREATE POLICY "Anyone can submit callback requests" 
  ON public.callback_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows authenticated users to view callback requests from their client
CREATE POLICY "Users can view callback requests from their client" 
  ON public.callback_requests 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid()
  ));

-- Add trigger to update the updated_at column
CREATE TRIGGER update_callback_requests_updated_at
  BEFORE UPDATE ON public.callback_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
