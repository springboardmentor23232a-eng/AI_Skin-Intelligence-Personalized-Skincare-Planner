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
async function getProfile(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/me
async function updateProfile(req, res, next) {
  try {
    const { name, phone, skin_type } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone),
       skin_type = COALESCE($3, skin_type), updated_at = NOW()
       WHERE id = $4 RETURNING ${PUBLIC_FIELDS}`,
      [name, phone, skin_type, req.user.id]
    );
    res.json({ message: 'Profile updated.', user: rows[0] });
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
