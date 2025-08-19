
-- Add new columns for A/B testing email variants with specific step structure
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS email_step_1_subject_a TEXT,
ADD COLUMN IF NOT EXISTS email_step_1_body_a TEXT,
ADD COLUMN IF NOT EXISTS email_step_2_delay_a INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS email_step_2_time_a TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS email_step_2_subject_a TEXT,
ADD COLUMN IF NOT EXISTS email_step_2_body_a TEXT,
ADD COLUMN IF NOT EXISTS email_step_1_subject_b TEXT,
ADD COLUMN IF NOT EXISTS email_step_1_body_b TEXT,
ADD COLUMN IF NOT EXISTS email_step_2_delay_b INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS email_step_2_time_b TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS email_step_2_subject_b TEXT,
ADD COLUMN IF NOT EXISTS email_step_2_body_b TEXT;

-- Remove old columns that are no longer needed
ALTER TABLE campaigns 
DROP COLUMN IF EXISTS email_subject,
DROP COLUMN IF EXISTS email_body_step1,
DROP COLUMN IF EXISTS email_body_step2,
DROP COLUMN IF EXISTS email_subject_b,
DROP COLUMN IF EXISTS email_body_step1_b,
DROP COLUMN IF EXISTS email_body_step2_b;
