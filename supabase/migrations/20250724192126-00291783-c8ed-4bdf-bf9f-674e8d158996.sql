
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage client users" ON public.client_users;
DROP POLICY IF EXISTS "Users can view their client relationships" ON public.client_users;

-- Create new non-recursive policies for client_users table

-- Policy 1: Users can view their own client_users record
CREATE POLICY "Users can view own client relationship" 
ON public.client_users 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can insert their own client_users record (needed for signup)
CREATE POLICY "Users can insert own client relationship" 
ON public.client_users 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Service role can manage all client_users records (for Edge Functions)
CREATE POLICY "Service role can manage all client users" 
ON public.client_users 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 4: Admin users can manage client_users within their client
-- This uses a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.client_users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY "Admins can manage client users in their client" 
ON public.client_users 
FOR ALL 
TO authenticated
USING (
  public.get_current_user_role() = 'admin' 
  AND client_id IN (
    SELECT client_id FROM public.client_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  public.get_current_user_role() = 'admin' 
  AND client_id IN (
    SELECT client_id FROM public.client_users WHERE user_id = auth.uid()
  )
);
