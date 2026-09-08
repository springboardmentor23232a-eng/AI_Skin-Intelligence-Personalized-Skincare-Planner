import pg from 'pg';
import dotenv from 'dotenv';
import { hashPassword } from '../utils/passwordUtils.js';

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool using node-postgres (pg)
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '7410', 10),
  database: process.env.DB_NAME || 'ai_skincare',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'asdfghjkl',
});

let isPostgresAvailable = false;

// Initialize Database & Create Users Table
export const initDb = async () => {
  try {
    const client = await pool.connect();
    isPostgresAvailable = true;
    console.log(`[PostgreSQL] Connected successfully to database '${process.env.DB_NAME || 'ai_skincare'}' on port ${process.env.DB_PORT || 7410}`);

    // Create Users table automatically if it doesn't exist
    await client.query(`
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
        specialty VARCHAR(100),
        license_number VARCHAR(100),
        experience_years VARCHAR(50),
        qualification VARCHAR(150),
        hospital_clinic VARCHAR(150),
        consultation_fee VARCHAR(50),
        availability_status VARCHAR(50) DEFAULT 'Available',
        skin_type VARCHAR(50),
        skin_concerns TEXT,
        allergies TEXT,
        admin_role_title VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist for schema compatibility
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification VARCHAR(150);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_clinic VARCHAR(150);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS consultation_fee VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'Available';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS skin_type VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS skin_concerns TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role_title VARCHAR(100);
    `);

    // Generate BCrypt hashes for seed accounts
    const seedHash = await hashPassword('Password@123');
    const customUserHash = await hashPassword('#Prem@123');

    // Seed/Upsert User: akp73733@gmail.com with Super ADMIN Role
    await client.query(`
      INSERT INTO users (name, email, password, role, provider, bio, phone, admin_role_title, availability_status)
      VALUES ('Akash Prajapati', 'akp73733@gmail.com', '${customUserHash}', 'ADMIN', 'LOCAL', 'Super Administrator with full multi-role access.', '+1 555-7373', 'Super Administrator & Security Lead', 'Active')
      ON CONFLICT (email) DO UPDATE 
      SET password = '${customUserHash}', role = 'ADMIN', admin_role_title = 'Super Administrator & Security Lead';
    `);

    // Seed Demo Users into PostgreSQL if not present
    await client.query(`
      INSERT INTO users (name, email, password, role, provider, bio, phone, specialty, license_number, experience_years, qualification, hospital_clinic, consultation_fee, availability_status, skin_type, skin_concerns, allergies, admin_role_title)
      VALUES 
      ('John Doe', 'john@gmail.com', '${seedHash}', 'USER', 'LOCAL', 'Passionate user seeking personalized skin intelligence.', '+1 555-0192', NULL, NULL, NULL, NULL, NULL, NULL, 'Active Member', 'Combination', 'Acne, Hyperpigmentation, Redness', 'Fragrance sensitivity', NULL),
      ('Dr. Emily Watson', 'consultant@skincare.com', '${seedHash}', 'SKINCARE_CONSULTANT', 'LOCAL', 'Senior Skincare Consultant & Routine Specialist.', '+1 555-0195', 'Barrier Repair & Anti-Aging', 'SC-449102', '8 Years', 'Certified Aesthetician', 'SkinIntelligence Wellness Center', '$85 / session', 'Available', NULL, NULL, NULL, NULL),
      ('Dr. Michael Chen', 'dermatologist@skincare.com', '${seedHash}', 'DERMATOLOGIST', 'LOCAL', 'Board-Certified Dermatologist specializing in clinical acne & psoriasis.', '+1 555-0196', 'Clinical & Surgical Dermatology', 'MD-8839201', '14 Years', 'MD, FAAD (Fellow of American Academy of Dermatology)', 'Metro Dermatology & Laser Center', '$150 / session', 'Available', NULL, NULL, NULL, NULL),
      ('System Admin', 'admin@wellness.com', '${seedHash}', 'ADMIN', 'LOCAL', 'AI Skincare Platform Administrator.', '+1 555-0194', NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, 'System Administrator')
      ON CONFLICT (email) DO NOTHING;
    `);

    client.release();
    console.log('[PostgreSQL] Users table verified and seed accounts initialized (akp73733@gmail.com ready).');
  } catch (err) {
    console.warn(`[PostgreSQL Warning] Could not connect to PostgreSQL on port ${process.env.DB_PORT || 7410}: ${err.message}`);
    console.warn('[PostgreSQL Note] Backend will utilize memory store fallback if database service is starting or offline.');
    isPostgresAvailable = false;
  }
};

export const getIsPostgresAvailable = () => isPostgresAvailable;
