
-- Add unique constraint on email in clients table
ALTER TABLE public.clients ADD CONSTRAINT unique_email UNIQUE (email);

-- Update RLS policies for clients table to allow access by email or client_id
DROP POLICY IF EXISTS "Users can view client by email during registration" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own client record" ON public.clients;

-- Create new comprehensive RLS policy for clients
CREATE POLICY "Users can access clients by email or client_id" 
  ON public.clients 
  FOR SELECT 
  USING (
    email = (auth.jwt() ->> 'email') OR 
    id::text = (auth.jwt() -> 'user_metadata' ->> 'client_id')
  );

-- Allow users to insert new clients during registration
CREATE POLICY "Users can create clients during registration" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (email = (auth.jwt() ->> 'email'));

-- Allow users to update their linked client
CREATE POLICY "Users can update their linked client" 
  ON public.clients 
  FOR UPDATE 
  USING (
    email = (auth.jwt() ->> 'email') OR 
    id::text = (auth.jwt() -> 'user_metadata' ->> 'client_id')
  );
