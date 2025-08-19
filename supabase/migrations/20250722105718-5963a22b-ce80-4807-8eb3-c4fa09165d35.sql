-- Add remaining essential functions and components for complete database restoration

-- Create essential functions that were referenced in the original system

-- Function to get lead status counts (was referenced in logs)
CREATE OR REPLACE FUNCTION public.get_lead_status_counts()
RETURNS TABLE(total bigint, new bigint, contacts bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  total_count BIGINT;
  new_count BIGINT;
  contacts_count BIGINT;
BEGIN
  -- Get current client ID
  SELECT get_current_client_id() INTO current_client_id;
  
  -- If no client found, return zeros
  IF current_client_id IS NULL THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Count total leads with valid emails
  SELECT COUNT(*) INTO total_count
  FROM leads l
  WHERE l.client_id = current_client_id
    AND l.email IS NOT NULL 
    AND l.email != '';
  
  -- Count new leads (not converted by current client)
  SELECT COUNT(*) INTO new_count
  FROM leads l
  WHERE l.client_id = current_client_id
    AND l.email IS NOT NULL 
    AND l.email != ''
    AND NOT EXISTS (
      SELECT 1 FROM contacts c 
      WHERE c.lead_id = l.id 
        AND c.client_id = current_client_id
    );
  
  -- Count contacts (converted by current client)  
  SELECT COUNT(*) INTO contacts_count
  FROM contacts c
  WHERE c.client_id = current_client_id;
  
  -- Return the counts
  RETURN QUERY SELECT total_count, new_count, contacts_count;
END;
$$;

-- Function to check and use credits
CREATE OR REPLACE FUNCTION public.check_and_use_credits(
  p_client_id UUID,
  p_module_id TEXT,
  p_credit_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current credit balance
  SELECT COALESCE(amount, 0) INTO current_balance
  FROM credit_balances 
  WHERE client_id = p_client_id 
    AND module_id = p_module_id 
    AND credit_type = 'standard';
    
  -- Check if enough credits
  IF current_balance >= p_credit_amount THEN
    -- Deduct credits
    UPDATE credit_balances 
    SET amount = amount - p_credit_amount,
        updated_at = NOW()
    WHERE client_id = p_client_id 
      AND module_id = p_module_id 
      AND credit_type = 'standard';
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Function to get unique industries
CREATE OR REPLACE FUNCTION public.get_unique_industries()
RETURNS TABLE(industry text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT l.industry
  FROM public.leads l
  WHERE l.industry IS NOT NULL 
    AND l.industry != ''
    AND l.client_id = public.get_current_client_id()
  ORDER BY l.industry;
$$;

-- Function to get unique job titles
CREATE OR REPLACE FUNCTION public.get_unique_job_titles()
RETURNS TABLE(job_title text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT l.job_title
  FROM public.leads l
  WHERE l.job_title IS NOT NULL 
    AND l.job_title != ''
    AND l.client_id = public.get_current_client_id()
  ORDER BY l.job_title;
$$;

-- Update the existing get_unique_tags function to work with client_id
CREATE OR REPLACE FUNCTION public.get_unique_tags()
RETURNS TABLE(tag text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT unnest(l.tags) as tag
  FROM public.leads l
  WHERE l.tags IS NOT NULL 
    AND array_length(l.tags, 1) > 0
    AND l.client_id = public.get_current_client_id()
  ORDER BY tag;
$$;

-- Create contact activities table for tracking interactions
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on contact_activities
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_activities
CREATE POLICY "Users can view their client contact activities" 
  ON public.contact_activities 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.contacts c
    JOIN public.users u ON u.client_id = c.client_id
    WHERE c.id = contact_activities.contact_id
    AND u.id = auth.uid()
  ));

CREATE POLICY "Users can create contact activities for their client" 
  ON public.contact_activities 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contacts c
    JOIN public.users u ON u.client_id = c.client_id
    WHERE c.id = contact_activities.contact_id
    AND u.id = auth.uid()
  ));

-- Add trigger to automatically create client record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.clients (user_id, is_active, plan, admin)
  VALUES (NEW.id, false, 'free', false);
  RETURN NEW;
END;
$$;

-- Create trigger for new user client creation
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_client();

-- Add indexes for the new tables and functions
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_activity_type ON public.contact_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_contact_activities_created_at ON public.contact_activities(created_at);

-- Ensure all existing leads have proper client_id
UPDATE public.leads 
SET client_id = (SELECT id FROM clients WHERE email = 'djoere@scailup.io' LIMIT 1)
WHERE client_id IS NULL;