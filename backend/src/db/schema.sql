-- AI Skincare Planner – Personalized Skin Intelligence
-- PostgreSQL Schema
-- Design note: Module 1 specifies ONE Users table with a `role` column
-- (id, name, email, password, role, provider, created_at, updated_at).
-- We follow that pattern and satisfy the brief's "Doctors / Consultants / Admins"
-- tables by giving Doctor & Consultant roles their own PROFILE-EXTENSION tables
-- (specialization, bio, etc.) that hang off users.id. Admins need no extra
-- columns, so role = 'ADMIN' on the users table is sufficient.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== ENUMS ==========
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'DOCTOR', 'CONSULTANT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE auth_provider AS ENUM ('LOCAL', 'GOOGLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('PENDING_REVIEW', 'REVIEWED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE provider_role AS ENUM ('DOCTOR', 'CONSULTANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========== USERS (Users / Doctors / Consultants / Admins unified) ==========
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) UNIQUE NOT NULL,
  password      VARCHAR(255),                 -- NULL for GOOGLE-only accounts
  role          user_role NOT NULL DEFAULT 'USER',
  provider      auth_provider NOT NULL DEFAULT 'LOCAL',
  google_id     VARCHAR(255) UNIQUE,
  avatar_url    TEXT,
  phone         VARCHAR(30),
  skin_type     VARCHAR(40),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========== DOCTOR PROFILE (extends a users row with role = DOCTOR) ==========
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization    VARCHAR(150) DEFAULT 'General Dermatology',
  qualification     VARCHAR(150),
  experience_years  INTEGER DEFAULT 0,
  bio               TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========== CONSULTANT PROFILE (extends a users row with role = CONSULTANT) ==========
CREATE TABLE IF NOT EXISTS consultant_profiles (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization    VARCHAR(150) DEFAULT 'Skincare & Product Consultant',
  experience_years  INTEGER DEFAULT 0,
  bio               TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========== SKIN REPORTS ==========
CREATE TABLE IF NOT EXISTS skin_reports (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_path        TEXT NOT NULL,
  skin_type         VARCHAR(40),
  skin_health_score INTEGER,                     -- 0-100 (Module 3 style scoring)
  overall_condition VARCHAR(60),
  concerns          JSONB DEFAULT '[]',           -- [{name, severity, priority}]
  risk_factors      JSONB DEFAULT '[]',           -- [{name, description, risk_level}]
  recommendations   JSONB DEFAULT '[]',           -- [{title, description, category}]
  status            report_status NOT NULL DEFAULT 'PENDING_REVIEW',
  reviewed_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  doctor_notes      TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========== APPOINTMENTS ==========
CREATE TABLE IF NOT EXISTS appointments (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_role   provider_role NOT NULL,
  report_id       INTEGER REFERENCES skin_reports(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status          appointment_status NOT NULL DEFAULT 'PENDING',
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON skin_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_appt_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appt_provider ON appointments(provider_id);

-- ========== SKINCARE PLANS (routine generation) ==========
CREATE TABLE IF NOT EXISTS skincare_plans (
  id                       SERIAL PRIMARY KEY,
  user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id                INTEGER REFERENCES skin_reports(id) ON DELETE SET NULL,
  skin_type                VARCHAR(40),
  season                   VARCHAR(20),                  -- Spring/Summer/Autumn/Winter
  morning_routine          JSONB DEFAULT '[]',            -- [{step, category, product, reason}]
  evening_routine          JSONB DEFAULT '[]',            -- [{step, category, product, reason}]
  weekly_treatments        JSONB DEFAULT '[]',            -- [{name, frequency, description}]
  seasonal_recommendations JSONB DEFAULT '[]',            -- [{title, description}]
  created_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user ON skincare_plans(user_id);

-- ========== USER SKINCARE PREFERENCES (personalization inputs) ==========
-- One row per user. Feeds the routine generator alongside the latest
-- skin_reports row. All arrays are simple JSONB string arrays so the
-- frontend can render/edit them as multi-select chips without a join.
CREATE TABLE IF NOT EXISTS user_skincare_preferences (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skin_type          VARCHAR(40),                  -- overrides users.skin_type if set; falls back to latest report otherwise
  known_concerns     JSONB DEFAULT '[]',            -- ["acne","dryness",...] user-declared, in addition to AI-detected concerns
  allergies          JSONB DEFAULT '[]',            -- ["fragrance","salicylic acid",...] free-text ingredient/product avoidance list
  activity_level     VARCHAR(20),                   -- 'low' | 'moderate' | 'high'
  outdoor_exposure   VARCHAR(20),                   -- 'low' | 'moderate' | 'high'
  sleep_quality      VARCHAR(20),                   -- 'poor' | 'average' | 'good'
  environment        VARCHAR(30),                   -- 'dry' | 'humid' | 'urban_pollution' | 'coastal' | 'other'
  notes              TEXT,                          -- free-text lifestyle notes the generator's UI can display but not parse
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prefs_user ON user_skincare_preferences(user_id);

-- ========== SKIN HEALTH SCORING ENGINE — data-collection fields (additive) ==========
-- These back the "Complete Your Skin Health Information" intake flow so
-- every one of the 5 weighted factors (Skin Condition 35% / Lifestyle 20%
-- / Sleep 15% / Routine 20% / Hydration 10%) can always be scored from
-- real, user-provided data instead of ever being marked unavailable.
-- All migration-safe (ADD COLUMN IF NOT EXISTS).
ALTER TABLE user_skincare_preferences ADD COLUMN IF NOT EXISTS water_intake_liters NUMERIC(3,1); -- daily water intake, liters/day (0-15); feeds the Hydration Score
ALTER TABLE user_skincare_preferences ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(3,1);          -- average sleep duration, hours/night (0-24); feeds the Sleep Quality Score
ALTER TABLE user_skincare_preferences ADD COLUMN IF NOT EXISTS stress_level VARCHAR(20);          -- 'low' | 'moderate' | 'high'; feeds the Lifestyle Score alongside activity_level
ALTER TABLE user_skincare_preferences ADD COLUMN IF NOT EXISTS concern_severity JSONB DEFAULT '{}'; -- {"Acne":"mild",...} — severity per entry in known_concerns, self-reported when no AI skin_reports row exists yet
ALTER TABLE user_skincare_preferences ADD COLUMN IF NOT EXISTS manual_skin_assessed BOOLEAN NOT NULL DEFAULT FALSE; -- TRUE once the user has explicitly submitted the manual skin-condition questionnaire (even with zero concerns selected) — distinguishes "hasn't answered yet" from "answered: no concerns"

-- Add a nullable FK on skincare_plans back to the preferences snapshot used,
-- so "Why this routine?" can show exactly what inputs produced a given plan
-- even if the user edits their preferences later.
ALTER TABLE skincare_plans ADD COLUMN IF NOT EXISTS preferences_snapshot JSONB;
ALTER TABLE skincare_plans ADD COLUMN IF NOT EXISTS excluded_ingredients JSONB DEFAULT '[]';
ALTER TABLE skincare_plans ADD COLUMN IF NOT EXISTS explanation JSONB DEFAULT '[]';
ALTER TABLE skincare_plans ADD COLUMN IF NOT EXISTS changes_from_previous JSONB DEFAULT '[]';
ALTER TABLE skincare_plans ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '{}';
ALTER TABLE skincare_plans ADD COLUMN IF NOT EXISTS edited_by_user BOOLEAN NOT NULL DEFAULT FALSE;

-- ========== INGREDIENT INTELLIGENCE ==========
-- Standalone catalog of skincare ingredients, independent of any single
-- routine. Queried directly by the Ingredient Intelligence page
-- (search/filter) and by backend/src/services/ingredientIntelligence.js
-- to build a personalized suitable/caution/avoid breakdown for a user's
-- profile. routineGenerator.js's existing rule-based step generation is
-- unchanged — this table is additive, not a replacement for it.
CREATE TABLE IF NOT EXISTS ingredients (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(120) UNIQUE NOT NULL,
  category            VARCHAR(60),                 -- e.g. Active, Humectant, Exfoliant, Sunscreen Filter, Emollient
  description         TEXT,
  benefits            JSONB DEFAULT '[]',           -- ["Brightens tone", "Reduces breakouts", ...]
  suitable_skin_types JSONB DEFAULT '[]',           -- ["Oily","Dry","Combination","Sensitive","Normal"]
  suitable_concerns   JSONB DEFAULT '[]',           -- ["acne","pigmentation",...]
  irritation_potential VARCHAR(20) DEFAULT 'low',   -- 'low' | 'medium' | 'high'
  allergy_notes       TEXT,                         -- free-text sensitivity/allergy guidance
  comedogenic_rating  SMALLINT,                     -- 0-5, nullable when not applicable/known
  usage_guidance      TEXT,
  avoid_with          JSONB DEFAULT '[]',           -- ingredient/product names or conditions to avoid pairing with
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);

-- ========== PRODUCT CATALOG ==========
CREATE TABLE IF NOT EXISTS products (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(150) NOT NULL,
  brand                 VARCHAR(100),
  category              VARCHAR(40) NOT NULL,        -- Cleansing | Exfoliation | Treatment | Moisturizing | Sun Protection | Night Care
  description           TEXT,
  skin_types            JSONB DEFAULT '[]',          -- [] means suitable for all skin types
  skin_concerns         JSONB DEFAULT '[]',          -- concerns this product targets
  ingredients            JSONB DEFAULT '[]',          -- key ingredient names (matched against the ingredients table by name)
  price                 NUMERIC(10,2),                -- nullable — not every seeded product needs one
  usage_instructions     TEXT,
  sensitivity_warnings   JSONB DEFAULT '[]',          -- ingredient/allergen terms this product conflicts with
  product_url            TEXT,                         -- real shop/product page link, when one is known — nullable; never fabricated. The frontend shows "Product link unavailable" when this is NULL.
  created_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Migration-safe: adds product_url on databases where `products` was
-- created before this column existed (the CREATE TABLE IF NOT EXISTS
-- above is a no-op once the table exists, so this ALTER is what actually
-- lands the column on an existing install).
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_url TEXT;

-- ========== PRODUCT SHOPPING + COMPARISON (Milestone 3, additive) ==========
-- Every ALTER below is migration-safe (ADD COLUMN IF NOT EXISTS) so it is
-- a no-op on a database that already has these columns and lands them
-- cleanly on one that doesn't. No existing column is renamed or dropped.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;               -- product photo; nullable — frontend falls back to a category placeholder, never a fabricated photo
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_name VARCHAR(60);       -- e.g. 'Nykaa' | 'Purplle' | 'Amazon' — the retailer product_url points to, when known
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);          -- 0.0–5.0, nullable when no rating is available
ALTER TABLE products ADD COLUMN IF NOT EXISTS fragrance_free BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sensitive_skin_friendly BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_name);

-- ========== PRODUCT RECOMMENDATIONS (audit trail) ==========
-- One row per product recommended to a user as part of a specific
-- skincare_plans generation — lets Admin analytics report on
-- recommendation volume/category mix, and lets a user's "Ingredients &
-- Products" page show exactly what was recommended and why, even after
-- the plan has since been regenerated.
CREATE TABLE IF NOT EXISTS product_recommendations (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id          INTEGER REFERENCES skincare_plans(id) ON DELETE CASCADE,
  report_id        INTEGER REFERENCES skin_reports(id) ON DELETE SET NULL,
  product_id       INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  routine_category VARCHAR(40),
  reason           TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prodrec_user ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_prodrec_plan ON product_recommendations(plan_id);
