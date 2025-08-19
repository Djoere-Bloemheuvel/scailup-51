
-- Create module_pricing table for Stripe integration and cart functionality
CREATE TABLE public.module_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  monthly_price INTEGER NOT NULL, -- price in cents
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  value_proposition TEXT[],
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  requires_lead_engine BOOLEAN NOT NULL DEFAULT false,
  is_standalone BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on module_pricing
ALTER TABLE public.module_pricing ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read module pricing
CREATE POLICY "All users can read module pricing" ON public.module_pricing
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow admins to manage module pricing
CREATE POLICY "Admins can manage module pricing" ON public.module_pricing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND revoked_at IS NULL
    )
  );

-- Insert sample data for the existing modules
INSERT INTO public.module_pricing (
  module_slug, module_name, monthly_price, description, value_proposition,
  requires_lead_engine, is_standalone
) VALUES 
('start-lead-engine', 'Start Your Lead Engine', 9900, 'Entry-level lead generation package', 
  ARRAY['500 lead credits per month', '2000 email credits per month', '25 LinkedIn credits per week'], 
  false, true),
('grow-lead-engine', 'Grow Your Lead Engine', 19900, 'Enhanced lead generation package', 
  ARRAY['1000 lead credits per month', '4000 email credits per month', '50 LinkedIn credits per week'], 
  false, true),
('scale-lead-engine', 'Scale Your Lead Engine', 49900, 'Professional lead generation package', 
  ARRAY['2500 lead credits per month', '10000 email credits per month', '100 LinkedIn credits per week'], 
  false, true),
('dominate-lead-engine', 'Dominate Your Lead Engine', 99900, 'Enterprise lead generation package', 
  ARRAY['5000 lead credits per month', '20000 email credits per month', '100 LinkedIn credits per week'], 
  false, true),
('marketing-engine', 'Marketing Engine Add-on', 14900, 'Advanced marketing automation', 
  ARRAY['Automated email campaigns', 'Social media management', 'Analytics and reporting'], 
  true, false),
('sales-engine', 'Sales Engine Add-on', 19900, 'AI-powered sales automation', 
  ARRAY['AI sales assistant', 'Pipeline management', 'Performance analytics'], 
  true, false);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_module_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_module_pricing_updated_at
  BEFORE UPDATE ON public.module_pricing
  FOR EACH ROW EXECUTE FUNCTION update_module_pricing_updated_at();
