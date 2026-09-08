const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');

const PUBLIC_FIELDS = 'id, name, email, role, provider, avatar_url, phone, skin_type, created_at';

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Only USER, DOCTOR, CONSULTANT can self-register; ADMIN accounts are
    // provisioned separately (never trust a role from a public sign-up form
    // for the admin tier).
    const allowedSelfRegisterRoles = ['USER', 'DOCTOR', 'CONSULTANT'];
    const finalRole = allowedSelfRegisterRoles.includes(role) ? role : 'USER';

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')
       RETURNING ${PUBLIC_FIELDS}`,
      [name, email, hashed, finalRole]
    );
    const user = rows[0];

    // Auto-create the profile-extension row for doctor/consultant sign-ups
    if (finalRole === 'DOCTOR') {
      await pool.query('INSERT INTO doctor_profiles (user_id) VALUES ($1)', [user.id]);
    } else if (finalRole === 'CONSULTANT') {
      await pool.query('INSERT INTO consultant_profiles (user_id) VALUES ($1)', [user.id]);
    }

    const token = generateToken(user);
    res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !user.password) {
      // user.password is NULL for Google-only accounts
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.is_active) {
      return res.status(403).json({ message: 'This account has been disabled.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    delete user.password;
    const token = generateToken(user);
    res.json({ message: 'Login successful.', token, user });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/google/callback  (after passport.authenticate succeeds)
// Issues a JWT and redirects back to the frontend with it in the URL,
// where the frontend picks it up and stores it (same pattern as a normal login).
function googleCallback(req, res) {
  const token = generateToken(req.user);
  const redirectUrl = `${process.env.CLIENT_URL}/oauth/callback?token=${token}`;
  res.redirect(redirectUrl);
}

// GET /api/auth/me
// Single source of truth for identity/shared fields: req.user is loaded
// fresh from `users` on every request by the protect middleware. For
// DOCTOR/CONSULTANT accounts, this also merges in their role-specific
// professional-profile row (doctor_profiles/consultant_profiles) so a
// single endpoint gives every role everything their own Profile page
// needs — without ever exposing another user's data (scoped to
// req.user.id throughout).
async function getProfile(req, res, next) {
  try {
    let professional = null;
    if (req.user.role === 'DOCTOR') {
      const { rows } = await pool.query(
        'SELECT specialization, qualification, experience_years, bio FROM doctor_profiles WHERE user_id = $1',
        [req.user.id]
      );
      professional = rows[0] || null;
    } else if (req.user.role === 'CONSULTANT') {
      const { rows } = await pool.query(
        'SELECT specialization, experience_years, bio FROM consultant_profiles WHERE user_id = $1',
        [req.user.id]
      );
      professional = rows[0] || null;
    }
    res.json({ user: req.user, professional });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/me
// Shared identity fields (name, phone) always live on `users` and apply
// to every role identically. skin_type is USER-specific but harmless to
// leave on the shared users row (pre-existing design) — a DOCTOR/
// CONSULTANT/ADMIN simply never sends it, so it stays untouched (COALESCE).
// Role-specific professional fields (specialization/qualification/
// experience_years/bio) are only ever written to *that* user's own
// doctor_profiles/consultant_profiles row, gated by req.user.role, so a
// DOCTOR can never write into consultant_profiles or vice versa, and no
// other user's row is ever touched.
async function updateProfile(req, res, next) {
  try {
    const { name, phone, skin_type, specialization, qualification, experience_years, bio } = req.body;

    if (experience_years !== undefined && experience_years !== null && experience_years !== '') {
      const n = Number(experience_years);
      if (!Number.isFinite(n) || n < 0 || n > 80) {
        return res.status(400).json({ message: 'experience_years must be a number between 0 and 80.' });
      }
    }

    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone),
       skin_type = COALESCE($3, skin_type), updated_at = NOW()
       WHERE id = $4 RETURNING ${PUBLIC_FIELDS}`,
      [name, phone, skin_type, req.user.id]
    );

    let professional = null;
    const expYears = experience_years !== undefined && experience_years !== '' ? Number(experience_years) : null;

    if (req.user.role === 'DOCTOR') {
      const { rows: profRows } = await pool.query(
        `INSERT INTO doctor_profiles (user_id, specialization, qualification, experience_years, bio)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET
           specialization = COALESCE(EXCLUDED.specialization, doctor_profiles.specialization),
           qualification = COALESCE(EXCLUDED.qualification, doctor_profiles.qualification),
           experience_years = COALESCE(EXCLUDED.experience_years, doctor_profiles.experience_years),
           bio = COALESCE(EXCLUDED.bio, doctor_profiles.bio)
         RETURNING specialization, qualification, experience_years, bio`,
        [req.user.id, specialization || null, qualification || null, expYears, bio || null]
      );
      professional = profRows[0] || null;
    } else if (req.user.role === 'CONSULTANT') {
      const { rows: profRows } = await pool.query(
        `INSERT INTO consultant_profiles (user_id, specialization, experience_years, bio)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           specialization = COALESCE(EXCLUDED.specialization, consultant_profiles.specialization),
           experience_years = COALESCE(EXCLUDED.experience_years, consultant_profiles.experience_years),
           bio = COALESCE(EXCLUDED.bio, consultant_profiles.bio)
         RETURNING specialization, experience_years, bio`,
        [req.user.id, specialization || null, expYears, bio || null]
      );
      professional = profRows[0] || null;
    }

    res.json({ message: 'Profile updated.', user: rows[0], professional });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const current = rows[0];

    if (current.password) {
      const match = await bcrypt.compare(currentPassword || '', current.password);
      if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, googleCallback, getProfile, updateProfile, changePassword };
