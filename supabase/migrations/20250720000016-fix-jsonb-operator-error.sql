-- Quick Fix for JSONB Operator Error
-- This migration fixes the "operator does not exist: jsonb ~~* unknown" error
-- while maintaining full Lovable compatibility

-- 1. Drop the problematic RPC functions that are causing the error
DROP FUNCTION IF EXISTS search_leads_by_tags(TEXT[]);
DROP FUNCTION IF EXISTS exclude_leads_by_tags(TEXT[]);

-- 2. Create a simpler, more compatible get_unique_tags function
CREATE OR REPLACE FUNCTION get_unique_tags()
RETURNS TABLE(tag text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- First try to get tags from tags_normalized column
  SELECT DISTINCT jsonb_array_elements_text(tags_normalized) as tag
  FROM leads
  WHERE tags_normalized IS NOT NULL 
    AND jsonb_array_length(tags_normalized) > 0
    AND email IS NOT NULL 
    AND email != ''
  
  UNION
  
  -- Fallback to original tags column for backward compatibility
  SELECT DISTINCT trim(unnest(string_to_array(tags::text, ','))) as tag
  FROM leads
  WHERE tags IS NOT NULL 
    AND tags::text != ''
    AND tags::text != 'null'
    AND tags::text != '""'
    AND email IS NOT NULL 
    AND email != ''
    AND (tags_normalized IS NULL OR jsonb_array_length(tags_normalized) = 0)
  
  ORDER BY tag;
$$;

-- 3. Create a simple function to check if tags contain a specific tag
CREATE OR REPLACE FUNCTION tags_contain(tags_column JSONB, search_tag TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN tags_column ? search_tag;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create a function to check if tags contain any of the search tags
CREATE OR REPLACE FUNCTION tags_contain_any(tags_column JSONB, search_tags TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN tags_column ?| search_tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Create a function to check if tags do NOT contain any of the exclude tags
CREATE OR REPLACE FUNCTION tags_not_contain_any(tags_column JSONB, exclude_tags TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT (tags_column ?| exclude_tags);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Update the normalize_tags_to_jsonb function to be more robust
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

-- 7. Ensure all existing leads have normalized tags
UPDATE leads 
SET tags_normalized = normalize_tags_to_jsonb(tags::text)
WHERE tags_normalized IS NULL AND tags IS NOT NULL;

-- 8. Create a simple test function to verify everything works
CREATE OR REPLACE FUNCTION test_tags_functions()
RETURNS TABLE(test_name TEXT, result TEXT) AS $$
BEGIN
  -- Test normalize_tags_to_jsonb
  RETURN QUERY SELECT 'normalize_tags_to_jsonb'::TEXT, 
    CASE 
      WHEN normalize_tags_to_jsonb('tag1,tag2,tag3') = '["tag1", "tag2", "tag3"]'::jsonb 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END;
  
  -- Test tags_contain
  RETURN QUERY SELECT 'tags_contain'::TEXT, 
    CASE 
      WHEN tags_contain('["tag1", "tag2"]'::jsonb, 'tag1') 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END;
  
  -- Test tags_contain_any
  RETURN QUERY SELECT 'tags_contain_any'::TEXT, 
    CASE 
      WHEN tags_contain_any('["tag1", "tag2"]'::jsonb, ARRAY['tag1', 'tag3']) 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END;
  
  -- Test tags_not_contain_any
  RETURN QUERY SELECT 'tags_not_contain_any'::TEXT, 
    CASE 
      WHEN tags_not_contain_any('["tag1", "tag2"]'::jsonb, ARRAY['tag3', 'tag4']) 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END;
END;
$$ LANGUAGE plpgsql;

-- 9. Run the test function
SELECT * FROM test_tags_functions();

-- 10. Clean up test function
DROP FUNCTION test_tags_functions(); 