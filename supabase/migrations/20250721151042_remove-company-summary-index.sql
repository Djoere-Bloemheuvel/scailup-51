-- Remove company_summary index that's causing btree size error
-- The company_summary column is too large for btree indexing

-- Drop the problematic index
DROP INDEX IF EXISTS idx_leads_company_summary;

-- Optional: Create a hash index on a substring if needed for performance
-- CREATE INDEX idx_leads_company_summary_hash ON leads (md5(substring(company_summary, 1, 100)));

-- Optional: Create GIN index for full-text search if needed
-- CREATE INDEX idx_leads_company_summary_gin ON leads USING gin(to_tsvector('english', company_summary));
