
-- First, let's ensure the contact_lists table has proper RLS policies
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_lists table
CREATE POLICY "Users can view contact_lists from their client" 
  ON public.contact_lists 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contact_lists.client_id
  ));

CREATE POLICY "Users can insert contact_lists for their client" 
  ON public.contact_lists 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contact_lists.client_id
  ));

CREATE POLICY "Users can update contact_lists from their client" 
  ON public.contact_lists 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contact_lists.client_id
  ));

CREATE POLICY "Users can delete contact_lists from their client" 
  ON public.contact_lists 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM client_users 
    WHERE client_users.user_id = auth.uid() 
    AND client_users.client_id = contact_lists.client_id
  ));

-- Create a new function for getting contact count for contact lists
CREATE OR REPLACE FUNCTION public.get_contact_list_count(
  p_client_id uuid,
  p_filters jsonb
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_function_groups text[];
  v_industries text[];
  v_countries text[];
  v_min_employees integer;
  v_max_employees integer;
BEGIN
  -- Extract filter values from jsonb
  v_function_groups := CASE 
    WHEN p_filters->>'function_groups' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(p_filters->'function_groups'))
    ELSE NULL 
  END;
  
  v_industries := CASE 
    WHEN p_filters->>'industries' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(p_filters->'industries'))
    ELSE NULL 
  END;
  
  v_countries := CASE 
    WHEN p_filters->>'countries' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(p_filters->'countries'))
    ELSE NULL 
  END;
  
  v_min_employees := (p_filters->>'min_employees')::integer;
  v_max_employees := (p_filters->>'max_employees')::integer;

  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM contacts
    WHERE client_id = p_client_id
    AND status = 'ready'
    AND email IS NOT NULL
    AND email != ''
    AND (v_function_groups IS NULL OR function_group = ANY(v_function_groups))
    AND (v_industries IS NULL OR industry = ANY(v_industries))
    AND (v_countries IS NULL OR country = ANY(v_countries))
    AND (v_min_employees IS NULL OR employee_count >= v_min_employees)
    AND (v_max_employees IS NULL OR employee_count <= v_max_employees)
  );
END;
$$;
