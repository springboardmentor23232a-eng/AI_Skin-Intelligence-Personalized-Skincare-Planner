-- AI Skin Intelligence – Personalized Skincare Planner
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
