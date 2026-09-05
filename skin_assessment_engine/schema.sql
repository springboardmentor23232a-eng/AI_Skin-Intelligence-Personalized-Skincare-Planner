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

-- 5. Ingredient Intelligence Module Tables (Module 5)
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    chemical_name VARCHAR(200),
    category VARCHAR(100) NOT NULL, -- Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs
    description TEXT NOT NULL,
    primary_benefit TEXT NOT NULL,
    recommended_conc_range VARCHAR(50) DEFAULT '0.5% - 5%',
    comedogenicity_rating INT DEFAULT 0 CHECK (comedogenicity_rating >= 0 AND comedogenicity_rating <= 5),
    irritant_rating INT DEFAULT 0 CHECK (irritant_rating >= 0 AND irritant_rating <= 5),
    target_skin_types JSONB DEFAULT '["All"]',
    suitable_concerns JSONB DEFAULT '[]',
    avoid_concerns JSONB DEFAULT '[]',
    usage_tips TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);

CREATE TABLE IF NOT EXISTS ingredient_interactions (
    id SERIAL PRIMARY KEY,
    ingredient_a VARCHAR(150) NOT NULL,
    ingredient_b VARCHAR(150) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('Conflict', 'Synergy', 'Caution')),
    severity VARCHAR(50) DEFAULT 'Moderate' CHECK (severity IN ('Low', 'Moderate', 'High', 'Severe', 'Synergistic')),
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingredient_interactions_pair ON ingredient_interactions(ingredient_a, ingredient_b);

-- 6. Product Recommendation Engine Tables (Module 6)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, Face Masks
    price NUMERIC(10, 2) NOT NULL,
    budget_tier VARCHAR(50) NOT NULL CHECK (budget_tier IN ('Budget', 'Mid-Range', 'Premium')),
    rating NUMERIC(3, 2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5.0),
    key_active_ingredients JSONB NOT NULL,
    full_ingredient_list JSONB NOT NULL,
    target_concerns JSONB NOT NULL,
    suitable_skin_types JSONB NOT NULL,
    comedogenic_level INT DEFAULT 0,
    image_url TEXT,
    buy_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_budget ON products(budget_tier);

CREATE TABLE IF NOT EXISTS product_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_id INT REFERENCES skin_assessments(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    suitability_score NUMERIC(5, 2) NOT NULL CHECK (suitability_score >= 0 AND suitability_score <= 100),
    recommendation_reason TEXT,
    match_tier VARCHAR(50) DEFAULT 'High Match',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_recs_user ON product_recommendations(user_id);

-- 7. Routine Adherence & Scoring History Table (Module 7)
CREATE TABLE IF NOT EXISTS routine_adherence_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    routine_type VARCHAR(50) NOT NULL CHECK (routine_type IN ('Morning', 'Evening', 'Weekly')),
    steps_completed INT NOT NULL DEFAULT 0,
    total_steps INT NOT NULL DEFAULT 4,
    adherence_percentage NUMERIC(5, 2) DEFAULT 100.0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_routine_adherence_user ON routine_adherence_logs(user_id, log_date);

-- 8. Progress Tracking & Analytics Tables (Module 8)
CREATE TABLE IF NOT EXISTS skin_progress_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_id INT REFERENCES skin_assessments(id) ON DELETE SET NULL,
    log_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    checkpoint_title VARCHAR(150) NOT NULL DEFAULT 'Routine Checkpoint',
    tag VARCHAR(50) DEFAULT 'Milestone',
    overall_skin_health_score NUMERIC(5, 2) NOT NULL,
    hydration_level NUMERIC(5, 2) DEFAULT 50.0,
    oiliness_level NUMERIC(5, 2) DEFAULT 50.0,
    sensitivity_level NUMERIC(5, 2) DEFAULT 20.0,
    acne_severity NUMERIC(5, 2) DEFAULT 10.0,
    pigmentation_score NUMERIC(5, 2) DEFAULT 15.0,
    wrinkles_score NUMERIC(5, 2) DEFAULT 10.0,
    barrier_strength NUMERIC(5, 2) DEFAULT 65.0,
    redness_reactivity NUMERIC(5, 2) DEFAULT 20.0,
    photo_url TEXT,
    routine_adherence_rate NUMERIC(5, 2) DEFAULT 85.0,
    clinical_notes TEXT,
    key_improvements JSONB DEFAULT '[]',
    active_concerns_snapshot JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_progress_logs_user ON skin_progress_logs(user_id, log_date DESC);

CREATE TABLE IF NOT EXISTS routine_adherence_records (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    record_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    morning_completed INT DEFAULT 0,
    morning_total INT DEFAULT 4,
    evening_completed INT DEFAULT 0,
    evening_total INT DEFAULT 5,
    weekly_treatment_done INT DEFAULT 0,
    overall_adherence_pct NUMERIC(5, 2) DEFAULT 100.0,
    current_streak_days INT DEFAULT 1,
    water_intake_ml INT DEFAULT 2000,
    sunscreen_reapplied INT DEFAULT 1,
    missed_step_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adherence_records_user ON routine_adherence_records(user_id, record_date DESC);

CREATE TABLE IF NOT EXISTS before_after_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    baseline_log_id INT NOT NULL REFERENCES skin_progress_logs(id) ON DELETE CASCADE,
    current_log_id INT NOT NULL REFERENCES skin_progress_logs(id) ON DELETE CASCADE,
    days_elapsed INT DEFAULT 30,
    score_delta NUMERIC(5, 2) NOT NULL,
    verdict VARCHAR(100) DEFAULT 'Significant Improvement',
    clinical_analysis TEXT NOT NULL,
    biomarker_deltas JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_before_after_user ON before_after_comparisons(user_id);


