-- Fix registration by updating existing policies and trigger
-- Error was: policy "System can create client records" already exists

-- First, clean up duplicate/conflicting RLS policies on clients table
DROP POLICY IF EXISTS "Users can view their own client record" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own client record" ON public.clients;

-- Update the trigger function to handle potential conflicts better
CREATE OR REPLACE FUNCTION public.handle_new_user_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_client_id UUID;
BEGIN
  -- Create client record if doesn't exist already
  INSERT INTO public.clients (user_id, is_active, plan, admin)
  VALUES (NEW.id, false, 'free', false)
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW()
  RETURNING id INTO new_client_id;
  
  -- If we didn't get the ID from INSERT, get it from existing record
  IF new_client_id IS NULL THEN
    SELECT id INTO new_client_id 
    FROM public.clients 
    WHERE user_id = NEW.id 
    LIMIT 1;
  END IF;
  
  -- Also create users table entry
  INSERT INTO public.users (id, client_id, email)
  VALUES (
    NEW.id, 
    new_client_id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    client_id = EXCLUDED.client_id,
    email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_client();

-- Remove restrictive admin-only policies that might block normal operations
DROP POLICY IF EXISTS "Admins can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;

-- Recreate admin policies without blocking normal users
CREATE POLICY "Admins can manage all clients" 
  ON public.clients 
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.user_id = auth.uid() 
    AND c.admin = true
  ));