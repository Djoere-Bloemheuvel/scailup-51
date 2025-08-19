-- Migration: Fix Conversion Functions for Frontend Compatibility
-- This migration ensures all conversion functions work properly with the frontend
-- while maintaining full Lovable compatibility

-- Drop and recreate the convert_lead_to_contact function with better error handling
DROP FUNCTION IF EXISTS convert_lead_to_contact(UUID, TEXT);

CREATE OR REPLACE FUNCTION convert_lead_to_contact(
  lead_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
  contact_id UUID;
  lead_data RECORD;
  existing_contact RECORD;
BEGIN
  -- Get current user's client
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Get lead data
  SELECT * INTO lead_data
  FROM leads
  WHERE id = lead_id AND user_id = auth.uid();
  
  IF lead_data IS NULL THEN
    RAISE EXCEPTION 'Lead not found or access denied';
  END IF;
  
  -- Check if contact already exists
  SELECT * INTO existing_contact
  FROM contacts
  WHERE lead_id = lead_id AND client_id = client_id;
  
  IF existing_contact IS NOT NULL THEN
    RAISE EXCEPTION 'Contact already exists for this lead';
  END IF;
  
  -- Check and use credits
  PERFORM check_and_use_credits('leads', 1, 'Lead to contact conversion');
  
  -- Create contact
  INSERT INTO contacts (
    lead_id,
    client_id,
    contact_date,
    notes,
    status,
    created_at,
    updated_at
  ) VALUES (
    lead_id,
    client_id,
    NOW(),
    notes,
    'active',
    NOW(),
    NOW()
  ) RETURNING id INTO contact_id;
  
  -- Update lead status to indicate it's been converted
  UPDATE leads
  SET contact_status = 'converted',
      contact_date = NOW(),
      updated_at = NOW()
  WHERE id = lead_id;
  
  RETURN contact_id;
END;
$$;

-- Drop and recreate the bulk_convert_leads_to_contacts function
DROP FUNCTION IF EXISTS bulk_convert_leads_to_contacts(UUID[], TEXT);

CREATE OR REPLACE FUNCTION bulk_convert_leads_to_contacts(
  lead_ids UUID[],
  notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
  lead_id UUID;
  contact_id UUID;
  converted_count INTEGER := 0;
  failed_count INTEGER := 0;
  results JSONB := '[]'::JSONB;
  lead_data RECORD;
  existing_contact RECORD;
BEGIN
  -- Get current user's client
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check and use credits for all conversions
  PERFORM check_and_use_credits('leads', array_length(lead_ids, 1), 'Bulk lead to contact conversion');
  
  -- Process each lead
  FOREACH lead_id IN ARRAY lead_ids
  LOOP
    BEGIN
      -- Get lead data
      SELECT * INTO lead_data
      FROM leads
      WHERE id = lead_id AND user_id = auth.uid();
      
      IF lead_data IS NULL THEN
        -- Lead not found or access denied
        failed_count := failed_count + 1;
        results := results || jsonb_build_object(
          'lead_id', lead_id,
          'success', false,
          'error', 'Lead not found or access denied'
        );
        CONTINUE;
      END IF;
      
      -- Check if contact already exists
      SELECT * INTO existing_contact
      FROM contacts
      WHERE lead_id = lead_id AND client_id = client_id;
      
      IF existing_contact IS NOT NULL THEN
        -- Contact already exists
        failed_count := failed_count + 1;
        results := results || jsonb_build_object(
          'lead_id', lead_id,
          'success', false,
          'error', 'Contact already exists for this lead'
        );
        CONTINUE;
      END IF;
      
      -- Create contact
      INSERT INTO contacts (
        lead_id,
        client_id,
        contact_date,
        notes,
        status,
        created_at,
        updated_at
      ) VALUES (
        lead_id,
        client_id,
        NOW(),
        notes,
        'active',
        NOW(),
        NOW()
      ) RETURNING id INTO contact_id;
      
      -- Update lead status
      UPDATE leads
      SET contact_status = 'converted',
          contact_date = NOW(),
          updated_at = NOW()
      WHERE id = lead_id;
      
      -- Success
      converted_count := converted_count + 1;
      results := results || jsonb_build_object(
        'lead_id', lead_id,
        'contact_id', contact_id,
        'success', true
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Handle any other errors
      failed_count := failed_count + 1;
      results := results || jsonb_build_object(
        'lead_id', lead_id,
        'success', false,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  -- Return summary
  RETURN jsonb_build_object(
    'converted_count', converted_count,
    'failed_count', failed_count,
    'total_count', array_length(lead_ids, 1),
    'results', results
  );
END;
$$;

-- Drop and recreate the get_contacts_with_lead_data function
DROP FUNCTION IF EXISTS get_contacts_with_lead_data();

CREATE OR REPLACE FUNCTION get_contacts_with_lead_data()
RETURNS TABLE(
  id UUID,
  lead_id UUID,
  client_id UUID,
  contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  -- Lead data
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_email TEXT,
  lead_company_name TEXT,
  lead_job_title TEXT,
  lead_industry TEXT,
  lead_country TEXT,
  lead_company_summary TEXT,
  lead_product_match_percentage INTEGER,
  lead_match_reasons TEXT[],
  lead_unique_angles TEXT[],
  lead_best_campaign_match TEXT,
  lead_personalized_icebreaker TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.lead_id,
    c.client_id,
    c.contact_date,
    c.notes,
    c.status,
    c.created_at,
    c.updated_at,
    -- Lead data
    l.first_name,
    l.last_name,
    l.email,
    l.company_name,
    l.job_title,
    l.industry,
    l.country,
    l.company_summary,
    l.product_match_percentage,
    l.match_reasons,
    l.unique_angles,
    l.best_campaign_match,
    l.personalized_icebreaker
  FROM contacts c
  JOIN leads l ON c.lead_id = l.id
  WHERE c.client_id IN (
    SELECT c2.id FROM clients c2 
    JOIN users u ON c2.id = u.client_id 
    WHERE u.id = auth.uid()
  )
  ORDER BY c.contact_date DESC;
END;
$$;

-- Drop and recreate the check_and_use_credits function
DROP FUNCTION IF EXISTS check_and_use_credits(TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION check_and_use_credits(
  credit_type TEXT,
  amount INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_id UUID;
  available_credits INTEGER := 0;
  credit_balance RECORD;
  remaining_amount INTEGER;
BEGIN
  -- Get current user's client
  SELECT c.id INTO client_id
  FROM clients c
  JOIN users u ON c.id = u.client_id
  WHERE u.id = auth.uid();
  
  IF client_id IS NULL THEN
    RAISE EXCEPTION 'Client not found for user';
  END IF;
  
  -- Check available credits
  SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
  FROM credit_balances cb
  WHERE cb.client_id = client_id
    AND cb.credit_type = check_and_use_credits.credit_type
    AND cb.expires_at > NOW()
    AND cb.amount > 0;
  
  -- Check if enough credits are available
  IF available_credits < amount THEN
    RAISE EXCEPTION 'Insufficient credits: % available, % required', available_credits, amount;
  END IF;
  
  -- Use credits (deduct from balances)
  remaining_amount := amount;
  
  FOR credit_balance IN
    SELECT cb.id, cb.amount
    FROM credit_balances cb
    WHERE cb.client_id = client_id
      AND cb.credit_type = check_and_use_credits.credit_type
      AND cb.expires_at > NOW()
      AND cb.amount > 0
    ORDER BY cb.expires_at ASC
  LOOP
    IF remaining_amount <= 0 THEN
      EXIT;
    END IF;
    
    IF credit_balance.amount >= remaining_amount THEN
      -- This balance has enough credits
      UPDATE credit_balances
      SET amount = amount - remaining_amount
      WHERE id = credit_balance.id;
      remaining_amount := 0;
    ELSE
      -- Use all credits from this balance
      UPDATE credit_balances
      SET amount = 0
      WHERE id = credit_balance.id;
      remaining_amount := remaining_amount - credit_balance.amount;
    END IF;
  END LOOP;
  
  -- Log the credit usage
  INSERT INTO credit_usage_logs (
    client_id,
    module_id,
    credit_type,
    amount,
    description,
    used_at
  )
  SELECT 
    client_id,
    m.id,
    check_and_use_credits.credit_type,
    check_and_use_credits.amount,
    check_and_use_credits.description,
    NOW()
  FROM modules m
  WHERE m.slug = 'lead_engine'
  LIMIT 1;
  
  RETURN TRUE;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON leads(contact_status);
CREATE INDEX IF NOT EXISTS idx_credit_balances_client_type ON credit_balances(client_id, credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_client_type ON credit_usage_logs(client_id, credit_type);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION convert_lead_to_contact(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_convert_leads_to_contacts(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contacts_with_lead_data() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_use_credits(TEXT, INTEGER, TEXT) TO authenticated; 