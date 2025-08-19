-- Onboarding System Migration
-- This migration sets up the complete onboarding system for ScailUp

-- 1. Update clients table structure
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS allowed_domain text,
ADD COLUMN IF NOT EXISTS billing_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS contact_email text;

-- 2. Create user_client_links table for role-based access
CREATE TABLE IF NOT EXISTS public.user_client_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- 3. Create billing_plans table
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly integer NOT NULL, -- in cents
  price_yearly integer NOT NULL, -- in cents
  features jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create client_invites table
CREATE TABLE IF NOT EXISTS public.client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Create onboarding_sessions table
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  client_name text NOT NULL,
  contact_email text NOT NULL,
  allowed_domain text NOT NULL,
  billing_plan text NOT NULL,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Insert default billing plans
INSERT INTO public.billing_plans (name, slug, price_monthly, price_yearly, features) VALUES
('Starter', 'starter', 2900, 29000, '["lead_engine", "basic_support"]'),
('Professional', 'professional', 7900, 79000, '["lead_engine", "marketing_engine", "priority_support"]'),
('Enterprise', 'enterprise', 19900, 199000, '["lead_engine", "marketing_engine", "custom_integrations", "dedicated_support"]')
ON CONFLICT (slug) DO NOTHING;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_allowed_domain ON public.clients(allowed_domain);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients(is_active);
CREATE INDEX IF NOT EXISTS idx_user_client_links_user_id ON public.user_client_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_client_links_client_id ON public.user_client_links(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_token ON public.client_invites(token);
CREATE INDEX IF NOT EXISTS idx_client_invites_email ON public.client_invites(email);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_token ON public.onboarding_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_stripe_session_id ON public.onboarding_sessions(stripe_session_id);

-- 8. Create RLS policies for user_client_links
ALTER TABLE public.user_client_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client links" ON public.user_client_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client links" ON public.user_client_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client links" ON public.user_client_links
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. Create RLS policies for client_invites
ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites for their clients" ON public.client_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_client_links 
      WHERE user_id = auth.uid() 
      AND client_id = client_invites.client_id
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Users can create invites for their clients" ON public.client_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_client_links 
      WHERE user_id = auth.uid() 
      AND client_id = client_invites.client_id
      AND role IN ('admin', 'owner')
    )
  );

-- 10. Create RLS policies for onboarding_sessions
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create onboarding sessions" ON public.onboarding_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own onboarding sessions" ON public.onboarding_sessions
  FOR SELECT USING (contact_email = auth.jwt() ->> 'email');

-- 11. Update existing clients to have proper structure
-- Migrate existing client data to new structure
UPDATE public.clients 
SET 
  company_name = COALESCE(company_name, 'Unknown Company'),
  contact_email = COALESCE(email, ''),
  allowed_domain = COALESCE(
    CASE 
      WHEN email IS NOT NULL THEN split_part(email, '@', 2)
      ELSE 'scailup.io'
    END
  ),
  billing_plan = COALESCE(plan, 'free')
WHERE company_name IS NULL OR contact_email IS NULL OR allowed_domain IS NULL;

-- 12. Create user_client_links for existing users
INSERT INTO public.user_client_links (user_id, client_id, role)
SELECT 
  user_id,
  id as client_id,
  CASE WHEN admin = true THEN 'admin' ELSE 'user' END as role
FROM public.clients 
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, client_id) DO NOTHING;

-- 13. Create function to get current user's client
CREATE OR REPLACE FUNCTION public.get_current_user_client()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT client_id 
  FROM public.user_client_links 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- 14. Create function to check if user has access to client
CREATE OR REPLACE FUNCTION public.user_has_client_access(client_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_client_links 
    WHERE user_id = auth.uid() 
    AND client_id = client_uuid
  );
$$;

-- 15. Create function to get user's role for client
CREATE OR REPLACE FUNCTION public.get_user_client_role(client_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_client_links 
  WHERE user_id = auth.uid() 
  AND client_id = client_uuid
  LIMIT 1;
$$; 