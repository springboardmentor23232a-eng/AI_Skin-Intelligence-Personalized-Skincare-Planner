const express  = require('express');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const { body, validationResult } = require('express-validator');
const pool      = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const passport  = require('../config/passport');
require('dotenv').config();

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const saveRefreshToken = async (userId, refreshToken) => {
  const tokenHash  = hashToken(refreshToken);
  const expiresAt  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('role').optional().isIn(['user', 'consultant', 'dermatologist']).withMessage('Role must be user, skincare consultant, or dermatologist'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role = 'user' } = req.body;

  try {
    // Check existing user
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Hash password
    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')
       RETURNING id, name, email, role, provider, created_at`,
      [name, email, passwordHash, role]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, provider, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User does not exist.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    if (user.provider !== 'LOCAL') {
      return res.status(400).json({ success: false, message: 'Please login with Google.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password.' });
    }

    // Generate tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token.' });
  }

  try {
    const tokenHash = hashToken(refreshToken);
    const result = await pool.query(
      `SELECT rt.id, rt.expires_at,
              u.id as user_id, u.name, u.email, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
    }

    const row = result.rows[0];

    if (new Date(row.expires_at) < new Date()) {
      await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);
      return res.status(403).json({ success: false, message: 'Refresh token expired. Please login.' });
    }

    // Rotate refresh token
    await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);

    const newAccessToken  = generateAccessToken({ id: row.user_id, name: row.name, email: row.email, role: row.role });
    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(row.user_id, newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  }

  res.clearCookie('refreshToken');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, provider, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PATCH /api/auth/me  (update account profile) ─────────────────────────────
router.patch('/me', [
  authMiddleware,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const updates = [];
  const values = [];

  if (req.body.name !== undefined) {
    values.push(req.body.name.trim());
    updates.push(`name = $${values.length}`);
  }
  if (req.body.email !== undefined) {
    values.push(req.body.email);
    updates.push(`email = $${values.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'Provide a name or email to update.' });
  }

  values.push(req.user.id);

  try {
    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, email, role, provider, is_active, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    return res.json({
      success: true,
      user,
      accessToken: generateAccessToken(user),
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// ─── PUT /api/auth/me/password  (change account password) ────────────────────
router.put('/me/password', [
  authMiddleware,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await pool.query(
      'SELECT password_hash, provider FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    if (user.provider !== 'LOCAL' || !user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Google accounts cannot change a password here.',
      });
    }

    const currentPasswordMatches = await bcrypt.compare(
      req.body.currentPassword,
      user.password_hash
    );
    if (!currentPasswordMatches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, req.user.id]
    );

    // Revoke existing refresh tokens so the password change signs out other sessions.
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);

    return res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
});

// ─── Google OAuth Routes ───────────────────────────────────────────────────────

// GET /api/auth/google - Initiate Google OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// GET /api/auth/google/callback - Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT tokens
      const accessToken  = generateAccessToken(user);
      const refreshToken = generateRefreshToken();
      await saveRefreshToken(user.id, refreshToken);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend with access token
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }))}`);

    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;
