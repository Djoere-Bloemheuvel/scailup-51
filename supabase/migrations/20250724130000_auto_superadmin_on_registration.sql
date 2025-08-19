-- Auto-activate superadmin account for djoere@scailup.io on registration

-- 1. Create function to handle superadmin registration
CREATE OR REPLACE FUNCTION handle_superadmin_registration()
RETURNS TRIGGER AS $$
DECLARE
  superadmin_client_id UUID;
  module_record RECORD;
BEGIN
  -- Check if this is djoere@scailup.io
  IF NEW.email = 'djoere@scailup.io' THEN
    RAISE NOTICE '🎉 Superadmin registration detected for djoere@scailup.io';
    
    -- Create superadmin client if not exists
    INSERT INTO clients (id, company_name, email, admin, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Scailup Superadmin', 'djoere@scailup.io', TRUE, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
      admin = TRUE,
      updated_at = NOW()
    RETURNING id INTO superadmin_client_id;
    
    -- Update user's client_id to point to superadmin client
    UPDATE users 
    SET client_id = superadmin_client_id
    WHERE id = NEW.id;
    
    -- Add unlimited credits for all modules and credit types
    FOR module_record IN SELECT id FROM modules LOOP
      -- Add credits for leads
      INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
      VALUES (superadmin_client_id, module_record.id, 'leads', 99999999, NOW() + INTERVAL '10 years', NOW(), NOW())
      ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
        amount = 99999999,
        expires_at = NOW() + INTERVAL '10 years',
        updated_at = NOW();
      
      -- Add credits for emails
      INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
      VALUES (superadmin_client_id, module_record.id, 'emails', 99999999, NOW() + INTERVAL '10 years', NOW(), NOW())
      ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
        amount = 99999999,
        expires_at = NOW() + INTERVAL '10 years',
        updated_at = NOW();
      
      -- Add credits for linkedin
      INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
      VALUES (superadmin_client_id, module_record.id, 'linkedin', 99999999, NOW() + INTERVAL '10 years', NOW(), NOW())
      ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
        amount = 99999999,
        expires_at = NOW() + INTERVAL '10 years',
        updated_at = NOW();
      
      -- Add credits for campaigns
      INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
      VALUES (superadmin_client_id, module_record.id, 'campaigns', 99999999, NOW() + INTERVAL '10 years', NOW(), NOW())
      ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
        amount = 99999999,
        expires_at = NOW() + INTERVAL '10 years',
        updated_at = NOW();
      
      -- Add credits for webhooks
      INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
      VALUES (superadmin_client_id, module_record.id, 'webhooks', 99999999, NOW() + INTERVAL '10 years', NOW(), NOW())
      ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
        amount = 99999999,
        expires_at = NOW() + INTERVAL '10 years',
        updated_at = NOW();
      
      -- Add credits for api_calls
      INSERT INTO credit_balances (client_id, module_id, credit_type, amount, expires_at, created_at, updated_at)
      VALUES (superadmin_client_id, module_record.id, 'api_calls', 99999999, NOW() + INTERVAL '10 years', NOW(), NOW())
      ON CONFLICT (client_id, module_id, credit_type) DO UPDATE SET
        amount = 99999999,
        expires_at = NOW() + INTERVAL '10 years',
        updated_at = NOW();
    END LOOP;
    
    -- Set superadmin flags in profiles table if it exists
    UPDATE profiles
    SET unlimited_credits = TRUE, is_super_admin = TRUE, is_admin = TRUE
    WHERE email = 'djoere@scailup.io';
    
    RAISE NOTICE '✅ Superadmin setup complete for djoere@scailup.io with unlimited credits';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger to automatically activate superadmin on user registration
DROP TRIGGER IF EXISTS trigger_superadmin_registration ON users;
CREATE TRIGGER trigger_superadmin_registration
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_superadmin_registration();

-- 3. Also handle existing djoere@scailup.io if already registered
DO $$
DECLARE
  existing_user_id UUID;
  superadmin_client_id UUID;
BEGIN
  -- Check if djoere@scailup.io already exists
  SELECT id INTO existing_user_id FROM users WHERE email = 'djoere@scailup.io' LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE '🔄 Setting up existing djoere@scailup.io as superadmin...';
    
    -- Create or update superadmin client
    INSERT INTO clients (id, company_name, email, admin, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Scailup Superadmin', 'djoere@scailup.io', TRUE, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
      admin = TRUE,
      updated_at = NOW()
    RETURNING id INTO superadmin_client_id;
    
    -- Update existing user's client_id
    UPDATE users 
    SET client_id = superadmin_client_id
    WHERE id = existing_user_id;
    
    -- Add unlimited credits for all modules and credit types
    PERFORM handle_superadmin_registration();
    
    RAISE NOTICE '✅ Existing djoere@scailup.io setup complete';
  END IF;
END $$; 