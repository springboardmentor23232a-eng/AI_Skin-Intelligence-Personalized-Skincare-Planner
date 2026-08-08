-- ============================================================
-- AI Skin Intelligence — PostgreSQL Schema
-- Run this file once to set up the database
-- ============================================================

-- Create the database (run separately if needed)
-- CREATE DATABASE skin_intelligence;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'consultant', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth_provider AS ENUM ('LOCAL', 'GOOGLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(255)        UNIQUE NOT NULL,
    password_hash VARCHAR(255),                          -- NULL for OAuth users
    role          user_role           NOT NULL DEFAULT 'user',
    provider      auth_provider       NOT NULL DEFAULT 'LOCAL',
    is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255)    NOT NULL,
    expires_at  TIMESTAMPTZ     NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: skin_profiles  (user skincare data)
-- ============================================================
CREATE TABLE IF NOT EXISTS skin_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skin_type           VARCHAR(50),           -- e.g. oily, dry, combination, sensitive
    skin_concerns       TEXT[],                -- e.g. {acne, wrinkles, dark_spots, hyperpigmentation}
    allergies           TEXT[],                -- e.g. {fragrance, nuts, latex}
    sensitivity_level   VARCHAR(20),           -- low, medium, high
    routine_morning     TEXT,
    routine_evening     TEXT,
    products_used       TEXT[],                -- current skincare products
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: lifestyle_tracking  (user lifestyle factors)
-- ============================================================
CREATE TABLE IF NOT EXISTS lifestyle_tracking (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diet_type           VARCHAR(50),           -- e.g. balanced, vegetarian, vegan, keto
    water_intake_daily INTEGER,               -- daily water intake in ml
    exercise_frequency  VARCHAR(20),           -- sedentary, light, moderate, active
    stress_level        VARCHAR(20),           -- low, medium, high
    smoking_status      BOOLEAN,               -- true if smoker
    alcohol_consumption VARCHAR(20),          -- none, occasional, regular, heavy
    notes               TEXT,
    recorded_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: sleep_tracking  (sleep pattern monitoring)
-- ============================================================
CREATE TABLE IF NOT EXISTS sleep_tracking (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sleep_date          DATE        NOT NULL DEFAULT CURRENT_DATE,
    bedtime             TIME,                   -- when user went to bed
    wake_time           TIME,                   -- when user woke up
    sleep_duration      INTEGER,               -- total sleep hours
    sleep_quality       VARCHAR(20),           -- poor, fair, good, excellent
    disturbances        TEXT[],                -- e.g. {waking_up_frequently, trouble_falling_asleep}
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: hydration_tracking  (daily water intake monitoring)
-- ============================================================
CREATE TABLE IF NOT EXISTS hydration_tracking (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracking_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
    target_intake       INTEGER                 -- daily target in ml
    current_intake      INTEGER                 -- current intake in ml
    intake_logs         JSONB,                  -- array of {time, amount, type}
    goal_achieved       BOOLEAN,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: environmental_exposure  (environmental factors)
-- ============================================================
CREATE TABLE IF NOT EXISTS environmental_exposure (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exposure_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
    uv_index            DECIMAL(3,1),           -- UV index level
    sun_exposure_hours  DECIMAL(4,2),          -- hours in direct sunlight
    pollution_level     VARCHAR(20),           -- low, moderate, high
    humidity_level      VARCHAR(20),           -- low, moderate, high
    temperature_avg     DECIMAL(4,1),          -- average temperature
    indoor_air_quality  VARCHAR(20),           -- good, moderate, poor
    sunscreen_applied  BOOLEAN,
    sunscreen_spf       INTEGER,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: skin_assessments  (AI skin assessment results)
-- ============================================================
CREATE TABLE IF NOT EXISTS skin_assessments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    skin_health_score   INTEGER     NOT NULL CHECK (skin_health_score >= 0 AND skin_health_score <= 100),
    overall_condition   VARCHAR(20) NOT NULL,  -- Excellent, Good, Fair, Poor, Critical
    concerns            JSONB,                  -- Array of identified concerns
    risk_factors        JSONB,                  -- Array of risk factor names
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: skin_concerns  (individual skin concerns)
-- ============================================================
CREATE TABLE IF NOT EXISTS skin_concerns (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id       UUID        NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
    concern_name        VARCHAR(100) NOT NULL,
    severity            VARCHAR(20) NOT NULL,  -- Low, Medium, High
    priority            VARCHAR(20) NOT NULL,  -- Low, Medium, High
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: risk_factors  (individual risk factors)
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_factors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id       UUID        NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
    risk_name           VARCHAR(100) NOT NULL,
    description         TEXT,
    risk_level          VARCHAR(20) NOT NULL,  -- Low, Medium, High
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_profiles_user  ON skin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_user     ON lifestyle_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_date     ON lifestyle_tracking(recorded_date);
CREATE INDEX IF NOT EXISTS idx_sleep_user         ON sleep_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_date         ON sleep_tracking(sleep_date);
CREATE INDEX IF NOT EXISTS idx_hydration_user    ON hydration_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_date    ON hydration_tracking(tracking_date);
CREATE INDEX IF NOT EXISTS idx_environmental_user ON environmental_exposure(user_id);
CREATE INDEX IF NOT EXISTS idx_environmental_date ON environmental_exposure(exposure_date);
CREATE INDEX IF NOT EXISTS idx_skin_assessments_user ON skin_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_assessments_date ON skin_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_skin_concerns_assessment ON skin_concerns(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_factors_assessment ON risk_factors(assessment_id);

-- ============================================================
-- TRIGGER: auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_skin_profiles_updated_at ON skin_profiles;
CREATE TRIGGER set_skin_profiles_updated_at
    BEFORE UPDATE ON skin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_lifestyle_tracking_updated_at ON lifestyle_tracking;
CREATE TRIGGER set_lifestyle_tracking_updated_at
    BEFORE UPDATE ON lifestyle_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_sleep_tracking_updated_at ON sleep_tracking;
CREATE TRIGGER set_sleep_tracking_updated_at
    BEFORE UPDATE ON sleep_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_hydration_tracking_updated_at ON hydration_tracking;
CREATE TRIGGER set_hydration_tracking_updated_at
    BEFORE UPDATE ON hydration_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_environmental_exposure_updated_at ON environmental_exposure;
CREATE TRIGGER set_environmental_exposure_updated_at
    BEFORE UPDATE ON environmental_exposure
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_skin_assessments_updated_at ON skin_assessments;
CREATE TRIGGER set_skin_assessments_updated_at
    BEFORE UPDATE ON skin_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: default admin account
-- password = Admin@1234 (bcrypt hash)
-- ============================================================
INSERT INTO users (name, email, password_hash, role, provider)
VALUES (
    'Admin',
    'admin@skinai.com',
    '$2b$12$ZI5dY10NloaqzG85.p.dRu9tDZpjsc2MTj.M1v0ESsQRvfhecRKSC',
    'admin',
    'LOCAL'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- VERIFY: show created tables
-- ============================================================
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
