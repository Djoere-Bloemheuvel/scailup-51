
-- DEEL 1/10: Ontbrekende core tabellen voor webhooks en credit tracking

-- 1. Create webhook_executions table (was missing)
CREATE TABLE IF NOT EXISTS public.webhook_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  webhook_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create credit_usage_logs table (was missing)
CREATE TABLE IF NOT EXISTS public.credit_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Enable RLS on new tables
ALTER TABLE public.webhook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_logs ENABLE ROW LEVEL SECURITY;
