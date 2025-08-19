
-- Check if pg_cron and pg_net extensions are installed and enabled
SELECT name, installed_version, default_version 
FROM pg_available_extensions 
WHERE name IN ('pg_cron', 'pg_net');

-- Check current cron jobs
SELECT jobname, schedule, active, database 
FROM cron.job 
ORDER BY created_at DESC;

-- Check recent cron job execution details
SELECT jobname, runid, job_pid, database, username, command, status, return_message, start_time, end_time
FROM cron.job_run_details 
WHERE jobname = 'process-pending-user-tasks'
ORDER BY start_time DESC 
LIMIT 10;

-- Check current state of pending tasks
SELECT status, COUNT(*) as count, 
       MIN(created_at) as oldest_task,
       MAX(created_at) as newest_task
FROM pending_user_tasks 
GROUP BY status;

-- Check for any failed tasks that need attention
SELECT id, user_id, task_type, attempts, max_attempts, last_error, next_retry_at
FROM pending_user_tasks 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 5;
