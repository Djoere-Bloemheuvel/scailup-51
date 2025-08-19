
-- First, let's drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view own client relationship" ON public.client_users;
DROP POLICY IF EXISTS "Users can insert own client relationship" ON public.client_users;
DROP POLICY IF EXISTS "Admins can manage client users in their client" ON public.client_users;

-- Create or update the security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT client_users.client_id 
  FROM public.client_users 
  WHERE client_users.user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create a new security definer function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_users 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  );
$$;

-- Create new policies that avoid recursion
CREATE POLICY "Users can view own client relationship"
  ON public.client_users
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own client relationship"
  ON public.client_users
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage client users"
  ON public.client_users
  FOR ALL
  USING (public.is_current_user_admin());

-- Ensure service role has full access for the scheduled processor
CREATE POLICY "Service role can manage all client users"
  ON public.client_users
  FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Update the clients table to allow service role access
CREATE POLICY "Service role can manage all clients"
  ON public.clients
  FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Schedule the cron job to run every 30 seconds
SELECT cron.schedule(
  'scheduled-task-processor',
  '*/30 * * * * *',
  $$ 
  SELECT net.http_post(
    url := 'https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/scheduled-task-processor',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('source', 'cron')
  ) 
  $$
);
