
-- Add missing user_id to leads table for RLS
ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing leads to have user_id (you may need to set this manually for existing data)
-- UPDATE public.leads SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads" 
  ON public.leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
  ON public.leads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
  ON public.leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create campaign_leads junction table to track which leads are in campaigns
CREATE TABLE public.campaign_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_sequence', 'completed', 'paused', 'replied', 'bounced', 'unsubscribed')),
  sequence_step INTEGER DEFAULT 1,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  next_email_scheduled_at TIMESTAMP WITH TIME ZONE,
  reply_received_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, lead_id)
);

-- Create campaign_sequences table for email sequences
CREATE TABLE public.campaign_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, step_number)
);

-- Create email_templates table for storing email content
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES public.campaign_sequences(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL DEFAULT 'Variant 1',
  subject_line TEXT,
  email_body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_analytics table for storing campaign statistics
CREATE TABLE public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_contacted INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  replies_received INTEGER DEFAULT 0,
  opportunities_created INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Create email_events table for tracking individual email interactions
CREATE TABLE public.email_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_lead_id UUID REFERENCES public.campaign_leads(id) ON DELETE CASCADE NOT NULL,
  sequence_step INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed')),
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_subject TEXT,
  user_agent TEXT,
  ip_address INET,
  link_url TEXT,
  bounce_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to all new tables
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_leads
CREATE POLICY "Users can view their campaign leads" 
  ON public.campaign_leads 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their campaign leads" 
  ON public.campaign_leads 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their campaign leads" 
  ON public.campaign_leads 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their campaign leads" 
  ON public.campaign_leads 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

-- RLS policies for campaign_sequences
CREATE POLICY "Users can manage their campaign sequences" 
  ON public.campaign_sequences 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_sequences.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

-- RLS policies for email_templates
CREATE POLICY "Users can manage their email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    JOIN public.campaign_sequences ON campaigns.id = campaign_sequences.campaign_id
    WHERE campaign_sequences.id = email_templates.sequence_id 
    AND campaigns.user_id = auth.uid()
  ));

-- RLS policies for campaign_analytics
CREATE POLICY "Users can view their campaign analytics" 
  ON public.campaign_analytics 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_analytics.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their campaign analytics" 
  ON public.campaign_analytics 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_analytics.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their campaign analytics" 
  ON public.campaign_analytics 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_analytics.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

-- RLS policies for email_events
CREATE POLICY "Users can view their email events" 
  ON public.email_events 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    JOIN public.campaign_leads ON campaigns.id = campaign_leads.campaign_id
    WHERE campaign_leads.id = email_events.campaign_lead_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert email events" 
  ON public.email_events 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns 
    JOIN public.campaign_leads ON campaigns.id = campaign_leads.campaign_id
    WHERE campaign_leads.id = email_events.campaign_lead_id 
    AND campaigns.user_id = auth.uid()
  ));

-- Add indexes for performance
CREATE INDEX idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON public.campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_status ON public.campaign_leads(status);
CREATE INDEX idx_campaign_sequences_campaign_id ON public.campaign_sequences(campaign_id);
CREATE INDEX idx_email_templates_sequence_id ON public.email_templates(sequence_id);
CREATE INDEX idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON public.campaign_analytics(date);
CREATE INDEX idx_email_events_campaign_lead_id ON public.email_events(campaign_lead_id);
CREATE INDEX idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_timestamp ON public.email_events(event_timestamp);
CREATE INDEX idx_leads_user_id ON public.leads(user_id);

-- Function to update campaign analytics
CREATE OR REPLACE FUNCTION public.update_campaign_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign_id UUID;
  v_date DATE;
BEGIN
  -- Get campaign_id from campaign_leads
  SELECT campaign_id INTO v_campaign_id
  FROM public.campaign_leads
  WHERE id = COALESCE(NEW.campaign_lead_id, OLD.campaign_lead_id);
  
  v_date := CURRENT_DATE;
  
  -- Insert or update analytics record
  INSERT INTO public.campaign_analytics (campaign_id, date)
  VALUES (v_campaign_id, v_date)
  ON CONFLICT (campaign_id, date) DO NOTHING;
  
  -- Update counts based on event type
  IF NEW.event_type = 'sent' THEN
    UPDATE public.campaign_analytics 
    SET emails_sent = emails_sent + 1, updated_at = now()
    WHERE campaign_id = v_campaign_id AND date = v_date;
  ELSIF NEW.event_type = 'opened' THEN
    UPDATE public.campaign_analytics 
    SET emails_opened = emails_opened + 1, updated_at = now()
    WHERE campaign_id = v_campaign_id AND date = v_date;
  ELSIF NEW.event_type = 'clicked' THEN
    UPDATE public.campaign_analytics 
    SET emails_clicked = emails_clicked + 1, updated_at = now()
    WHERE campaign_id = v_campaign_id AND date = v_date;
  ELSIF NEW.event_type = 'replied' THEN
    UPDATE public.campaign_analytics 
    SET replies_received = replies_received + 1, updated_at = now()
    WHERE campaign_id = v_campaign_id AND date = v_date;
  ELSIF NEW.event_type = 'bounced' THEN
    UPDATE public.campaign_analytics 
    SET bounces = bounces + 1, updated_at = now()
    WHERE campaign_id = v_campaign_id AND date = v_date;
  ELSIF NEW.event_type = 'unsubscribed' THEN
    UPDATE public.campaign_analytics 
    SET unsubscribes = unsubscribes + 1, updated_at = now()
    WHERE campaign_id = v_campaign_id AND date = v_date;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically update analytics when email events are inserted
CREATE TRIGGER update_campaign_analytics_trigger
  AFTER INSERT ON public.email_events
  FOR EACH ROW EXECUTE PROCEDURE public.update_campaign_analytics();
