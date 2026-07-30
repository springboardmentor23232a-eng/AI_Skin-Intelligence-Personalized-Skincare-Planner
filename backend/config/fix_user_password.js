import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '7410', 10),
  database: process.env.DB_NAME || 'ai_skincare',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'asdfghjkl',
});

async function fixPassword() {
  try {
    const client = await pool.connect();
    const hash = await bcrypt.hash('#Prem@123', 10);
    console.log("Generated Hash for #Prem@123:", hash);

    await client.query(`
      INSERT INTO users (name, email, password, role, provider, bio, phone)
      VALUES ('Akash Prajapati', 'akp73733@gmail.com', $1, 'ADMIN', 'LOCAL', 'Super Administrator', '+1 555-7373')
      ON CONFLICT (email) DO UPDATE 
      SET password = $1, role = 'ADMIN', provider = 'LOCAL';
    `, [hash]);

    console.log("SUCCESS: Updated akp73733@gmail.com in PostgreSQL with hash!");
    client.release();
    pool.end();
  } catch (err) {
    console.error("Error fixing password:", err);
  }
}

fixPassword();
