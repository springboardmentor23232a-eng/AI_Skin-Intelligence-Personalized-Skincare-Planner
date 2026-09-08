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
    admin_role_title: 'Super Administrator & Security Lead',
    availability_status: 'Active',
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
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    bio: 'Passionate user seeking personalized skin intelligence and science-backed routines.',
    phone: '+1 555-0192',
    skin_type: 'Combination',
    skin_concerns: 'Acne, Hyperpigmentation, Redness',
    allergies: 'Fragrance, High-concentration Benzoyl Peroxide',
    availability_status: 'Active Member',
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
    profile_picture: 'https://images.unsplash.com/photo-1594824813566-88855ce78c90?w=300',
    bio: 'Senior Skincare Consultant specializing in custom routine design and active ingredient synergy.',
    phone: '+1 555-0195',
    specialty: 'Barrier Repair & Anti-Aging',
    license_number: 'SC-449102',
    experience_years: '8 Years',
    qualification: 'Certified Aesthetician & Dermal Specialist',
    hospital_clinic: 'SkinIntelligence Wellness Center',
    consultation_fee: '$85 / session',
    availability_status: 'Available for Consultation',
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
    profile_picture: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    bio: 'Board-Certified Dermatologist specializing in clinical acne, eczema, and skin barrier pathology.',
    phone: '+1 555-0196',
    specialty: 'Clinical & Surgical Dermatology',
    license_number: 'MD-8839201',
    experience_years: '14 Years',
    qualification: 'MD, FAAD (Fellow of American Academy of Dermatology)',
    hospital_clinic: 'Metro Dermatology & Laser Center',
    consultation_fee: '$150 / session',
    availability_status: 'Available for Consultation',
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
    admin_role_title: 'System Administrator',
    availability_status: 'Active',
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

export const createUser = async ({
  name,
  email,
  password = null,
  role = 'USER',
  provider = 'LOCAL',
  profile_picture = '',
  bio = '',
  phone = '',
  specialty = '',
  license_number = '',
  experience_years = '',
  qualification = '',
  hospital_clinic = '',
  consultation_fee = '',
  availability_status = 'Available',
  skin_type = '',
  skin_concerns = '',
  allergies = '',
  admin_role_title = ''
}) => {
  const normalizedEmail = email.toLowerCase().trim();
  if (getIsPostgresAvailable()) {
    try {
      const query = `
        INSERT INTO users (name, email, password, role, provider, profile_picture, bio, phone, specialty, license_number, experience_years, qualification, hospital_clinic, consultation_fee, availability_status, skin_type, skin_concerns, allergies, admin_role_title)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `;
      const values = [name, normalizedEmail, password, role, provider, profile_picture, bio, phone, specialty, license_number, experience_years, qualification, hospital_clinic, consultation_fee, availability_status, skin_type, skin_concerns, allergies, admin_role_title];
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
    specialty,
    license_number,
    experience_years,
    qualification,
    hospital_clinic,
    consultation_fee,
    availability_status,
    skin_type,
    skin_concerns,
    allergies,
    admin_role_title,
    created_at: new Date(),
    updated_at: new Date()
  };
  fallbackUsers.push(newUser);
  return newUser;
};

export const updateUserProfile = async (id, profileData) => {
  const numericId = parseInt(id, 10);
  const {
    name,
    email,
    profile_picture,
    bio,
    phone,
    specialty,
    license_number,
    experience_years,
    qualification,
    hospital_clinic,
    consultation_fee,
    availability_status,
    skin_type,
    skin_concerns,
    allergies,
    admin_role_title
  } = profileData;

  if (getIsPostgresAvailable()) {
    try {
      const query = `
        UPDATE users
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            profile_picture = COALESCE($3, profile_picture),
            bio = COALESCE($4, bio),
            phone = COALESCE($5, phone),
            specialty = COALESCE($6, specialty),
            license_number = COALESCE($7, license_number),
            experience_years = COALESCE($8, experience_years),
            qualification = COALESCE($9, qualification),
            hospital_clinic = COALESCE($10, hospital_clinic),
            consultation_fee = COALESCE($11, consultation_fee),
            availability_status = COALESCE($12, availability_status),
            skin_type = COALESCE($13, skin_type),
            skin_concerns = COALESCE($14, skin_concerns),
            allergies = COALESCE($15, allergies),
            admin_role_title = COALESCE($16, admin_role_title),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
        RETURNING *
      `;
      const values = [
        name, email, profile_picture, bio, phone,
        specialty, license_number, experience_years, qualification, hospital_clinic,
        consultation_fee, availability_status, skin_type, skin_concerns, allergies,
        admin_role_title, numericId
      ];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error('PostgreSQL Query Error (updateUserProfile):', err.message);
    }
  }

  // Fallback memory update
  const userIndex = fallbackUsers.findIndex(u => u.id === numericId);
  if (userIndex !== -1) {
    const current = fallbackUsers[userIndex];
    fallbackUsers[userIndex] = {
      ...current,
      ...(name && { name }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(profile_picture !== undefined && { profile_picture }),
      ...(bio !== undefined && { bio }),
      ...(phone !== undefined && { phone }),
      ...(specialty !== undefined && { specialty }),
      ...(license_number !== undefined && { license_number }),
      ...(experience_years !== undefined && { experience_years }),
      ...(qualification !== undefined && { qualification }),
      ...(hospital_clinic !== undefined && { hospital_clinic }),
      ...(consultation_fee !== undefined && { consultation_fee }),
      ...(availability_status !== undefined && { availability_status }),
      ...(skin_type !== undefined && { skin_type }),
      ...(skin_concerns !== undefined && { skin_concerns }),
      ...(allergies !== undefined && { allergies }),
      ...(admin_role_title !== undefined && { admin_role_title }),
      updated_at: new Date()
    };
    return fallbackUsers[userIndex];
  }
  return null;
};

export const updateUserRoleAndProfileByAdmin = async (id, { role, ...profileData }) => {
  const numericId = parseInt(id, 10);
  if (getIsPostgresAvailable()) {
    try {
      if (role) {
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role.toUpperCase(), numericId]);
      }
    } catch (err) {
      console.error('PostgreSQL Query Error (updateUserRoleAndProfileByAdmin):', err.message);
    }
  }

  // Also update role in memory fallback
  const uIdx = fallbackUsers.findIndex(u => u.id === numericId);
  if (uIdx !== -1 && role) {
    fallbackUsers[uIdx].role = role.toUpperCase();
  }

  return updateUserProfile(numericId, profileData);
};

export const getAllUsers = async () => {
  if (getIsPostgresAvailable()) {
    try {
      const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
      return res.rows;
    } catch (err) {
      console.error('PostgreSQL Query Error (getAllUsers):', err.message);
    }
  }
  return fallbackUsers.map(({ password: _password, ...u }) => u);
};
