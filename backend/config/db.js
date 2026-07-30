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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist for schema compatibility
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    `);

    // Generate BCrypt hashes for seed accounts
    const seedHash = await hashPassword('Password@123');
    const customUserHash = await hashPassword('#Prem@123');

    // Seed/Upsert User: akp73733@gmail.com with Super ADMIN Role
    await client.query(`
      INSERT INTO users (name, email, password, role, provider, bio, phone)
      VALUES ('Akash Prajapati', 'akp73733@gmail.com', '${customUserHash}', 'ADMIN', 'LOCAL', 'Super Administrator with full multi-role access.', '+1 555-7373')
      ON CONFLICT (email) DO UPDATE 
      SET password = '${customUserHash}', role = 'ADMIN';
    `);

    // Seed Demo Users into PostgreSQL if not present
    await client.query(`
      INSERT INTO users (name, email, password, role, provider, bio, phone)
      VALUES 
      ('John Doe', 'john@gmail.com', '${seedHash}', 'USER', 'LOCAL', 'Passionate user seeking personalized skin intelligence.', '+1 555-0192'),
      ('Dr. Emily Watson', 'consultant@skincare.com', '${seedHash}', 'SKINCARE_CONSULTANT', 'LOCAL', 'Senior Skincare Consultant & Routine Specialist.', '+1 555-0195'),
      ('Dr. Michael Chen', 'dermatologist@skincare.com', '${seedHash}', 'DERMATOLOGIST', 'LOCAL', 'Board-Certified Dermatologist.', '+1 555-0196'),
      ('Sarah Coach', 'coach@wellness.com', '${seedHash}', 'WELLNESS_COACH', 'LOCAL', 'Certified Skincare & Personal Wellness Consultant.', '+1 555-0193'),
      ('System Admin', 'admin@wellness.com', '${seedHash}', 'ADMIN', 'LOCAL', 'AI Skincare Platform Administrator.', '+1 555-0194')
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
