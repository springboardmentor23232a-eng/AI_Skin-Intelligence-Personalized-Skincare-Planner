-- ============================================================
-- SkinSight — PostgreSQL schema
-- Run with: psql -U postgres -d skinsight -f db/schema.sql
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'consultant', 'dermatologist', 'admin');

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),              -- NULL for pure OAuth accounts
  role            user_role NOT NULL DEFAULT 'user',
  oauth_provider  VARCHAR(40),               -- e.g. 'google'
  oauth_id        VARCHAR(120),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- Skin Profile Management ----------
CREATE TABLE IF NOT EXISTS skin_profiles (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skin_type       VARCHAR(40),               -- Oily / Dry / Combination / Normal / Sensitive
  age_group       VARCHAR(20),               -- Under 18 / 18-24 / 25-34 / 35-44 / 45-54 / 55+
  skin_concerns   TEXT[],                    -- e.g. {post-acne marks, enlarged pores}
  allergies       TEXT,
  sensitivities   TEXT,
  routine         TEXT,
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ---------- Lifestyle Tracking ----------
CREATE TABLE IF NOT EXISTS lifestyle_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diet_quality    VARCHAR(20),               -- Poor / Average / Good
  stress_level    SMALLINT,                  -- 1-10
  activity_minutes INTEGER,
  substance_use   VARCHAR(30),               -- None / Alcohol only / Smoking only / Both
  logged_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- Sleep Pattern Tracking ----------
CREATE TABLE IF NOT EXISTS sleep_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bedtime         TIME,
  wake_time       TIME,
  duration_hours  NUMERIC(4,2),
  quality         VARCHAR(20),               -- Poor / Fair / Good / Excellent
  logged_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- Hydration Tracking ----------
CREATE TABLE IF NOT EXISTS hydration_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml       INTEGER NOT NULL,
  source          VARCHAR(30),               -- Water / Tea / Coffee / Juice / Other
  logged_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- Environmental Exposure Tracking ----------
CREATE TABLE IF NOT EXISTS environment_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location        VARCHAR(120),
  duration_minutes INTEGER,
  spf_applied     BOOLEAN,
  time_of_day     VARCHAR(20),               -- Morning / Midday / Afternoon / Evening
  uv_index        NUMERIC(4,1),
  aqi             INTEGER,
  humidity        INTEGER,
  logged_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lifestyle_user ON lifestyle_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_user ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_user ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_environment_user ON environment_logs(user_id);
