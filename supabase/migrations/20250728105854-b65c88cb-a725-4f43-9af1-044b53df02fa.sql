
-- Create campaign_contacts table if it doesn't exist (junction table for campaigns and contacts)
CREATE TABLE IF NOT EXISTS public.campaign_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);

-- Enable RLS on campaign_contacts
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_contacts
CREATE POLICY "Users can view campaign_contacts from their client campaigns"
ON public.campaign_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() AND c.id = campaign_contacts.campaign_id
  )
);

CREATE POLICY "Users can insert campaign_contacts for their client campaigns"
ON public.campaign_contacts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns c 
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() AND c.id = campaign_contacts.campaign_id
  )
);

CREATE POLICY "Users can update campaign_contacts from their client campaigns"
ON public.campaign_contacts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() AND c.id = campaign_contacts.campaign_id
  )
);

CREATE POLICY "Users can delete campaign_contacts from their client campaigns"
ON public.campaign_contacts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    JOIN client_users cu ON cu.client_id = c.client_id
    WHERE cu.user_id = auth.uid() AND c.id = campaign_contacts.campaign_id
  )
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_campaign_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_contacts_updated_at
  BEFORE UPDATE ON public.campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_contacts_updated_at();
