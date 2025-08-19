
-- Herstel de originele datatypes voor de leads tabel
ALTER TABLE public.leads 
ALTER COLUMN id SET DATA TYPE UUID USING id::UUID,
ALTER COLUMN client_id SET DATA TYPE UUID USING client_id::UUID,
ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::UUID,
ALTER COLUMN employee_count SET DATA TYPE INTEGER USING CASE 
  WHEN employee_count ~ '^[0-9]+$' THEN employee_count::INTEGER 
  ELSE NULL 
END,
ALTER COLUMN employee_number SET DATA TYPE INTEGER USING CASE 
  WHEN employee_number ~ '^[0-9]+$' THEN employee_number::INTEGER 
  ELSE NULL 
END,
ALTER COLUMN lead_score SET DATA TYPE INTEGER USING CASE 
  WHEN lead_score ~ '^[0-9]+$' THEN lead_score::INTEGER 
  ELSE 0 
END,
ALTER COLUMN buying_intent_score SET DATA TYPE INTEGER USING CASE 
  WHEN buying_intent_score ~ '^[0-9]+$' THEN buying_intent_score::INTEGER 
  ELSE 0 
END,
ALTER COLUMN product_match_percentage SET DATA TYPE INTEGER USING CASE 
  WHEN product_match_percentage ~ '^[0-9]+$' THEN product_match_percentage::INTEGER 
  ELSE 0 
END,
ALTER COLUMN tags SET DATA TYPE TEXT[] USING CASE 
  WHEN tags IS NOT NULL AND tags != '' THEN string_to_array(tags, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN technologies SET DATA TYPE TEXT[] USING CASE 
  WHEN technologies IS NOT NULL AND technologies != '' THEN string_to_array(technologies, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN company_tags SET DATA TYPE TEXT[] USING CASE 
  WHEN company_tags IS NOT NULL AND company_tags != '' THEN string_to_array(company_tags, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN match_reasons SET DATA TYPE TEXT[] USING CASE 
  WHEN match_reasons IS NOT NULL AND match_reasons != '' THEN string_to_array(match_reasons, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN unique_angles SET DATA TYPE TEXT[] USING CASE 
  WHEN unique_angles IS NOT NULL AND unique_angles != '' THEN string_to_array(unique_angles, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN campaign_ids SET DATA TYPE UUID[] USING CASE 
  WHEN campaign_ids IS NOT NULL AND campaign_ids != '' THEN 
    (string_to_array(campaign_ids, ','))::UUID[]
  ELSE NULL
END,
ALTER COLUMN tags_normalized SET DATA TYPE TEXT[] USING CASE 
  WHEN tags_normalized IS NOT NULL AND tags_normalized != '' THEN string_to_array(tags_normalized, ',')
  ELSE NULL
END,
ALTER COLUMN in_active_campaign SET DATA TYPE BOOLEAN USING CASE 
  WHEN in_active_campaign IN ('true', 't', '1') THEN true
  WHEN in_active_campaign IN ('false', 'f', '0') THEN false
  ELSE false
END,
ALTER COLUMN is_duplicate SET DATA TYPE BOOLEAN USING CASE 
  WHEN is_duplicate IN ('true', 't', '1') THEN true
  WHEN is_duplicate IN ('false', 'f', '0') THEN false
  ELSE false
END,
ALTER COLUMN created_at SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN created_at::TIMESTAMP WITH TIME ZONE
  ELSE NOW()
END,
ALTER COLUMN updated_at SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN updated_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN updated_at::TIMESTAMP WITH TIME ZONE
  ELSE NOW()
END,
ALTER COLUMN last_contacted SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN last_contacted ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN last_contacted::TIMESTAMP WITH TIME ZONE
  ELSE NULL
END;

-- Herstel de originele datatypes voor de contacts tabel
ALTER TABLE public.contacts 
ALTER COLUMN id SET DATA TYPE UUID USING id::UUID,
ALTER COLUMN client_id SET DATA TYPE UUID USING client_id::UUID,
ALTER COLUMN lead_id SET DATA TYPE UUID USING CASE 
  WHEN lead_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN lead_id::UUID
  ELSE NULL
END,
ALTER COLUMN employee_count SET DATA TYPE INTEGER USING CASE 
  WHEN employee_count ~ '^[0-9]+$' THEN employee_count::INTEGER 
  ELSE NULL 
END,
ALTER COLUMN lead_score SET DATA TYPE INTEGER USING CASE 
  WHEN lead_score ~ '^[0-9]+$' THEN lead_score::INTEGER 
  ELSE 0 
END,
ALTER COLUMN buying_intent_score SET DATA TYPE INTEGER USING CASE 
  WHEN buying_intent_score ~ '^[0-9]+$' THEN buying_intent_score::INTEGER 
  ELSE 0 
END,
ALTER COLUMN tags SET DATA TYPE TEXT[] USING CASE 
  WHEN tags IS NOT NULL AND tags != '' THEN string_to_array(tags, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN technologies SET DATA TYPE TEXT[] USING CASE 
  WHEN technologies IS NOT NULL AND technologies != '' THEN string_to_array(technologies, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN company_tags SET DATA TYPE TEXT[] USING CASE 
  WHEN company_tags IS NOT NULL AND company_tags != '' THEN string_to_array(company_tags, ',')
  ELSE '{}'::TEXT[]
END,
ALTER COLUMN campaign_ids SET DATA TYPE UUID[] USING CASE 
  WHEN campaign_ids IS NOT NULL AND campaign_ids != '' THEN 
    (string_to_array(campaign_ids, ','))::UUID[]
  ELSE NULL
END,
ALTER COLUMN in_active_campaign SET DATA TYPE BOOLEAN USING CASE 
  WHEN in_active_campaign IN ('true', 't', '1') THEN true
  WHEN in_active_campaign IN ('false', 'f', '0') THEN false
  ELSE false
END,
ALTER COLUMN is_duplicate SET DATA TYPE BOOLEAN USING CASE 
  WHEN is_duplicate IN ('true', 't', '1') THEN true
  WHEN is_duplicate IN ('false', 'f', '0') THEN false
  ELSE false
END,
ALTER COLUMN created_at SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN created_at::TIMESTAMP WITH TIME ZONE
  ELSE NOW()
END,
ALTER COLUMN updated_at SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN updated_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN updated_at::TIMESTAMP WITH TIME ZONE
  ELSE NOW()
END,
ALTER COLUMN last_contacted SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN last_contacted ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN last_contacted::TIMESTAMP WITH TIME ZONE
  ELSE NULL
END,
ALTER COLUMN contact_date SET DATA TYPE TIMESTAMP WITH TIME ZONE USING CASE 
  WHEN contact_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN contact_date::TIMESTAMP WITH TIME ZONE
  ELSE NOW()
END;

-- Herstel de defaults voor belangrijke kolommen
ALTER TABLE public.leads 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN lead_score SET DEFAULT 0,
ALTER COLUMN buying_intent_score SET DEFAULT 0,
ALTER COLUMN product_match_percentage SET DEFAULT 0,
ALTER COLUMN tags SET DEFAULT '{}',
ALTER COLUMN technologies SET DEFAULT '{}',
ALTER COLUMN company_tags SET DEFAULT '{}',
ALTER COLUMN match_reasons SET DEFAULT '{}',
ALTER COLUMN unique_angles SET DEFAULT '{}',
ALTER COLUMN in_active_campaign SET DEFAULT false,
ALTER COLUMN is_duplicate SET DEFAULT false,
ALTER COLUMN enrichment_status SET DEFAULT 'pending',
ALTER COLUMN contact_status SET DEFAULT 'new',
ALTER COLUMN source SET DEFAULT 'manual',
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.contacts 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN lead_score SET DEFAULT 0,
ALTER COLUMN buying_intent_score SET DEFAULT 0,
ALTER COLUMN tags SET DEFAULT '{}',
ALTER COLUMN technologies SET DEFAULT '{}',
ALTER COLUMN company_tags SET DEFAULT '{}',
ALTER COLUMN in_active_campaign SET DEFAULT false,
ALTER COLUMN is_duplicate SET DEFAULT false,
ALTER COLUMN enrichment_status SET DEFAULT 'pending',
ALTER COLUMN contact_status SET DEFAULT 'new',
ALTER COLUMN email_status SET DEFAULT 'unknown',
ALTER COLUMN status SET DEFAULT 'enriching',
ALTER COLUMN contact_date SET DEFAULT now(),
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();
