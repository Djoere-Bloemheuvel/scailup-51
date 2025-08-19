
-- Configure the service role key for webhook authentication
-- This allows the database trigger to authenticate with the edge function
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZueW9reGhzZ2V0c2xmb2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIwOTIzMCwiZXhwIjoyMDY4Nzg1MjMwfQ.MrBXZiVqMGb_0I_KgOdTdLqULbgFVYqOGCjSvmSKQks';

-- Verify the setting was applied
SELECT current_setting('app.settings.service_role_key', true) as service_role_key;
