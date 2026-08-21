-- ====================================================
-- MODULE 1: POSTGRESQL DATABASE SCHEMA & SEED DATA
-- ====================================================
-- Host: localhost | Port: 7410 | Database: ai_skincare
-- Username: postgres | Password: asdfghjkl
-- ====================================================

-- Create Database (Run if database does not exist)
-- CREATE DATABASE ai_skincare;

-- Connect to database
-- \c ai_skincare;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(30) DEFAULT 'USER',
    provider VARCHAR(20) DEFAULT 'LOCAL',
    profile_picture TEXT,
    bio TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Demo Users (BCrypt hashed password for "Password@123")
-- Hash: $2a$10$E.yT5gG.T7N2q7K7z3V5ue/yF8z.yWnE/9K.3S8G.S9V0uK2H.5uO
INSERT INTO users (name, email, password, role, provider, bio, phone)
VALUES 
('John Doe', 'john@gmail.com', '$2a$10$E.yT5gG.T7N2q7K7z3V5ue/yF8z.yWnE/9K.3S8G.S9V0uK2H.5uO', 'USER', 'LOCAL', 'Passionate developer aiming for skill growth and peak health.', '+1 555-0192'),
('System Admin', 'admin@wellness.com', '$2a$10$E.yT5gG.T7N2q7K7z3V5ue/yF8z.yWnE/9K.3S8G.S9V0uK2H.5uO', 'ADMIN', 'LOCAL', 'AI Skincare Platform Administrator.', '+1 555-0194')
ON CONFLICT (email) DO NOTHING;

-- ====================================================
-- MODULE 3: SKIN ASSESSMENT ENGINE SCHEMA
-- ====================================================

-- 1. SkinAssessment Table
CREATE TABLE IF NOT EXISTS skin_assessments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    skin_health_score INT NOT NULL CHECK (skin_health_score BETWEEN 0 AND 100),
    overall_condition VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skin_assessments_user_id ON skin_assessments(user_id);

-- 2. SkinConcern Table
CREATE TABLE IF NOT EXISTS skin_concerns (
    id SERIAL PRIMARY KEY,
    assessment_id INT NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
    concern_name VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    priority VARCHAR(30) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skin_concerns_assessment_id ON skin_concerns(assessment_id);

-- 3. RiskFactor Table
CREATE TABLE IF NOT EXISTS risk_factors (
    id SERIAL PRIMARY KEY,
    assessment_id INT NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
    risk_name VARCHAR(100) NOT NULL,
    description TEXT,
    risk_level VARCHAR(30) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_factors_assessment_id ON risk_factors(assessment_id);

-- ====================================================
-- MODULE 4: ROUTINE GENERATION SCHEMA
-- ====================================================

CREATE TABLE IF NOT EXISTS personalized_routines (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_of_day VARCHAR(30) NOT NULL, -- MORNING, EVENING, WEEKLY, SEASONAL
    step_number INT NOT NULL,
    category VARCHAR(50) NOT NULL, -- CLEANSER, EXFOLIATION, TREATMENT, MOISTURIZER, SUN_PROTECTION, NIGHT_CARE, MASK, SEASONAL_CARE
    step_name VARCHAR(150) NOT NULL,
    instructions TEXT NOT NULL,
    recommended_ingredient VARCHAR(100),
    season VARCHAR(30) DEFAULT 'ALL_SEASONS', -- ALL_SEASONS, SUMMER, WINTER, SPRING, AUTUMN
    created_by_role VARCHAR(30) DEFAULT 'SYSTEM_AI', -- PATIENT, DOCTOR, CONSULTANT, SYSTEM_AI
    doctor_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_personalized_routines_user_id ON personalized_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_routines_time_of_day ON personalized_routines(time_of_day);

-- ====================================================
-- MODULE 5: INGREDIENT INTELLIGENCE ENGINE SCHEMA
-- ====================================================

CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- ACTIVE, MOISTURIZER, EXFOLIANT, ANTIOXIDANT, SUNSCREEN
    comedogenic_rating INT DEFAULT 0 CHECK (comedogenic_rating BETWEEN 0 AND 5),
    target_skin_types VARCHAR(150), -- Oily, Dry, Sensitive, Combination, Normal
    target_concerns VARCHAR(255), -- Acne, Hyperpigmentation, Aging, Redness, Dehydration
    description TEXT,
    benefits TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredient_conflicts (
    id SERIAL PRIMARY KEY,
    ingredient_a VARCHAR(100) NOT NULL,
    ingredient_b VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL, -- HIGH, MEDIUM, LOW
    warning_message TEXT NOT NULL,
    recommendation TEXT
);

-- ====================================================
-- MODULE 6: PRODUCT RECOMMENDATION ENGINE SCHEMA
-- ====================================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Cleanser, Serum, Moisturizer, Sunscreen, Exfoliant, Mask
    active_ingredients TEXT NOT NULL,
    target_skin_types VARCHAR(150) NOT NULL,
    target_concerns VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.5,
    reviews_count INT DEFAULT 120,
    image_url TEXT,
    buy_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- MODULE 7: PROGRESS TRACKING & ANALYTICS SCHEMA
-- ====================================================

CREATE TABLE IF NOT EXISTS skin_progress_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE,
    skin_score INT NOT NULL CHECK (skin_score BETWEEN 0 AND 100),
    moisture_level INT NOT NULL CHECK (moisture_level BETWEEN 0 AND 100),
    acne_severity VARCHAR(30) DEFAULT 'Low', -- None, Low, Medium, High
    redness_level VARCHAR(30) DEFAULT 'Low', -- None, Low, Medium, High
    routine_completed BOOLEAN DEFAULT TRUE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skin_progress_logs_user_id ON skin_progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_progress_logs_log_date ON skin_progress_logs(log_date);
