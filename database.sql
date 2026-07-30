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
('Sarah Coach', 'coach@wellness.com', '$2a$10$E.yT5gG.T7N2q7K7z3V5ue/yF8z.yWnE/9K.3S8G.S9V0uK2H.5uO', 'WELLNESS_COACH', 'LOCAL', 'Certified Skincare & Personal Wellness Consultant.', '+1 555-0193'),
('System Admin', 'admin@wellness.com', '$2a$10$E.yT5gG.T7N2q7K7z3V5ue/yF8z.yWnE/9K.3S8G.S9V0uK2H.5uO', 'ADMIN', 'LOCAL', 'AI Skincare Platform Administrator.', '+1 555-0194')
ON CONFLICT (email) DO NOTHING;
