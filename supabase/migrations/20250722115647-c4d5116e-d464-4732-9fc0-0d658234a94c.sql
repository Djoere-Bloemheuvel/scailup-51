
-- Fix infinite recursion in clients table RLS policies
-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Allow email-based client lookup for registration" ON public.clients;
DROP POLICY IF EXISTS "System can create client records" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own client" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own client" ON public.clients;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own client record" 
  ON public.clients 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own client record" 
  ON public.clients 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "System can create client records during registration" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (true);

-- Allow domain validation during registration (public read access)
CREATE POLICY "Public read access for domain validation" 
  ON public.clients 
  FOR SELECT 
  USING (true);

-- Admin policy without recursion
CREATE POLICY "Admins can manage all clients" 
  ON public.clients 
  FOR ALL
  USING (admin = true AND user_id = auth.uid());
