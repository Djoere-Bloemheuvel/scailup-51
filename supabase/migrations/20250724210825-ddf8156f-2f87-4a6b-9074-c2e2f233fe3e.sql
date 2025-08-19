
-- Check if pg_cron extension is installed and active
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- If pg_cron exists, check if there are any existing cron jobs
SELECT * FROM cron.job WHERE jobname LIKE '%scheduled-task%' OR jobname LIKE '%process-user-tasks%';
