
-- Create campaign_analytics table
CREATE TABLE public.campaign_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  leads_contacted integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_clicked integer DEFAULT 0,
  replies_received integer DEFAULT 0,
  opportunities_created integer DEFAULT 0,
  meetings_booked integer DEFAULT 0,
  bounces integer DEFAULT 0,
  unsubscribes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create email_templates table
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id uuid NOT NULL,
  variant_name text NOT NULL,
  subject_line text,
  email_body text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add full_name column to leads table
ALTER TABLE public.leads ADD COLUMN full_name text;

-- Add RLS policies for campaign_analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client campaign analytics" 
  ON public.campaign_analytics 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM campaigns c
    JOIN users u ON u.client_id = c.client_id
    WHERE c.id = campaign_analytics.campaign_id AND u.id = auth.uid()
  ));

CREATE POLICY "Users can manage their client campaign analytics" 
  ON public.campaign_analytics 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM campaigns c
    JOIN users u ON u.client_id = c.client_id
    WHERE c.id = campaign_analytics.campaign_id AND u.id = auth.uid()
  ));

-- Add RLS policies for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client email templates" 
  ON public.email_templates 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM campaign_sequences cs
    JOIN campaigns c ON c.id = cs.campaign_id
    JOIN users u ON u.client_id = c.client_id
    WHERE cs.id = email_templates.sequence_id AND u.id = auth.uid()
  ));

CREATE POLICY "Users can manage their client email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM campaign_sequences cs
    JOIN campaigns c ON c.id = cs.campaign_id
    JOIN users u ON u.client_id = c.client_id
    WHERE cs.id = email_templates.sequence_id AND u.id = auth.uid()
  ));

-- Add missing columns to campaign_sequences to match the interface
ALTER TABLE public.campaign_sequences ADD COLUMN step_number integer DEFAULT 1;
ALTER TABLE public.campaign_sequences ADD COLUMN step_name text DEFAULT 'Email Step';
ALTER TABLE public.campaign_sequences ADD COLUMN delay_hours integer DEFAULT 0;
ALTER TABLE public.campaign_sequences ADD COLUMN is_active boolean DEFAULT true;

-- Update existing records to have proper step numbers
UPDATE public.campaign_sequences SET step_number = sequence_number WHERE step_number IS NULL;
