
-- Enable RLS on all tables that are missing it
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_tier_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_processing_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products table
CREATE POLICY "Users can view products from their client" ON products
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = products.client_id
  )
);

CREATE POLICY "Users can insert products for their client" ON products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = products.client_id
  )
);

CREATE POLICY "Users can update products from their client" ON products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = products.client_id
  )
);

CREATE POLICY "Users can delete products from their client" ON products
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = products.client_id
  )
);

-- Create RLS policies for contacts table
CREATE POLICY "Users can view contacts from their client" ON contacts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contacts.client_id
  )
);

CREATE POLICY "Users can insert contacts for their client" ON contacts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contacts.client_id
  )
);

CREATE POLICY "Users can update contacts from their client" ON contacts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contacts.client_id
  )
);

CREATE POLICY "Users can delete contacts from their client" ON contacts
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contacts.client_id
  )
);

-- Create RLS policies for campaigns table
CREATE POLICY "Users can view campaigns from their client" ON campaigns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = campaigns.client_id
  )
);

CREATE POLICY "Users can insert campaigns for their client" ON campaigns
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = campaigns.client_id
  )
);

CREATE POLICY "Users can update campaigns from their client" ON campaigns
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = campaigns.client_id
  )
);

CREATE POLICY "Users can delete campaigns from their client" ON campaigns
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = campaigns.client_id
  )
);

-- Create RLS policies for campaign_contacts table
CREATE POLICY "Users can view campaign_contacts from their client" ON campaign_contacts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() 
    AND c.id = campaign_contacts.campaign_id
  )
);

CREATE POLICY "Users can insert campaign_contacts for their client" ON campaign_contacts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() 
    AND c.id = campaign_contacts.campaign_id
  )
);

CREATE POLICY "Users can update campaign_contacts from their client" ON campaign_contacts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() 
    AND c.id = campaign_contacts.campaign_id
  )
);

CREATE POLICY "Users can delete campaign_contacts from their client" ON campaign_contacts
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() 
    AND c.id = campaign_contacts.campaign_id
  )
);

-- Create RLS policies for module_tiers table (admin only)
CREATE POLICY "Only admins can view module_tiers" ON module_tiers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

CREATE POLICY "Only admins can manage module_tiers" ON module_tiers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

-- Create RLS policies for module_tier_credits table (admin only)
CREATE POLICY "Only admins can view module_tier_credits" ON module_tier_credits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

CREATE POLICY "Only admins can manage module_tier_credits" ON module_tier_credits
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

-- Create RLS policies for credit_processing_log table (admin only)
CREATE POLICY "Only admins can view credit_processing_log" ON credit_processing_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

CREATE POLICY "Only admins can manage credit_processing_log" ON credit_processing_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

-- Secure existing database functions
CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS uuid
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT client_users.client_id 
  FROM public.client_users 
  WHERE client_users.user_id = auth.uid() 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_client_access(target_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.client_users
    WHERE client_users.user_id = auth.uid()
    AND client_users.client_id = target_client_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_for_client(target_client_id uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT client_users.role::TEXT
  FROM public.client_users
  WHERE client_users.user_id = auth.uid()
  AND client_users.client_id = target_client_id
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT role::TEXT FROM public.client_users WHERE user_id = auth.uid() LIMIT 1;
$function$;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  client_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log (admin only)
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security audit log" ON security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.role = 'admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON security_audit_log
FOR INSERT WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    client_id,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_client_id,
    p_success,
    p_error_message
  );
END;
$function$;

-- Create admin users table for database-driven admin management
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  email TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin users (super admin only)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can manage admin users" ON admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = auth.uid() 
    AND a.is_super_admin = true
    AND a.revoked_at IS NULL
  )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND revoked_at IS NULL
  );
$function$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND is_super_admin = true
    AND revoked_at IS NULL
  );
$function$;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Add triggers to tables that have updated_at columns
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
