-- Add remaining missing components to complete database restoration

-- Create modules table that was referenced in logs
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default modules
INSERT INTO public.modules (name, description) VALUES
  ('SARAH_AI', 'AI Sales Agent Module'),
  ('LEAD_DATABASE', 'Lead Database Management'),
  ('CAMPAIGNS', 'Campaign Management'),
  ('ANALYTICS', 'Analytics and Reporting'),
  ('INTEGRATIONS', 'Third-party Integrations')
ON CONFLICT (name) DO NOTHING;

-- Create campaign_leads table for lead-campaign relationships
CREATE TABLE IF NOT EXISTS public.campaign_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(campaign_id, lead_id)
);

-- Create campaign_sequences table
CREATE TABLE IF NOT EXISTS public.campaign_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  sequence_number INTEGER NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  delay_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_sequences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for modules (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view modules" 
  ON public.modules 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create RLS policies for campaign_leads
CREATE POLICY "Users can view their client campaign leads" 
  ON public.campaign_leads 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.users u ON u.client_id = c.client_id
    WHERE c.id = campaign_leads.campaign_id
    AND u.id = auth.uid()
  ));

CREATE POLICY "Users can manage their client campaign leads" 
  ON public.campaign_leads 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.users u ON u.client_id = c.client_id
    WHERE c.id = campaign_leads.campaign_id
    AND u.id = auth.uid()
  ));

-- Create RLS policies for campaign_sequences
CREATE POLICY "Users can view their client campaign sequences" 
  ON public.campaign_sequences 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.users u ON u.client_id = c.client_id
    WHERE c.id = campaign_sequences.campaign_id
    AND u.id = auth.uid()
  ));

CREATE POLICY "Users can manage their client campaign sequences" 
  ON public.campaign_sequences 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.users u ON u.client_id = c.client_id
    WHERE c.id = campaign_sequences.campaign_id
    AND u.id = auth.uid()
  ));

-- Add more missing columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_count INTEGER DEFAULT 0;

-- Add webhook policies
CREATE POLICY "Users can view their client webhooks" 
  ON public.webhook_configs 
  FOR SELECT 
  USING (client_id = public.get_current_client_id());

CREATE POLICY "Users can manage their client webhooks" 
  ON public.webhook_configs 
  FOR ALL
  USING (client_id = public.get_current_client_id());

-- Add more indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_id ON public.campaign_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequences_campaign_id ON public.campaign_sequences(campaign_id);

-- Create bulk conversion function
CREATE OR REPLACE FUNCTION public.bulk_convert_leads_to_contacts(
  p_lead_ids UUID[],
  p_client_id UUID DEFAULT NULL
)
RETURNS TABLE(
  lead_id UUID,
  contact_id UUID,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_lead_id UUID;
  v_contact_id UUID;
  v_lead RECORD;
BEGIN
  -- Get client ID if not provided
  IF p_client_id IS NULL THEN
    SELECT get_current_client_id() INTO v_client_id;
  ELSE
    v_client_id := p_client_id;
  END IF;
  
  -- Process each lead
  FOREACH v_lead_id IN ARRAY p_lead_ids
  LOOP
    BEGIN
      -- Check if contact already exists
      IF EXISTS (
        SELECT 1 FROM contacts 
        WHERE lead_id = v_lead_id AND client_id = v_client_id
      ) THEN
        RETURN QUERY SELECT v_lead_id, NULL::UUID, false, 'Contact already exists for this lead';
        CONTINUE;
      END IF;
      
      -- Get lead data
      SELECT * INTO v_lead FROM leads WHERE id = v_lead_id;
      
      IF NOT FOUND THEN
        RETURN QUERY SELECT v_lead_id, NULL::UUID, false, 'Lead not found';
        CONTINUE;
      END IF;
      
      -- Create contact
      INSERT INTO contacts (
        client_id,
        lead_id,
        email,
        first_name,
        last_name,
        company,
        job_title,
        status
      ) VALUES (
        v_client_id,
        v_lead_id,
        v_lead.email,
        v_lead.first_name,
        v_lead.last_name,
        v_lead.company,
        v_lead.job_title,
        'enriching'
      ) RETURNING id INTO v_contact_id;
      
      RETURN QUERY SELECT v_lead_id, v_contact_id, true, NULL::TEXT;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT v_lead_id, NULL::UUID, false, SQLERRM;
    END;
  END LOOP;
END;
$$;