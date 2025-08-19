
-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION notify_instantly_campaign_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for INSERT operations
  IF TG_OP = 'INSERT' THEN
    -- Call the edge function asynchronously with better error handling
    PERFORM net.http_post(
      url := 'https://zkrfnyokxhsgetslfodg.supabase.co/functions/v1/create-instantly-campaign',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'old_record', NULL
      )
    );
    
    -- Log the trigger execution
    RAISE LOG 'Instantly campaign trigger executed for campaign %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the campaign creation
    RAISE WARNING 'Failed to call Instantly campaign function for campaign %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_instantly_campaign_trigger ON campaigns;

-- Create the trigger for INSERT operations only
CREATE TRIGGER create_instantly_campaign_trigger
  AFTER INSERT ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION notify_instantly_campaign_created();
