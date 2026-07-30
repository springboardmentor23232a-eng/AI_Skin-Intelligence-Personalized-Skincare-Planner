import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

// Default PostgreSQL Configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'panacea_skin_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432', 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

let realPool = null;
let isConnectedToPostgres = false;

try {
  realPool = new Pool(dbConfig);
  // Handle silent background errors
  realPool.on('error', (err) => {
    console.warn('[PostgreSQL Pool Warning] Real database pool encountered an error:', err.message);
    isConnectedToPostgres = false;
  });
} catch (e) {
  console.warn('[PostgreSQL Init Warning] Failed to construct Pool:', e.message);
}

// In-Memory Storage Engine for Seamless Fallback
const inMemoryStore = {
  users: [
    {
      id: 1,
      username: 'user',
      email: 'user@panacea.ai',
      password_hash: bcrypt.hashSync('user123', 10),
      role: 'user',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'consultant',
      email: 'consultant@panacea.ai',
      password_hash: bcrypt.hashSync('consultant123', 10),
      role: 'consultant',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'doctor',
      email: 'doctor@panacea.ai',
      password_hash: bcrypt.hashSync('doctor123', 10),
      role: 'dermatologist',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      username: 'admin',
      email: 'admin@panacea.ai',
      password_hash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: new Date().toISOString()
    }
  ],
  skin_scores: [
    {
      id: 1,
      user_id: 1,
      overall_score: 78,
      breakdown: JSON.stringify([
        { name: 'Skin Condition', score: 85 },
        { name: 'Lifestyle & Routine', score: 70 },
        { name: 'Sleep Quality', score: 75 },
        { name: 'Consistency', score: 80 },
        { name: 'Hydration Level', score: 72 }
      ]),
      scan_date: new Date().toISOString()
    }
  ],
  consultations: [
    {
      id: 1,
      patient_name: 'Alex Rivera',
      condition: 'Moderate Acne & Hyperpigmentation',
      status: 'Prescribed',
      dermatologist: 'Dr. Elena Rostova',
      prescription: 'Topical Adapalene 0.1% + Niacinamide 5%',
      date: new Date().toISOString()
    }
  ],
  products: [
    { id: 1, name: 'Gentle Hydrating Cleanser', brand: 'CeraVe', score_match: 96, category: 'Cleanser' },
    { id: 2, name: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', score_match: 94, category: 'Serum' },
    { id: 3, name: 'Daily Barrier Cream', brand: 'La Roche-Posay', score_match: 91, category: 'Moisturizer' }
  ]
};

export async function query(text, params = []) {
  if (realPool && isConnectedToPostgres) {
    try {
      return await realPool.query(text, params);
    } catch (err) {
      console.warn('[PostgreSQL Query Fallback] Database query failed, falling back to Memory Pool:', err.message);
      isConnectedToPostgres = false;
    }
  }

  // Parse simple SQL queries for In-Memory Fallback
  const cleanText = text.trim();

  // SELECT user by username or email
  if (cleanText.includes('FROM users WHERE username = $1 OR email = $1') || cleanText.includes('FROM users WHERE username = $1')) {
    const searchVal = (params[0] || '').toLowerCase();
    const found = inMemoryStore.users.filter(u => u.username.toLowerCase() === searchVal || u.email.toLowerCase() === searchVal);
    return { rows: found, rowCount: found.length };
  }

  // SELECT user by ID
  if (cleanText.includes('FROM users WHERE id = $1')) {
    const idVal = parseInt(params[0], 10);
    const found = inMemoryStore.users.filter(u => u.id === idVal);
    return { rows: found, rowCount: found.length };
  }

  // SELECT user by google_id
  if (cleanText.includes('FROM users WHERE google_id = $1')) {
    const googleId = params[0];
    const found = inMemoryStore.users.filter(u => u.google_id === googleId);
    return { rows: found, rowCount: found.length };
  }

  // DELETE FROM users
  if (cleanText.includes('DELETE FROM users WHERE id = $1')) {
    const idVal = parseInt(params[0], 10);
    const initialLen = inMemoryStore.users.length;
    inMemoryStore.users = inMemoryStore.users.filter(u => u.id !== idVal);
    return { rows: [], rowCount: initialLen - inMemoryStore.users.length };
  }

  // SELECT all users
  if (cleanText.includes('FROM users') && !cleanText.includes('WHERE')) {
    return { rows: inMemoryStore.users, rowCount: inMemoryStore.users.length };
  }

  // UPDATE users SET status
  if (cleanText.includes('UPDATE users SET status')) {
    const statusVal = params[0];
    const target = params[1];
    const userObj = inMemoryStore.users.find(u => u.id === parseInt(target, 10) || u.username === target);
    if (userObj) {
      userObj.status = statusVal;
      return { rows: [userObj], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO users
  if (cleanText.includes('INSERT INTO users')) {
    const newUser = {
      id: inMemoryStore.users.length + 1,
      username: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'user',
      status: params[4] || 'pending_approval',
      google_id: params[5] || null,
      avatar_url: params[6] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: new Date().toISOString()
    };
    inMemoryStore.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // SELECT skin_scores
  if (cleanText.includes('FROM skin_scores')) {
    return { rows: inMemoryStore.skin_scores, rowCount: inMemoryStore.skin_scores.length };
  }

  // SELECT consultations
  if (cleanText.includes('FROM consultations')) {
    return { rows: inMemoryStore.consultations, rowCount: inMemoryStore.consultations.length };
  }

  // SELECT products
  if (cleanText.includes('FROM products')) {
    return { rows: inMemoryStore.products, rowCount: inMemoryStore.products.length };
  }

  // Generic fallback query response
  return { rows: [], rowCount: 0 };
}

export async function testConnection() {
  if (!realPool) return false;
  try {
    const client = await realPool.connect();
    client.release();
    isConnectedToPostgres = true;
    console.log('Successfully connected to live PostgreSQL database.');
    return true;
  } catch (err) {
    console.log('[PostgreSQL Connection Info] Live PostgreSQL not available on localhost. Operating in Mock PostgreSQL Pool mode.');
    isConnectedToPostgres = false;
    return false;
  }
}

export function getInMemoryStore() {
  return inMemoryStore;
}

export default {
  query,
  testConnection,
  getInMemoryStore
};
