
-- Check if pg_cron extension is installed and enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check if pg_net extension is installed and enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Check current cron jobs
SELECT * FROM cron.job ORDER BY created_at DESC;

-- Check cron job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
