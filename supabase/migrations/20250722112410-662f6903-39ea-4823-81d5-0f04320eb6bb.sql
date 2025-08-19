
-- DEEL 2/10: Ontbrekende kolommen toevoegen aan bestaande tabellen

-- 1. Add ALL missing columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS company_summary TEXT,
ADD COLUMN IF NOT EXISTS product_match_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS match_reasons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unique_angles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_campaign_match TEXT,
ADD COLUMN IF NOT EXISTS personalized_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add missing business columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- 3. Ensure webhook_configs has headers column
ALTER TABLE public.webhook_configs 
ADD COLUMN IF NOT EXISTS headers JSONB DEFAULT '{"Content-Type": "application/json"}';

-- 4. Add missing columns to contacts table (to match leads structure)
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS management_level TEXT,
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS buying_intent_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS in_active_campaign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_ids UUID[],
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'unknown';
