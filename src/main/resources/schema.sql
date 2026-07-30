-- PostgreSQL Database Schema for AI Skin Intelligence & Personalized Skincare Planner

-- Drop tables if they exist
DROP TABLE IF EXISTS daily_skincare_logs CASCADE;
DROP TABLE IF EXISTS skincare_products CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS personalized_routines CASCADE;
DROP TABLE IF EXISTS skin_assessments CASCADE;
DROP TABLE IF EXISTS skin_profiles CASCADE;
DROP TABLE IF EXISTS health_tips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Roles: USER, SKINCARE_CONSULTANT, DERMATOLOGIST, ADMIN)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- BCrypt Encrypted
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, SKINCARE_CONSULTANT, DERMATOLOGIST, ADMIN
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL', -- LOCAL or GOOGLE
    avatar_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skin Profiles Table
CREATE TABLE skin_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skin_type VARCHAR(50) NOT NULL, -- Oily, Dry, Combination, Sensitive, Normal
    age_group VARCHAR(30) NOT NULL, -- 18-24, 25-34, 35-44, 45+
    skin_concerns TEXT NOT NULL, -- Acne, Hyperpigmentation, Dark Spots, Wrinkles, Redness, etc.
    allergies TEXT,
    sensitivities TEXT,
    lifestyle_habits VARCHAR(100),
    sleep_quality VARCHAR(50), -- Poor, Average, Good, Excellent
    water_intake_ml INT DEFAULT 2000,
    environmental_exposure VARCHAR(100), -- High UV, Urban Pollution, AC/Heating
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Skin Assessments Table (Weighted Scoring Model: Condition 35%, Lifestyle 20%, Sleep 15%, Routine 20%, Hydration 10%)
CREATE TABLE skin_assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skin_condition_score INT NOT NULL,
    lifestyle_score INT NOT NULL,
    sleep_score INT NOT NULL,
    routine_consistency_score INT NOT NULL,
    hydration_score INT NOT NULL,
    overall_skin_health_score INT NOT NULL, -- Weighted sum out of 100
    primary_concern VARCHAR(100) NOT NULL,
    ai_diagnosis TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Personalized Skincare Routines Table
CREATE TABLE personalized_routines (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_of_day VARCHAR(30) NOT NULL, -- MORNING, EVENING, WEEKLY
    step_number INT NOT NULL,
    category VARCHAR(50) NOT NULL, -- CLEANSING, EXFOLIATION, TREATMENT, MOISTURIZING, SUN_PROTECTION, NIGHT_CARE
    step_name VARCHAR(150) NOT NULL,
    instructions TEXT NOT NULL,
    recommended_ingredient VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ingredients Database Table
CREATE TABLE ingredients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs
    description TEXT NOT NULL,
    suitable_skin_types VARCHAR(150) NOT NULL,
    conflicting_ingredients TEXT,
    benefits TEXT NOT NULL
);

-- 6. Skincare Products Table
CREATE TABLE skincare_products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Face Wash, Moisturizer, Sunscreen, Serum, Toner, Mask, Treatment
    key_ingredients VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.5,
    suitable_skin_types VARCHAR(150) NOT NULL,
    target_concerns VARCHAR(255) NOT NULL,
    product_url VARCHAR(255)
);

-- 7. Daily Skincare Logs Table
CREATE TABLE daily_skincare_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    morning_routine_completed BOOLEAN DEFAULT FALSE,
    evening_routine_completed BOOLEAN DEFAULT FALSE,
    water_intake_ml INT DEFAULT 0,
    sleep_hours DECIMAL(4, 1) DEFAULT 7.0,
    skin_condition_rating INT DEFAULT 5, -- 1 to 10
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
