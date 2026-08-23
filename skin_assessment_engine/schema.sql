-- PostgreSQL Schema for Module 3: Skin Assessment Engine
-- AI Skin Intelligence & Personalized Skincare Planner

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Skin Assessment Main Table
CREATE TABLE IF NOT EXISTS skin_assessments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    skin_type VARCHAR(50) NOT NULL DEFAULT 'Combination', -- Dry, Oily, Combination, Normal, Sensitive
    skin_health_score NUMERIC(5, 2) NOT NULL CHECK (skin_health_score >= 0 AND skin_health_score <= 100),
    overall_condition VARCHAR(100) NOT NULL, -- Optimal, Good, Moderate Concern, High Risk / Action Required
    hydration_level NUMERIC(5, 2) DEFAULT 50.0 CHECK (hydration_level >= 0 AND hydration_level <= 100),
    oiliness_level NUMERIC(5, 2) DEFAULT 50.0 CHECK (oiliness_level >= 0 AND oiliness_level <= 100),
    sensitivity_level NUMERIC(5, 2) DEFAULT 20.0 CHECK (sensitivity_level >= 0 AND sensitivity_level <= 100),
    acne_severity NUMERIC(5, 2) DEFAULT 10.0 CHECK (acne_severity >= 0 AND acne_severity <= 100),
    pigmentation_score NUMERIC(5, 2) DEFAULT 15.0 CHECK (pigmentation_score >= 0 AND pigmentation_score <= 100),
    wrinkles_score NUMERIC(5, 2) DEFAULT 10.0 CHECK (wrinkles_score >= 0 AND wrinkles_score <= 100),
    sun_exposure_hours NUMERIC(4, 2) DEFAULT 2.0,
    spf_frequency VARCHAR(50) DEFAULT 'Daily', -- Never, Occasional, Daily, Reapplied
    sleep_hours NUMERIC(4, 2) DEFAULT 7.5,
    stress_level INT DEFAULT 4 CHECK (stress_level >= 1 AND stress_level <= 10),
    
    -- Advanced Clinical Assessment Criteria (NEW)
    climate_environment VARCHAR(100) DEFAULT 'Temperate & Balanced',
    water_intake_liters NUMERIC(4, 2) DEFAULT 2.0,
    exfoliation_frequency VARCHAR(100) DEFAULT '1-2 Times/Week',
    fitzpatrick_phototype VARCHAR(100) DEFAULT 'Type III (Medium)',
    makeup_usage VARCHAR(100) DEFAULT 'Light Minimal Makeup',
    hormonal_phase VARCHAR(100) DEFAULT 'Not Applicable / Balanced',
    primary_skin_goal VARCHAR(150) DEFAULT 'Barrier Repair & Hydration',
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index on user_id and assessment_date for fast querying & history timeline retrieval
CREATE INDEX IF NOT EXISTS idx_skin_assessments_user_id ON skin_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_assessments_date ON skin_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_skin_assessments_user_date ON skin_assessments(user_id, assessment_date DESC);

-- 2. Skin Concern Identified Table
CREATE TABLE IF NOT EXISTS skin_concerns (
    id SERIAL PRIMARY KEY,
    assessment_id INT NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
    concern_name VARCHAR(150) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe', 'Critical')),
    priority INT NOT NULL CHECK (priority >= 1),
    category VARCHAR(100) DEFAULT 'General', -- Inflammatory, Moisture, Pigmentary, Structural
    description TEXT,
    recommended_ingredients JSONB,
    routine_advice TEXT,
    avoid_ingredients JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skin_concerns_assessment_id ON skin_concerns(assessment_id);
CREATE INDEX IF NOT EXISTS idx_skin_concerns_priority ON skin_concerns(priority ASC);

-- 3. Risk Factor Analysis Table
CREATE TABLE IF NOT EXISTS risk_factors (
    id SERIAL PRIMARY KEY,
    assessment_id INT NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
    risk_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_score NUMERIC(5, 2) DEFAULT 50.0,
    affected_areas VARCHAR(255) DEFAULT 'Full Face',
    mitigation_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_factors_assessment_id ON risk_factors(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_factors_level ON risk_factors(risk_level);

-- 4. Personalized Routine Generator Table (Module 4)
CREATE TABLE IF NOT EXISTS skin_routines (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_id INT REFERENCES skin_assessments(id) ON DELETE CASCADE,
    season VARCHAR(50) DEFAULT 'Summer',
    morning_routine JSONB NOT NULL,
    evening_routine JSONB NOT NULL,
    weekly_plan JSONB NOT NULL,
    seasonal_tips JSONB NOT NULL,
    adaptive_notes JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skin_routines_user_id ON skin_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_routines_assessment_id ON skin_routines(assessment_id);

-- Trigger to automatically update `updated_at` on skin_assessments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at_skin_assessments ON skin_assessments;
CREATE TRIGGER set_updated_at_skin_assessments
BEFORE UPDATE ON skin_assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

