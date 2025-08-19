
-- Create users table to link authenticated users to clients
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Users can view their own record" 
  ON public.users 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own record" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own record" 
  ON public.users 
  FOR UPDATE 
  USING (id = auth.uid());

-- Update clients table RLS to allow reading by email for registration flow
CREATE POLICY "Users can view client by email during registration" 
  ON public.clients 
  FOR SELECT 
  USING (true);

-- Add unique index on users table
CREATE UNIQUE INDEX idx_users_client_id_email ON public.users(client_id, email);
