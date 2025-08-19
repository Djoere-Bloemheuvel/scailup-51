
-- Step 5: Create comprehensive helper functions for complete system functionality
-- These functions will ensure all operations work correctly after the restoration

-- Enhanced function to get filtered leads with better performance
CREATE OR REPLACE FUNCTION public.get_filtered_leads_optimized(
  p_search_term TEXT DEFAULT NULL,
  p_job_titles TEXT[] DEFAULT NULL,
  p_exclude_job_titles TEXT[] DEFAULT NULL,
  p_industries TEXT[] DEFAULT NULL,
  p_exclude_industries TEXT[] DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_company_sizes TEXT[] DEFAULT NULL,
  p_employee_min INTEGER DEFAULT NULL,
  p_employee_max INTEGER DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_exclude_tags TEXT[] DEFAULT NULL,
  p_lead_status TEXT DEFAULT 'new',
  p_client_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  lead_data jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_client_id UUID;
  contact_lead_ids UUID[];
  base_query TEXT;
  where_conditions TEXT[] := ARRAY[]::TEXT[];
  final_query TEXT;
  count_query TEXT;
  total_records BIGINT;
BEGIN
  -- Get current client ID
  IF p_client_id IS NOT NULL THEN
    current_client_id := p_client_id;
  ELSE
    SELECT get_current_client_id() INTO current_client_id;
  END IF;
  
  IF current_client_id IS NULL THEN
    RETURN QUERY SELECT NULL::jsonb, 0::bigint WHERE false;
    RETURN;
  END IF;

  -- Get contact lead IDs for the client
  SELECT ARRAY_AGG(lead_id) INTO contact_lead_ids
  FROM contacts 
  WHERE client_id = current_client_id AND lead_id IS NOT NULL;
  
  IF contact_lead_ids IS NULL THEN
    contact_lead_ids := ARRAY[]::UUID[];
  END IF;

  -- Build base WHERE conditions
  where_conditions := array_append(where_conditions, format('client_id = ''%s''', current_client_id));
  where_conditions := array_append(where_conditions, 'email IS NOT NULL AND email != ''''');
  where_conditions := array_append(where_conditions, '(is_duplicate IS NULL OR is_duplicate = false)');

  -- Lead status filtering
  IF p_lead_status = 'new' AND array_length(contact_lead_ids, 1) > 0 THEN
    where_conditions := array_append(where_conditions, 
      'id != ALL(ARRAY[' || array_to_string(contact_lead_ids, ',') || ']::UUID[])');
  ELSIF p_lead_status = 'contacts' AND array_length(contact_lead_ids, 1) > 0 THEN
    where_conditions := array_append(where_conditions, 
      'id = ANY(ARRAY[' || array_to_string(contact_lead_ids, ',') || ']::UUID[])');
  ELSIF p_lead_status = 'contacts' THEN
    -- No contacts exist, return empty result
    RETURN QUERY SELECT NULL::jsonb, 0::bigint WHERE false;
    RETURN;
  END IF;

  -- Search term filtering
  IF p_search_term IS NOT NULL AND p_search_term != '' THEN
    where_conditions := array_append(where_conditions,
      format('(first_name ILIKE ''%%%s%%'' OR last_name ILIKE ''%%%s%%'' OR 
              company_name ILIKE ''%%%s%%'' OR job_title ILIKE ''%%%s%%'' OR 
              email ILIKE ''%%%s%%'')', 
              p_search_term, p_search_term, p_search_term, p_search_term, p_search_term));
  END IF;

  -- Job titles filtering
  IF p_job_titles IS NOT NULL AND array_length(p_job_titles, 1) > 0 THEN
    where_conditions := array_append(where_conditions,
      'job_title ILIKE ANY(ARRAY[' || 
      array_to_string(ARRAY(SELECT '''%' || unnest(p_job_titles) || '%'''), ',') || '])');
  END IF;

  -- Industry filtering
  IF p_industries IS NOT NULL AND array_length(p_industries, 1) > 0 THEN
    where_conditions := array_append(where_conditions,
      'industry = ANY(ARRAY[' || 
      array_to_string(ARRAY(SELECT '''' || unnest(p_industries) || ''''), ',') || '])');
  END IF;

  -- Country filtering
  IF p_country IS NOT NULL AND p_country != '' THEN
    where_conditions := array_append(where_conditions,
      format('country = ''%s''', p_country));
  END IF;

  -- Employee count filtering
  IF p_employee_min IS NOT NULL THEN
    where_conditions := array_append(where_conditions,
      format('(employee_count >= %s OR employee_count IS NULL)', p_employee_min));
  END IF;

  IF p_employee_max IS NOT NULL THEN
    where_conditions := array_append(where_conditions,
      format('employee_count <= %s', p_employee_max));
  END IF;

  -- Build final query
  base_query := 'FROM leads';
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;

  -- Get total count
  count_query := 'SELECT COUNT(*) ' || base_query;
  EXECUTE count_query INTO total_records;

  -- Get paginated results
  final_query := format(
    'SELECT to_jsonb(leads.*) %s ORDER BY created_at DESC LIMIT %s OFFSET %s',
    base_query, p_limit, p_offset
  );

  RETURN QUERY EXECUTE format(
    'SELECT lead_row.to_jsonb, %s::bigint FROM (%s) as lead_row',
    total_records, final_query
  );
END;
$$;

-- Function to validate and clean up orphaned records
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_records()
RETURNS TABLE(cleanup_summary jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphaned_contacts INTEGER;
  orphaned_activities INTEGER;
  invalid_leads INTEGER;
  summary JSONB;
BEGIN
  -- Clean up contacts without valid leads
  DELETE FROM contacts 
  WHERE lead_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM leads WHERE id = contacts.lead_id);
  GET DIAGNOSTICS orphaned_contacts = ROW_COUNT;

  -- Clean up contact activities without valid contacts
  DELETE FROM contact_activities 
  WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE id = contact_activities.contact_id);
  GET DIAGNOSTICS orphaned_activities = ROW_COUNT;

  -- Mark duplicate leads
  UPDATE leads 
  SET is_duplicate = true 
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY client_id, LOWER(email) 
        ORDER BY created_at
      ) as rn
      FROM leads 
      WHERE email IS NOT NULL AND email != ''
    ) t WHERE rn > 1
  );
  GET DIAGNOSTICS invalid_leads = ROW_COUNT;

  -- Create summary
  summary := jsonb_build_object(
    'orphaned_contacts_removed', orphaned_contacts,
    'orphaned_activities_removed', orphaned_activities,
    'duplicate_leads_marked', invalid_leads,
    'cleanup_completed_at', now()
  );

  RETURN QUERY SELECT summary;
END;
$$;

-- Function to verify system integrity
CREATE OR REPLACE FUNCTION public.verify_system_integrity()
RETURNS TABLE(integrity_report jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_clients INTEGER;
  total_users INTEGER;
  total_leads INTEGER;
  total_contacts INTEGER;
  functions_exist INTEGER;
  policies_exist INTEGER;
  indexes_exist INTEGER;
  report JSONB;
BEGIN
  -- Count main entities
  SELECT COUNT(*) INTO total_clients FROM clients;
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO total_leads FROM leads WHERE email IS NOT NULL;
  SELECT COUNT(*) INTO total_contacts FROM contacts;

  -- Check functions exist
  SELECT COUNT(*) INTO functions_exist 
  FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' 
    AND p.proname IN (
      'get_current_client_id',
      'convert_lead_to_contact',
      'bulk_convert_leads_to_contacts',
      'get_contacts_with_lead_data',
      'get_lead_status_counts',
      'check_and_use_credits'
    );

  -- Check policies exist
  SELECT COUNT(*) INTO policies_exist 
  FROM pg_policies 
  WHERE schemaname = 'public';

  -- Check indexes exist
  SELECT COUNT(*) INTO indexes_exist 
  FROM pg_indexes 
  WHERE schemaname = 'public';

  -- Create report
  report := jsonb_build_object(
    'database_summary', jsonb_build_object(
      'total_clients', total_clients,
      'total_users', total_users,
      'total_leads', total_leads,
      'total_contacts', total_contacts
    ),
    'system_health', jsonb_build_object(
      'functions_available', functions_exist,
      'security_policies', policies_exist,
      'indexes_created', indexes_exist
    ),
    'verification_completed_at', now(),
    'system_status', CASE 
      WHEN functions_exist >= 6 AND policies_exist > 0 AND indexes_exist > 0 
      THEN 'healthy'
      ELSE 'needs_attention'
    END
  );

  RETURN QUERY SELECT report;
END;
$$;

-- Enhanced trigger for maintaining data integrity
CREATE OR REPLACE FUNCTION public.maintain_data_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- For leads table
  IF TG_TABLE_NAME = 'leads' THEN
    -- Ensure email is lowercase
    IF NEW.email IS NOT NULL THEN
      NEW.email := LOWER(TRIM(NEW.email));
    END IF;
    
    -- Set updated_at
    NEW.updated_at := NOW();
    
    -- Validate email format (basic)
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
      IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
      END IF;
    END IF;
  END IF;
  
  -- For contacts table
  IF TG_TABLE_NAME = 'contacts' THEN
    -- Ensure email is lowercase
    IF NEW.email IS NOT NULL THEN
      NEW.email := LOWER(TRIM(NEW.email));
    END IF;
    
    -- Set updated_at
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply integrity triggers
DROP TRIGGER IF EXISTS leads_integrity_trigger ON leads;
CREATE TRIGGER leads_integrity_trigger
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION maintain_data_integrity();

DROP TRIGGER IF EXISTS contacts_integrity_trigger ON contacts;
CREATE TRIGGER contacts_integrity_trigger
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION maintain_data_integrity();

-- Run initial cleanup and verification
SELECT cleanup_orphaned_records();
SELECT verify_system_integrity();
