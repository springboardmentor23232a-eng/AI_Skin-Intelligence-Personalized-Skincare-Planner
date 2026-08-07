/**
 * Initializes the database: creates tables (schema.sql) then inserts demo
 * accounts for all four roles with properly bcrypt-hashed passwords.
 *
 * Run with:  npm run db:init   (after configuring .env)
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
// db.js loads backend/.env itself (anchored to its own file location, not
// process.cwd()), so requiring it here is enough — no separate dotenv call
// needed in this file.
const pool = require('../config/db');

const DEMO_PASSWORD = 'Password@123';

const demoUsers = [
  { name: 'Admin User', email: 'admin@skinintel.com', role: 'ADMIN' },
  { name: 'Dr. Ayesha Rao', email: 'doctor@skinintel.com', role: 'DOCTOR' },
  { name: 'Priya Consultant', email: 'consultant@skinintel.com', role: 'CONSULTANT' },
  { name: 'Sample User', email: 'user@skinintel.com', role: 'USER' },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('→ Creating schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✓ Schema ready.');

    console.log('→ Seeding demo accounts (password for all: "Password@123")...');
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const u of demoUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password, role, provider)
         VALUES ($1, $2, $3, $4, 'LOCAL')
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [u.name, u.email, hash, u.role]
      );

      if (rows[0]) {
        const userId = rows[0].id;
        if (u.role === 'DOCTOR') {
          await client.query(
            `INSERT INTO doctor_profiles (user_id, specialization, qualification, experience_years, bio)
             VALUES ($1, 'Clinical Dermatology', 'MBBS, MD (Dermatology)', 8,
                     'Focused on acne, pigmentation and eczema management.')
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
        }
        if (u.role === 'CONSULTANT') {
          await client.query(
            `INSERT INTO consultant_profiles (user_id, specialization, experience_years, bio)
             VALUES ($1, 'Skincare & Product Consulting', 5,
                     'Helps users build routines and pick the right products.')
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
        }
      }
    }

    console.log('✓ Demo accounts ready:');
    demoUsers.forEach((u) => console.log(`   ${u.role.padEnd(10)} ${u.email}  /  Password@123`));
    console.log('Done.');
  } catch (err) {
    console.error('Init failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
