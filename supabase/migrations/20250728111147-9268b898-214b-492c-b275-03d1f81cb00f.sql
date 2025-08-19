
-- Add audience filtering columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS audience_filter JSONB,
ADD COLUMN IF NOT EXISTS auto_assign_enabled BOOLEAN DEFAULT false;

-- Create an index on the audience_filter column for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_audience_filter ON campaigns USING gin(audience_filter);

-- Update the campaigns table updated_at trigger to include the new columns
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_campaigns_updated_at_trigger ON campaigns;
CREATE TRIGGER update_campaigns_updated_at_trigger
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- Create a function to get filtered contact count for audience targeting
CREATE OR REPLACE FUNCTION get_audience_contact_count(
  p_client_id UUID,
  p_function_groups TEXT[] DEFAULT NULL,
  p_industries TEXT[] DEFAULT NULL,
  p_countries TEXT[] DEFAULT NULL,
  p_min_employees INTEGER DEFAULT NULL,
  p_max_employees INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM contacts
    WHERE client_id = p_client_id
    AND status = 'ready'
    AND email IS NOT NULL
    AND email != ''
    AND (p_function_groups IS NULL OR function_group = ANY(p_function_groups))
    AND (p_industries IS NULL OR industry = ANY(p_industries))
    AND (p_countries IS NULL OR country = ANY(p_countries))
    AND (p_min_employees IS NULL OR employee_count >= p_min_employees)
    AND (p_max_employees IS NULL OR employee_count <= p_max_employees)
  );
END;
$$;

-- Create a function to get contacts matching audience filters
CREATE OR REPLACE FUNCTION get_audience_contacts(
  p_client_id UUID,
  p_function_groups TEXT[] DEFAULT NULL,
  p_industries TEXT[] DEFAULT NULL,
  p_countries TEXT[] DEFAULT NULL,
  p_min_employees INTEGER DEFAULT NULL,
  p_max_employees INTEGER DEFAULT NULL
)
RETURNS TABLE(contact_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id
  FROM contacts c
  WHERE c.client_id = p_client_id
  AND c.status = 'ready'
  AND c.email IS NOT NULL
  AND c.email != ''
  AND (p_function_groups IS NULL OR c.function_group = ANY(p_function_groups))
  AND (p_industries IS NULL OR c.industry = ANY(p_industries))
  AND (p_countries IS NULL OR c.country = ANY(p_countries))
  AND (p_min_employees IS NULL OR c.employee_count >= p_min_employees)
  AND (p_max_employees IS NULL OR c.employee_count <= p_max_employees);
END;
$$;

-- Create a function to get distinct filter options for audience targeting
CREATE OR REPLACE FUNCTION get_audience_filter_options(p_client_id UUID)
RETURNS TABLE(
  function_groups TEXT[],
  industries TEXT[],
  countries TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ARRAY(
      SELECT DISTINCT function_group 
      FROM contacts 
      WHERE client_id = p_client_id 
      AND function_group IS NOT NULL 
      AND function_group != ''
      AND status = 'ready'
      AND email IS NOT NULL
      ORDER BY function_group
    ),
    ARRAY(
      SELECT DISTINCT industry 
      FROM contacts 
      WHERE client_id = p_client_id 
      AND industry IS NOT NULL 
      AND industry != ''
      AND status = 'ready'
      AND email IS NOT NULL
      ORDER BY industry
    ),
    ARRAY(
      SELECT DISTINCT country 
      FROM contacts 
      WHERE client_id = p_client_id 
      AND country IS NOT NULL 
      AND country != ''
      AND status = 'ready'
      AND email IS NOT NULL
      ORDER BY country
    );
END;
$$;
