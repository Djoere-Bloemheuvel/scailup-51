-- Rename offers table to propositions
ALTER TABLE offers RENAME TO propositions;

-- Update any existing foreign key references in campaigns table
-- (if the campaigns table has an offers_id column, rename it to proposition_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'offers_id'
    ) THEN
        ALTER TABLE campaigns RENAME COLUMN offers_id TO proposition_id;
    END IF;
END $$;

-- Update any indexes that reference the old table name
-- Note: PostgreSQL should automatically update most indexes, but we'll be explicit

-- Add comment to document the change
COMMENT ON TABLE propositions IS 'Business propositions/offerings that can be used in campaigns (renamed from offers)';
