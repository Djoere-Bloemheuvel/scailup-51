
-- Create a cron job that runs the scheduled-task-processor function every minute
SELECT cron.schedule(
  'process-pending-user-tasks',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/scheduled-task-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZueW9reGhzZ2V0c2xmb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDkyMzAsImV4cCI6MjA2ODc4NTIzMH0.JfKTaGgOI4X839BX2tYBfjrJttOltGm7wlfcCkZJhkA"}'::jsonb,
        body:='{"scheduled": true, "source": "cron", "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Also create a test cron job that runs every 5 minutes for monitoring
SELECT cron.schedule(
  'test-cron-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/test-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZueW9reGhzZ2V0c2xmb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDkyMzAsImV4cCI6MjA2ODc4NTIzMH0.JfKTaGgOI4X839BX2tYBfjrJttOltGm7wlfcCkZJhkA"}'::jsonb,
        body:='{"test": true, "source": "cron", "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Check that the cron jobs were created successfully
SELECT jobname, schedule, active FROM cron.job ORDER BY created_at DESC;
