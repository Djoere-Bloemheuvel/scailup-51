
-- Enable pg_cron and pg_net extensions for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- DISABLED: We're using direct triggers instead of task queue
-- Create a cron job to run the process-user-tasks function every minute
-- This will call the scheduled-task-processor which in turn calls process-user-tasks
-- SELECT cron.schedule(
--   'process-pending-user-tasks',
--   '* * * * *', -- every minute
--   $$
--   SELECT
--     net.http_post(
--         url:='https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/scheduled-task-processor',
--         headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZueW9reGhzZ2V0c2xmb2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIwOTIzMCwiZXhwIjoyMDY4Nzg1MjMwfQ.lJwGmM5YrCWRdmHZZJkQVZpqkRSVIhgTZDHCJKhO7JI"}'::jsonb,
--         body:=concat('{"scheduled": true, "timestamp": "', now(), '"}')::jsonb
--     ) as request_id;
--   $$
-- );

-- Create a view for monitoring task statuses (for admin use)
CREATE OR REPLACE VIEW pending_tasks_status AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest_task,
  MAX(created_at) as newest_task,
  AVG(attempts) as avg_attempts
FROM pending_user_tasks 
GROUP BY status;

-- Grant access to the view for client users with admin role
GRANT SELECT ON pending_tasks_status TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Only admins can view pending tasks status" 
  ON pending_tasks_status 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
