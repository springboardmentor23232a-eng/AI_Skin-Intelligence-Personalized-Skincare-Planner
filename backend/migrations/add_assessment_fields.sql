-- Add skin assessment engine fields to skin_profiles table
ALTER TABLE skin_profiles
ADD COLUMN IF NOT EXISTS skin_health_score INTEGER,
ADD COLUMN IF NOT EXISTS risk_factors TEXT[],
ADD COLUMN IF NOT EXISTS priority VARCHAR(20),
ADD COLUMN IF NOT EXISTS assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure skin_concerns column exists (it might be missing)
ALTER TABLE skin_profiles
ADD COLUMN IF NOT EXISTS skin_concerns TEXT[];
