
-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_simple();

-- Create an improved function that handles user creation AND webhook calling
CREATE OR REPLACE FUNCTION public.handle_new_user_with_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  domain TEXT;
  new_client_id UUID;
  existing_client_id UUID;
  webhook_payload JSONB;
  webhook_response RECORD;
BEGIN
  -- Log the start of user processing
  RAISE LOG 'Processing new user: % with email: %', NEW.id, NEW.email;
  
  -- Extract domain from email
  domain := SPLIT_PART(NEW.email, '@', 2);
  
  -- Check if client already exists for this domain
  SELECT id INTO existing_client_id
  FROM public.clients 
  WHERE company_domain = LOWER(domain)
  LIMIT 1;
  
  IF existing_client_id IS NOT NULL THEN
    -- Use existing client
    new_client_id := existing_client_id;
    RAISE LOG 'Using existing client % for domain %', new_client_id, domain;
  ELSE
    -- Create new client
    INSERT INTO public.clients (
      id, 
      company_name, 
      company_email, 
      company_domain,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(), 
      COALESCE(NEW.raw_user_meta_data->>'company_name', INITCAP(SPLIT_PART(domain, '.', 1))),
      NEW.email,
      LOWER(domain),
      NOW(),
      NOW()
    )
    RETURNING id INTO new_client_id;
    
    RAISE LOG 'Created new client % for domain %', new_client_id, domain;
  END IF;

  -- Create client-user relationship
  INSERT INTO public.client_users (client_id, user_id, role, created_at)
  VALUES (new_client_id, NEW.id, 'admin', NOW())
  ON CONFLICT (user_id, client_id) DO NOTHING;
  
  RAISE LOG 'Created client-user relationship for user % and client %', NEW.id, new_client_id;

  -- Prepare webhook payload
  webhook_payload := jsonb_build_object(
    'record', jsonb_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'raw_user_meta_data', COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      'phone', NEW.phone,
      'created_at', NEW.created_at,
      'email_confirmed_at', NEW.email_confirmed_at
    ),
    'event_type', 'user_created',
    'timestamp', NOW()
  );

  -- Call the register-webhook edge function directly
  BEGIN
    RAISE LOG 'Calling register-webhook edge function for user %', NEW.email;
    
    -- Use net.http_post to call the edge function
    SELECT status, content INTO webhook_response
    FROM net.http_post(
      url := 'https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/register-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := webhook_payload::text
    );
    
    RAISE LOG 'Webhook response for user %: status %, content %', NEW.email, webhook_response.status, webhook_response.content;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log webhook error but don't fail user creation
    RAISE WARNING 'Failed to call webhook for user %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE WARNING 'Failed to process new user %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$function$;

-- Create the trigger that calls our improved function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_webhook();

-- Also ensure we have the service role key available for the webhook calls
-- This should be set as a database setting for security
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your_service_role_key_here';
