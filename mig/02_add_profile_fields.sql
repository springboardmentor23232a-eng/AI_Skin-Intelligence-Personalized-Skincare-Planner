-- Keep existing installations in sync with the profile API and report queries.
ALTER TABLE skin_profiles
    ADD COLUMN IF NOT EXISTS sensitivity_level VARCHAR(20),
    ADD COLUMN IF NOT EXISTS products_used TEXT[];
