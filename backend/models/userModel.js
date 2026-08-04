import { pool, getIsPostgresAvailable } from '../config/db.js';
import bcrypt from 'bcryptjs';

// In-Memory Fallback Store
const fallbackUsers = [
  {
    id: 1,
    name: 'Akash Prajapati',
    email: 'akp73733@gmail.com',
    password: bcrypt.hashSync('#Prem@123', 10),
    role: 'ADMIN',
    provider: 'LOCAL',
    profile_picture: '',
    bio: 'Super Administrator with full multi-role access.',
    phone: '+1 555-7373',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@gmail.com',
    password: bcrypt.hashSync('Password@123', 10),
    role: 'USER',
    provider: 'LOCAL',
    profile_picture: '',
    bio: 'Passionate user seeking personalized skin intelligence.',
    phone: '+1 555-0192',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'Dr. Emily Watson',
    email: 'consultant@skincare.com',
    password: bcrypt.hashSync('Password@123', 10),
    role: 'SKINCARE_CONSULTANT',
    provider: 'LOCAL',
    profile_picture: '',
    bio: 'Senior Skincare Consultant & Routine Specialist.',
    phone: '+1 555-0195',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    name: 'Dr. Michael Chen',
    email: 'dermatologist@skincare.com',
    password: bcrypt.hashSync('Password@123', 10),
    role: 'DERMATOLOGIST',
    provider: 'LOCAL',
    profile_picture: '',
    bio: 'Board-Certified Dermatologist.',
    phone: '+1 555-0196',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    name: 'Sarah Coach',
    email: 'coach@wellness.com',
    password: bcrypt.hashSync('Password@123', 10),
    role: 'WELLNESS_COACH',
    provider: 'LOCAL',
    profile_picture: '',
    bio: 'Certified Skincare & Personal Wellness Consultant.',
    phone: '+1 555-0193',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    name: 'System Admin',
    email: 'admin@wellness.com',
    password: bcrypt.hashSync('Password@123', 10),
    role: 'ADMIN',
    provider: 'LOCAL',
    profile_picture: '',
    bio: 'AI Skincare Platform Administrator.',
    phone: '+1 555-0194',
    created_at: new Date(),
    updated_at: new Date()
  }
];

let nextFallbackId = 7;

export const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  if (getIsPostgresAvailable()) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
      return res.rows[0] || null;
    } catch (err) {
      console.error('PostgreSQL Query Error (findUserByEmail):', err.message);
    }
  }
  return fallbackUsers.find(u => u.email.toLowerCase() === normalizedEmail) || null;
};

export const findUserById = async (id) => {
  const numericId = parseInt(id, 10);
  if (getIsPostgresAvailable()) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [numericId]);
      return res.rows[0] || null;
    } catch (err) {
      console.error('PostgreSQL Query Error (findUserById):', err.message);
    }
  }
  return fallbackUsers.find(u => u.id === numericId) || null;
};

export const createUser = async ({ name, email, password = null, role = 'USER', provider = 'LOCAL', profile_picture = '', bio = '', phone = '' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  if (getIsPostgresAvailable()) {
    try {
      const query = `
        INSERT INTO users (name, email, password, role, provider, profile_picture, bio, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, email, role, provider, profile_picture, bio, phone, created_at, updated_at
      `;
      const values = [name, normalizedEmail, password, role, provider, profile_picture, bio, phone];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error('PostgreSQL Query Error (createUser):', err.message);
    }
  }

  // Fallback memory creation
  const newUser = {
    id: nextFallbackId++,
    name,
    email: normalizedEmail,
    password,
    role,
    provider,
    profile_picture,
    bio,
    phone,
    created_at: new Date(),
    updated_at: new Date()
  };
  fallbackUsers.push(newUser);
  return newUser;
};

export const updateUserProfile = async (id, { name, email, profile_picture, bio, phone }) => {
  const numericId = parseInt(id, 10);
  if (getIsPostgresAvailable()) {
    try {
      const query = `
        UPDATE users
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            profile_picture = COALESCE($3, profile_picture),
            bio = COALESCE($4, bio),
            phone = COALESCE($5, phone),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, name, email, role, provider, profile_picture, bio, phone, created_at, updated_at
      `;
      const values = [name, email, profile_picture, bio, phone, numericId];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error('PostgreSQL Query Error (updateUserProfile):', err.message);
    }
  }

  // Fallback memory update
  const userIndex = fallbackUsers.findIndex(u => u.id === numericId);
  if (userIndex !== -1) {
    if (name) fallbackUsers[userIndex].name = name;
    if (email) fallbackUsers[userIndex].email = email.toLowerCase().trim();
    if (profile_picture !== undefined) fallbackUsers[userIndex].profile_picture = profile_picture;
    if (bio !== undefined) fallbackUsers[userIndex].bio = bio;
    if (phone !== undefined) fallbackUsers[userIndex].phone = phone;
    fallbackUsers[userIndex].updated_at = new Date();
    return fallbackUsers[userIndex];
  }
  return null;
};

export const getAllUsers = async () => {
  if (getIsPostgresAvailable()) {
    try {
      const res = await pool.query('SELECT id, name, email, role, provider, profile_picture, bio, phone, created_at FROM users ORDER BY id ASC');
      return res.rows;
    } catch (err) {
      console.error('PostgreSQL Query Error (getAllUsers):', err.message);
    }
  }
  return fallbackUsers.map(({ password: _password, ...u }) => u);
};
