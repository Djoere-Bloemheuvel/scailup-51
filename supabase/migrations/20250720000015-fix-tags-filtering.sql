-- Fix Tags Filtering Migration
-- This migration standardizes tags storage and fixes filtering functionality
-- while maintaining full Lovable compatibility

-- 1. First, let's check what format tags are currently stored in
-- This will help us understand the current state

-- 2. Create a function to normalize tags to JSONB arrays
CREATE OR REPLACE FUNCTION normalize_tags_to_jsonb(tags_input TEXT)
RETURNS JSONB AS $$
DECLARE
  normalized_tags JSONB;
BEGIN
  -- Handle null or empty input
  IF tags_input IS NULL OR tags_input = '' OR tags_input = 'null' OR tags_input = '""' THEN
    RETURN '[]'::jsonb;
  END IF;
  
  -- If it's already a JSON array, return as is
  IF tags_input ~ '^\[.*\]$' THEN
    BEGIN
      RETURN tags_input::jsonb;
    EXCEPTION WHEN OTHERS THEN
      -- If JSON parsing fails, treat as comma-separated string
    END;
  END IF;
  
  -- Handle comma-separated string format
  -- Split by comma, trim whitespace, filter out empty values, and convert to JSONB array
  SELECT jsonb_agg(trim(tag))
  INTO normalized_tags
  FROM (
    SELECT unnest(string_to_array(tags_input, ',')) as tag
  ) t
  WHERE trim(tag) != '' AND trim(tag) != 'null';
  
  RETURN COALESCE(normalized_tags, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Update the leads table to ensure tags are stored as JSONB arrays
-- First, add a temporary column to store normalized tags
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags_normalized JSONB;

-- 4. Update existing tags to normalized format
UPDATE leads 
SET tags_normalized = normalize_tags_to_jsonb(tags::text)
WHERE tags_normalized IS NULL;

-- 5. Create a new get_unique_tags function that works with JSONB arrays
CREATE OR REPLACE FUNCTION get_unique_tags()
RETURNS TABLE(tag text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT jsonb_array_elements_text(tags_normalized) as tag
  FROM leads
  WHERE tags_normalized IS NOT NULL 
    AND jsonb_array_length(tags_normalized) > 0
    AND email IS NOT NULL 
    AND email != ''
  ORDER BY tag;
$$;

-- 6. Create a function to search leads by tags (for filtering)
CREATE OR REPLACE FUNCTION search_leads_by_tags(tags_to_search TEXT[])
RETURNS TABLE(lead_id UUID)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT l.id
  FROM leads l
  WHERE l.tags_normalized ?| tags_to_search
    AND l.email IS NOT NULL 
    AND l.email != '';
$$;

-- 7. Create a function to exclude leads by tags
CREATE OR REPLACE FUNCTION exclude_leads_by_tags(tags_to_exclude TEXT[])
RETURNS TABLE(lead_id UUID)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT l.id
  FROM leads l
  WHERE NOT (l.tags_normalized ?| tags_to_exclude)
    AND l.email IS NOT NULL 
    AND l.email != '';
$$;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_tags_normalized_gin ON leads USING gin(tags_normalized);
CREATE INDEX IF NOT EXISTS idx_leads_tags_normalized_array ON leads USING gin(tags_normalized jsonb_path_ops);

-- 9. Create a trigger to automatically normalize tags when they're inserted or updated
CREATE OR REPLACE FUNCTION trigger_normalize_tags()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize tags whenever they're updated
  NEW.tags_normalized = normalize_tags_to_jsonb(NEW.tags::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_normalize_tags ON leads;
CREATE TRIGGER trigger_normalize_tags
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_normalize_tags();

-- 10. Create a function to get tag statistics
CREATE OR REPLACE FUNCTION get_tag_statistics()
RETURNS TABLE(tag text, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    jsonb_array_elements_text(tags_normalized) as tag,
    COUNT(*) as count
  FROM leads
  WHERE tags_normalized IS NOT NULL 
    AND jsonb_array_length(tags_normalized) > 0
    AND email IS NOT NULL 
    AND email != ''
  GROUP BY jsonb_array_elements_text(tags_normalized)
  ORDER BY count DESC, tag;
$$;

-- 11. Insert some test data with proper tags format if the table is empty
DO $$
DECLARE
  leads_count INTEGER;
BEGIN
  -- Count existing leads
  SELECT COUNT(*) INTO leads_count FROM leads WHERE email IS NOT NULL AND email != '';
  
  -- If no leads exist, insert test data with proper tags
  IF leads_count = 0 THEN
    INSERT INTO leads (
      first_name, last_name, job_title, company_name, email, 
      industry, country, employee_count, tags, tags_normalized
    ) VALUES 
      (
        'John', 'Doe', 'Marketing Manager', 'TechCorp Solutions', 'john.doe@techcorp.com',
        'Technology', 'Netherlands', 150, 
        '["B2B", "SaaS", "Marketing", "Digital", "Analytics"]'::jsonb,
        '["B2B", "SaaS", "Marketing", "Digital", "Analytics"]'::jsonb
      ),
      (
        'Sarah', 'Johnson', 'Chief Marketing Officer', 'Digital Innovations BV', 'sarah.johnson@digitalinnovations.nl',
        'Marketing & Advertising', 'Netherlands', 75, 
        '["Enterprise", "B2B", "Digital", "Campaigns"]'::jsonb,
        '["Enterprise", "B2B", "Digital", "Campaigns"]'::jsonb
      ),
      (
        'Michael', 'Chen', 'CTO', 'StartupTech', 'michael.chen@startuptech.com',
        'Software Development', 'Germany', 25, 
        '["Startup", "Tech", "Software", "Development"]'::jsonb,
        '["Startup", "Tech", "Software", "Development"]'::jsonb
      ),
      (
        'Emma', 'Williams', 'Sales Director', 'SalesForce Europe', 'emma.williams@salesforce-eu.com',
        'Sales & CRM', 'United Kingdom', 500, 
        '["Sales", "CRM", "Enterprise", "B2B"]'::jsonb,
        '["Sales", "CRM", "Enterprise", "B2B"]'::jsonb
      ),
      (
        'Lars', 'Nielsen', 'Product Manager', 'Nordic Solutions AB', 'lars.nielsen@nordicsolutions.se',
        'Product Management', 'Sweden', 200, 
        '["Product", "B2B", "Nordic", "Management"]'::jsonb,
        '["Product", "B2B", "Nordic", "Management"]'::jsonb
      );
    
    RAISE NOTICE 'Inserted 5 test leads with proper tags format';
  END IF;
END $$;

-- 12. Create a function to validate and fix existing tags data
CREATE OR REPLACE FUNCTION fix_existing_tags()
RETURNS INTEGER AS $$
DECLARE
  fixed_count INTEGER := 0;
BEGIN
  -- Update leads that have tags but no normalized tags
  UPDATE leads 
  SET tags_normalized = normalize_tags_to_jsonb(tags::text)
  WHERE tags_normalized IS NULL AND tags IS NOT NULL;
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  RAISE NOTICE 'Fixed % leads with tags normalization', fixed_count;
  
  RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Run the fix function
SELECT fix_existing_tags(); 