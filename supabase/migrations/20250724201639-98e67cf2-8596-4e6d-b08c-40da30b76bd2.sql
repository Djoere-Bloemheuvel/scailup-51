
-- First, let's check if the net extension is available and enable it properly
SELECT * FROM pg_available_extensions WHERE name = 'net';

-- Drop and recreate the extension to ensure it's properly installed
DROP EXTENSION IF EXISTS "net";
CREATE EXTENSION IF NOT EXISTS "net" SCHEMA "extensions";

-- Verify the extension is installed
SELECT * FROM pg_extension WHERE extname = 'net';

-- Update the handle_new_user function to use the correct schema reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Call the Edge Function using extensions.net.http_post
  PERFORM extensions.net.http_post(
    url := 'https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/on-user-created',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to call on-user-created function: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set the service role key as a runtime setting that can be accessed by the function
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZueW9reGhzZ2V0c2xmb2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIwOTIzMCwiZXhwIjoyMDY4Nzg1MjMwfQ.L_kpRASDKMnxlJPKnfPNgxJnEJfGgLGm_2avLhb7Fj4';
