-- Fix Leads Credits Linking Migration
-- This migration ensures that leads database credits are properly linked to 'leads' credit type
-- while maintaining full Lovable compatibility

-- 1. Update the check_and_use_credits function to handle leads credits properly
CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  client_id UUID;
  available_credits INTEGER;
  module_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get module_id for lead_engine
  SELECT id INTO module_id
  FROM modules
  WHERE slug = 'lead_engine'
  LIMIT 1;
  
  IF module_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check available credits
  SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
  FROM credit_balances cb
  WHERE cb.client_id = check_and_use_credits.client_id
    AND cb.credit_type = check_and_use_credits.credit_type
    AND cb.module_id = module_id
    AND cb.expires_at > NOW();
  
  -- If enough credits, use them
  IF available_credits >= amount THEN
    -- Deduct credits from the oldest balance first (FIFO)
    UPDATE credit_balances SET
      amount = amount - check_and_use_credits.amount,
      updated_at = NOW()
    WHERE client_id = check_and_use_credits.client_id
      AND credit_type = check_and_use_credits.credit_type
      AND module_id = module_id
      AND expires_at > NOW()
      AND amount >= check_and_use_credits.amount
    ORDER BY expires_at ASC
    LIMIT 1;
    
    -- Log usage
    INSERT INTO credit_usage_logs (client_id, module_id, credit_type, amount, description)
    VALUES (client_id, module_id, credit_type, amount, description);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the convert_lead_to_contact function to use 'leads' credits instead of 'contact_conversion'
CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  contact_id UUID;
  client_id UUID;
  credit_check BOOLEAN;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check if we have enough leads credits (1 credit per conversion)
  credit_check := check_and_use_credits('leads', 1, 'Lead to contact conversion');
  
  IF NOT credit_check THEN
    RAISE EXCEPTION 'Insufficient leads credits for conversion';
  END IF;
  
  -- Create contact record
  INSERT INTO contacts (lead_id, client_id, notes)
  VALUES (lead_id, client_id, notes)
  RETURNING id INTO contact_id;
  
  -- Update lead status if the column exists
  BEGIN
    UPDATE leads SET
      contact_status = 'contact',
      contact_date = NOW(),
      updated_at = NOW()
    WHERE id = lead_id;
  EXCEPTION WHEN undefined_column THEN
    -- Column doesn't exist yet, skip the update
    NULL;
  END;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to get leads credits balance
CREATE OR REPLACE FUNCTION get_leads_credits_balance()
RETURNS TABLE(available_credits INTEGER, total_credits INTEGER) AS $$
DECLARE
  client_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;
  
  -- Return available and total leads credits
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN cb.expires_at > NOW() THEN cb.amount ELSE 0 END), 0) as available_credits,
    COALESCE(SUM(cb.amount), 0) as total_credits
  FROM credit_balances cb
  JOIN modules m ON cb.module_id = m.id
  WHERE cb.client_id = get_leads_credits_balance.client_id
    AND cb.credit_type = 'leads'
    AND m.slug = 'lead_engine';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a function to get credit usage history for leads
CREATE OR REPLACE FUNCTION get_leads_credit_usage_history(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  id UUID,
  credit_type TEXT,
  amount INTEGER,
  description TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  client_id UUID;
BEGIN
  -- Get client_id for current user
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return leads credit usage history
  RETURN QUERY
  SELECT 
    cul.id,
    cul.credit_type,
    cul.amount,
    cul.description,
    cul.used_at,
    cul.created_at
  FROM credit_usage_logs cul
  JOIN modules m ON cul.module_id = m.id
  WHERE cul.client_id = get_leads_credit_usage_history.client_id
    AND cul.credit_type = 'leads'
    AND m.slug = 'lead_engine'
  ORDER BY cul.used_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure default leads credits exist for existing clients
INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
SELECT 
  c.id,
  m.id,
  'leads',
  100, -- Default 100 leads credits
  NOW() + INTERVAL '3 months',
  NOW(),
  NOW()
FROM clients c
CROSS JOIN modules m
WHERE m.slug = 'lead_engine'
  AND NOT EXISTS (
    SELECT 1 FROM credit_balances cb 
    WHERE cb.client_id = c.id 
      AND cb.module_id = m.id 
      AND cb.credit_type = 'leads'
  );

-- 6. Create a function to add leads credits to a client
CREATE OR REPLACE FUNCTION add_leads_credits(
  target_client_id UUID,
  amount INTEGER,
  expires_in_months INTEGER DEFAULT 3,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  module_id UUID;
BEGIN
  -- Get lead_engine module id
  SELECT id INTO module_id
  FROM modules
  WHERE slug = 'lead_engine'
  LIMIT 1;
  
  IF module_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Add leads credits
  INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
  VALUES (target_client_id, module_id, 'leads', amount, NOW() + (expires_in_months || ' months')::INTERVAL, NOW(), NOW());
  
  -- Log the credit addition
  INSERT INTO credit_usage_logs (client_id, module_id, credit_type, amount, description, used_at, created_at)
  VALUES (target_client_id, module_id, 'leads', amount, COALESCE(description, 'Credits added manually'), NOW(), NOW());
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_balances_leads_type ON credit_balances(credit_type) WHERE credit_type = 'leads';
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_leads_type ON credit_usage_logs(credit_type) WHERE credit_type = 'leads';

-- 8. Create a view for easy leads credits monitoring
CREATE OR REPLACE VIEW leads_credits_overview AS
SELECT 
  c.id as client_id,
  c.company_name,
  c.email,
  COALESCE(SUM(CASE WHEN cb.expires_at > NOW() THEN cb.amount ELSE 0 END), 0) as available_leads_credits,
  COALESCE(SUM(cb.amount), 0) as total_leads_credits,
  COUNT(DISTINCT cb.id) as credit_balance_count,
  MAX(cb.expires_at) as latest_expiry
FROM clients c
LEFT JOIN credit_balances cb ON c.id = cb.client_id
LEFT JOIN modules m ON cb.module_id = m.id
WHERE m.slug = 'lead_engine' AND cb.credit_type = 'leads'
GROUP BY c.id, c.company_name, c.email;

-- 9. Grant permissions for the view
GRANT SELECT ON leads_credits_overview TO authenticated;

-- 10. Create RLS policy for the view
CREATE POLICY "Users can view their own leads credits overview" ON leads_credits_overview
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN users u ON c.id = u.client_id 
      WHERE u.id = auth.uid()
    )
  ); 