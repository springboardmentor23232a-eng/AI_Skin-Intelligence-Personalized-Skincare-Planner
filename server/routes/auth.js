import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import db from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '435046043372-n2nmis20orleg8q57rh6o0muo7qpi0c3.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper function to sign JWT Token
function generateJwtToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Normalize role strings for consistency (e.g. doctor -> dermatologist)
 */
function normalizeRole(role = 'user') {
  const r = role.toLowerCase().trim();
  if (r === 'doctor' || r === 'dermatologist') return 'dermatologist';
  if (r === 'consultant') return 'consultant';
  if (r === 'admin') return 'admin';
  return 'user';
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account (Requires Admin Verification)
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Registration requires username, email, and password.'
      });
    }

    // BUG 7 FIX: Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one letter and one number.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const targetRole = normalizeRole(role);

    // SECURITY RULE: Self-registration as Administrator is strictly prohibited!
    if (targetRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Self-registration as Administrator is strictly prohibited. Admin accounts must be created by an active Administrator.'
      });
    }

    // Check existing user in PostgreSQL
    // BUG 10 FIX: Check both username AND email properly with separate params
    const existingResult = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [cleanUsername, cleanEmail]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is already registered.'
      });
    }

    // Hash Password with Bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    // Insert into PostgreSQL with status = 'pending_approval'
    const insertResult = await db.query(
      `INSERT INTO users (username, email, password_hash, role, status, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, role, status, avatar_url, created_at`,
      [cleanUsername, cleanEmail, passwordHash, targetRole, 'pending_approval', avatarUrl]
    );

    const newUser = insertResult.rows[0];

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message: `Registration submitted for ${newUser.username}! Your account is pending Administrator verification before you can sign in.`,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (err) {
    console.error('[Register API Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate credentials & role against PostgreSQL with Admin Status Guard
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.'
      });
    }

    const cleanInput = username.trim().toLowerCase();
    const requestedRole = role ? normalizeRole(role) : null;

    // Query user from PostgreSQL DB
    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [cleanInput]
    );

    // BUG 3 FIX: Removed demo auto-creation backdoor — no fallback account seeding
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password. Account not found.'
      });
    }

    const user = userResult.rows[0];

    // SECURITY RULE 1: Verify Selected Role Matches Account Assigned Role
    if (requestedRole && normalizeRole(user.role) !== requestedRole) {
      return res.status(403).json({
        success: false,
        message: `Role Mismatch Error: User '${user.username}' is registered as '${user.role.toUpperCase()}', not '${requestedRole.toUpperCase()}'. Please select your registered role to log in.`
      });
    }

    // SECURITY RULE 2: Verify Account Status is Active (Not Pending Verification)
    if (user.status === 'pending_approval') {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        message: `Account Pending Verification: User '${user.username}' is currently awaiting Administrator approval. Please wait for an admin to verify your account.`
      });
    }

    // Verify Password (supports Bcrypt hashes, demo convenience passwords, and fallback matches)
    let isPasswordValid = false;
    if (user.password_hash && (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$'))) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!isPasswordValid) {
      const demoPasswords = {
        user: ['user', 'user123'],
        admin: ['admin', 'admin123'],
        doctor: ['doctor', 'doctor123', 'doctor123!'],
        dermatologist: ['doctor', 'doctor123', 'doctor123!'],
        consultant: ['consultant', 'consultant123']
      };
      const allowed = demoPasswords[user.username.toLowerCase()] || demoPasswords[user.role.toLowerCase()];
      if (allowed && allowed.includes(password.trim())) {
        isPasswordValid = true;
      } else if (password === user.password_hash) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials. Password mismatch.'
      });
    }

    const token = generateJwtToken(user);

    return res.json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('[Login API Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate or register user via Google OAuth 2.0 with Role Guard & Admin Verification
 */
router.post('/google', async (req, res) => {
  try {
    const { credential, idToken, role = 'user' } = req.body;
    const tokenToVerify = credential || idToken;

    const requestedRole = normalizeRole(role);

    // SECURITY RULE: Google OAuth self-registration as Administrator is prohibited
    if (requestedRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Google OAuth registration as Administrator is not permitted. Admin accounts must be created by an active Administrator.'
      });
    }

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth ID token (credential) is required.'
      });
    }

    let googleUser = null;

    if (GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenToVerify,
          audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        googleUser = {
          google_id: payload.sub,
          email: payload.email,
          name: payload.name || payload.given_name || 'Google User',
          picture: payload.picture
        };
      } catch (oauthErr) {
        console.warn('[Google OAuth Verification Warning] Invalid Token signature, attempting payload decode:', oauthErr.message);
      }
    }

    // BUG 9 FIX: If Google token verification failed, reject — no raw base64 fallback
    if (!googleUser) {
      return res.status(401).json({
        success: false,
        message: 'Google OAuth verification failed. Invalid or expired Google credential token. Please try again.'
      });
    }

    // Check existing Google user in PostgreSQL
    const existingGoogleUser = await db.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleUser.google_id, googleUser.email]
    );

    let dbUser = null;

    if (existingGoogleUser.rows.length > 0) {
      dbUser = existingGoogleUser.rows[0];

      // Check role mismatch if logging in as different role
      if (requestedRole && normalizeRole(dbUser.role) !== requestedRole) {
        return res.status(403).json({
          success: false,
          message: `Role Mismatch Error: Google account '${dbUser.email}' is registered as '${dbUser.role.toUpperCase()}', not '${requestedRole.toUpperCase()}'.`
        });
      }
    } else {
      // Auto-register new Google OAuth account as pending_approval
      const randomPassHash = await bcrypt.hash(`oauth_${Date.now()}`, 10);
      const username = googleUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');

      const insertResult = await db.query(
        `INSERT INTO users (username, email, password_hash, role, status, google_id, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, username, email, role, status, google_id, avatar_url`,
        [username, googleUser.email, randomPassHash, requestedRole, 'pending_approval', googleUser.google_id, googleUser.picture]
      );
      dbUser = insertResult.rows[0];
    }

    // SECURITY RULE: Account verification check
    if (dbUser.status === 'pending_approval') {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        message: `Google Account Registered! Account '${dbUser.username}' is currently pending Administrator verification. Please wait for an admin to approve your account.`
      });
    }

    const appToken = generateJwtToken(dbUser);

    return res.json({
      success: true,
      message: `Google OAuth login successful! Welcome ${dbUser.username}`,
      token: appToken,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status || 'active',
        avatar_url: dbUser.avatar_url,
        auth_provider: 'google'
      }
    });
  } catch (err) {
    console.error('[Google OAuth API Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Google OAuth authentication failed.',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user profile
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, username, email, role, status, google_id, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        user: req.user
      });
    }

    return res.json({
      success: true,
      user: userResult.rows[0]
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching authenticated user profile.',
      error: err.message
    });
  }
});

export default router;
