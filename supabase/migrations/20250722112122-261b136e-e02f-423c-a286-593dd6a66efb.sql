
-- Missing critical tables and complete database restoration

-- 1. Create missing webhook_executions table
CREATE TABLE IF NOT EXISTS public.webhook_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  webhook_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create missing credit_usage_logs table
CREATE TABLE IF NOT EXISTS public.credit_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create missing pending_registrations table
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Add missing columns to existing tables

-- Complete leads table with ALL missing columns
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS company_summary TEXT,
ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS match_reasons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unique_angles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_campaign_match TEXT,
ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Complete clients table with missing business columns
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- Complete webhook_configs table (should already exist but ensuring headers column)
ALTER TABLE public.webhook_configs 
ADD COLUMN IF NOT EXISTS headers JSONB DEFAULT '{"Content-Type": "application/json"}';

-- 5. Enable RLS on new tables
ALTER TABLE public.webhook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- 6. Create comprehensive RLS policies for new tables

-- Webhook executions policies
CREATE POLICY "Users can view their webhook executions" 
  ON public.webhook_executions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.webhook_configs wc 
    WHERE wc.id = webhook_executions.webhook_config_id 
    AND wc.client_id = public.get_current_client_id()
  ));

CREATE POLICY "System can create webhook executions" 
  ON public.webhook_executions 
  FOR INSERT 
  WITH CHECK (true);

-- Credit usage logs policies
CREATE POLICY "Users can view their client credit logs" 
  ON public.credit_usage_logs 
  FOR SELECT 
  USING (client_id = public.get_current_client_id());

CREATE POLICY "System can create credit logs" 
  ON public.credit_usage_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Pending registrations policies (public access for registration flow)
CREATE POLICY "Public access for registration flow" 
  ON public.pending_registrations 
  FOR ALL
  USING (true);

-- 7. Create missing essential database functions

-- Function to execute webhooks
CREATE OR REPLACE FUNCTION public.execute_webhook(
  p_webhook_config_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_execution_id UUID;
  v_webhook_url TEXT;
  v_headers JSONB;
BEGIN
  -- Get webhook configuration
  SELECT webhook_url, headers INTO v_webhook_url, v_headers
  FROM webhook_configs 
  WHERE id = p_webhook_config_id AND is_active = true;
  
  IF v_webhook_url IS NULL THEN
    RAISE EXCEPTION 'Webhook configuration not found or inactive';
  END IF;
  
  -- Create execution record
  INSERT INTO webhook_executions (
    webhook_config_id,
    event_type,
    event_data,
    webhook_url
  ) VALUES (
    p_webhook_config_id,
    p_event_type,
    p_event_data,
    v_webhook_url
  ) RETURNING id INTO v_execution_id;
  
  RETURN v_execution_id;
END;
$$;

-- Function to add credits to a client
CREATE OR REPLACE FUNCTION public.add_credits_to_client(
  p_client_id UUID,
  p_module_id TEXT,
  p_credit_type TEXT,
  p_amount INTEGER,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add to credit balances
  INSERT INTO credit_balances (
    client_id,
    module_id,
    credit_type,
    amount,
    expires_at
  ) VALUES (
    p_client_id,
    p_module_id,
    p_credit_type,
    p_amount,
    COALESCE(p_expires_at, NOW() + INTERVAL '1 year')
  )
  ON CONFLICT (client_id, module_id, credit_type) 
  DO UPDATE SET 
    amount = credit_balances.amount + EXCLUDED.amount,
    updated_at = NOW();
  
  -- Log the credit addition
  INSERT INTO credit_usage_logs (
    client_id,
    credit_type,
    amount,
    description
  ) VALUES (
    p_client_id,
    p_credit_type,
    p_amount,
    format('Credits added: %s for module %s', p_amount, p_module_id)
  );
  
  RETURN TRUE;
END;
$$;

-- Function to handle contact creation with webhook
CREATE OR REPLACE FUNCTION public.create_contact_with_webhook(
  p_lead_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_id UUID;
  v_client_id UUID;
  v_webhook_config_id UUID;
  v_lead RECORD;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Convert lead to contact
  SELECT convert_lead_to_contact(p_lead_id, p_notes) INTO v_contact_id;
  
  -- Get lead data for webhook
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  -- Find active webhook configuration
  SELECT id INTO v_webhook_config_id
  FROM webhook_configs 
  WHERE client_id = v_client_id 
    AND webhook_type = 'n8n' 
    AND is_active = true 
  LIMIT 1;
  
  -- Execute webhook if configured
  IF v_webhook_config_id IS NOT NULL THEN
    PERFORM execute_webhook(
      v_webhook_config_id,
      'contact_created',
      jsonb_build_object(
        'contact_id', v_contact_id,
        'lead_id', p_lead_id,
        'client_id', v_client_id,
        'lead_data', to_jsonb(v_lead)
      )
    );
  END IF;
  
  RETURN v_contact_id;
END;
$$;

-- 8. Add missing indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_webhook_executions_webhook_config_id ON public.webhook_executions(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_event_type ON public.webhook_executions(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_success ON public.webhook_executions(success);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_created_at ON public.webhook_executions(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_client_id ON public.credit_usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_credit_type ON public.credit_usage_logs(credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_created_at ON public.credit_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_token ON public.pending_registrations(token);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);

-- 9. Update existing function to use credit system properly
CREATE OR REPLACE FUNCTION public.bulk_convert_leads_to_contacts(
  p_lead_ids UUID[], 
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  lead_id UUID, 
  success BOOLEAN, 
  contact_id UUID, 
  error_message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id UUID;
  v_contact_id UUID;
  v_client_id UUID;
  v_lead_exists BOOLEAN;
  v_contact_exists BOOLEAN;
BEGIN
  -- Get client_id for current user
  SELECT get_current_client_id() INTO v_client_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Process each lead
  FOREACH v_lead_id IN ARRAY p_lead_ids
  LOOP
    BEGIN
      -- Check if lead exists and is accessible
      SELECT EXISTS(
        SELECT 1 FROM leads 
        WHERE id = v_lead_id
          AND client_id = v_client_id
          AND email IS NOT NULL 
          AND email != ''
      ) INTO v_lead_exists;
      
      IF NOT v_lead_exists THEN
        RETURN QUERY SELECT v_lead_id, false, NULL::UUID, 'Lead not found or invalid';
        CONTINUE;
      END IF;
      
      -- Check if contact already exists
      SELECT EXISTS(
        SELECT 1 FROM contacts 
        WHERE lead_id = v_lead_id 
          AND client_id = v_client_id
      ) INTO v_contact_exists;
      
      IF v_contact_exists THEN
        RETURN QUERY SELECT v_lead_id, false, NULL::UUID, 'Contact already exists for this lead';
        CONTINUE;
      END IF;
      
      -- Create contact with webhook
      SELECT create_contact_with_webhook(v_lead_id, p_notes) INTO v_contact_id;
      
      RETURN QUERY SELECT v_lead_id, true, v_contact_id, NULL::TEXT;
      
    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY SELECT v_lead_id, false, NULL::UUID, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- 10. Create default modules if they don't exist
INSERT INTO modules (name, description, is_active) VALUES
  ('SARAH_AI', 'AI-powered lead enrichment and conversation assistant', true),
  ('LEAD_DATABASE', 'Lead management and database access', true),
  ('CAMPAIGNS', 'Campaign management and automation', true),
  ('ANALYTICS', 'Advanced analytics and reporting', true),
  ('INTEGRATIONS', 'Third-party integrations and webhooks', true)
ON CONFLICT (name) DO NOTHING;

-- 11. Ensure admin user has proper setup
DO $$
DECLARE
  admin_user_id UUID;
  admin_client_id UUID;
BEGIN
  -- Find existing admin user
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'djoere@scailup.io' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Ensure admin client record exists and is properly configured
    INSERT INTO public.clients (
      user_id, 
      email, 
      first_name, 
      last_name, 
      company_name, 
      is_active, 
      plan, 
      admin
    ) VALUES (
      admin_user_id, 
      'djoere@scailup.io', 
      'Djoere', 
      'Bloemheuvel', 
      'ScailUp', 
      true, 
      'enterprise', 
      true
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      company_name = EXCLUDED.company_name,
      is_active = true,
      plan = 'enterprise',
      admin = true,
      updated_at = NOW();
    
    -- Get the client ID
    SELECT id INTO admin_client_id FROM public.clients WHERE user_id = admin_user_id;
    
    -- Ensure users table entry exists
    INSERT INTO public.users (id, client_id, email)
    VALUES (admin_user_id, admin_client_id, 'djoere@scailup.io')
    ON CONFLICT (id) DO UPDATE SET
      client_id = EXCLUDED.client_id,
      email = EXCLUDED.email;
      
    -- Ensure default modules for admin client
    INSERT INTO public.client_modules (client_id, module, active) VALUES
      (admin_client_id, 'SARAH_AI', true),
      (admin_client_id, 'LEAD_DATABASE', true),
      (admin_client_id, 'CAMPAIGNS', true),
      (admin_client_id, 'ANALYTICS', true),
      (admin_client_id, 'INTEGRATIONS', true)
    ON CONFLICT (client_id, module) DO UPDATE SET 
      active = true,
      updated_at = NOW();
      
    -- Add default credits for admin
    PERFORM add_credits_to_client(admin_client_id, 'LEAD_DATABASE', 'standard', 10000);
    PERFORM add_credits_to_client(admin_client_id, 'SARAH_AI', 'standard', 10000);
    PERFORM add_credits_to_client(admin_client_id, 'CAMPAIGNS', 'standard', 10000);
    
    -- Setup default webhook configuration
    INSERT INTO public.webhook_configs (
      client_id,
      webhook_type,
      webhook_url,
      webhook_name,
      headers,
      is_active
    ) VALUES (
      admin_client_id,
      'n8n',
      'https://djoere.app.n8n.cloud/webhook-test/53666597-5d52-417e-924c-535a4d2256e4',
      'n8n Lead Conversion Webhook',
      '{"Content-Type": "application/json"}',
      true
    )
    ON CONFLICT (client_id, webhook_type) DO UPDATE SET
      webhook_url = EXCLUDED.webhook_url,
      webhook_name = EXCLUDED.webhook_name,
      is_active = true,
      updated_at = NOW();
  END IF;
END $$;

-- 12. Final cleanup and verification
SELECT cleanup_orphaned_records();
SELECT verify_system_integrity();
