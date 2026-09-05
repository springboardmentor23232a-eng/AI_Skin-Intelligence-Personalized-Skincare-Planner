import bcrypt from 'bcryptjs';
import db from '../config/db.js';

export async function initAndSeedDb() {
  const isPostgres = await db.testConnection();
  if (!isPostgres) {
    console.log('[Seed Engine] Standard PostgreSQL server not active on localhost. Using In-Memory Database Pool.');
    return;
  }

  try {
    console.log('[Seed Engine] Initializing database tables...');

    // Create Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active';

      CREATE TABLE IF NOT EXISTS skin_scores (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        overall_score INT NOT NULL,
        breakdown JSONB NOT NULL,
        scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(255) NOT NULL,
        condition VARCHAR(255) NOT NULL,
        status VARCHAR(100) NOT NULL DEFAULT 'Pending',
        dermatologist VARCHAR(255),
        prescription TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        score_match INT DEFAULT 90
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        conversation_id VARCHAR(100) NOT NULL,
        sender_id VARCHAR(50) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        sender_avatar TEXT,
        recipient_id VARCHAR(50) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_role VARCHAR(50) NOT NULL,
        recipient_avatar TEXT,
        message TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Initial Demo Users
    const userPass = await bcrypt.hash('user123', 10);
    const consultantPass = await bcrypt.hash('consultant123', 10);
    const doctorPass = await bcrypt.hash('doctor123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);

    const demoUsers = [
      ['user', 'user@panacea.ai', userPass, 'user', 'active'],
      ['consultant', 'consultant@panacea.ai', consultantPass, 'consultant', 'active'],
      ['doctor', 'doctor@panacea.ai', doctorPass, 'dermatologist', 'active'],
      ['admin', 'admin@panacea.ai', adminPass, 'admin', 'active']
    ];

    for (const [username, email, passwordHash, role, status] of demoUsers) {
      await db.query(`
        INSERT INTO users (username, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = EXCLUDED.status, role = EXCLUDED.role;
      `, [username, email, passwordHash, role, status]);
    }

    console.log('[Seed Engine] Initial database seed complete.');
  } catch (err) {
    console.error('[Seed Engine Error]', err.message);
  }
}

// Auto-run if executed directly from CLI
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  initAndSeedDb().then(() => process.exit(0));
}
