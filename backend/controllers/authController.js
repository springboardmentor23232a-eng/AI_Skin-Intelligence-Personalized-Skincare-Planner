import { findUserByEmail, createUser, findUserById } from '../models/userModel.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/jwtUtils.js';

/**
 * User Registration API
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Check duplicate email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '409 Conflict: Email address is already registered'
      });
    }

    // Hash password with BCrypt
    const hashedPassword = await hashPassword(password);

    // Save into PostgreSQL
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
      provider: 'LOCAL'
    });

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        provider: newUser.provider,
        profile_picture: newUser.profile_picture || '',
        bio: newUser.bio || '',
        phone: newUser.phone || ''
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      success: false,
      message: '500 Internal Server Error: Registration failed'
    });
  }
};

/**
 * User Login API
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find email in PostgreSQL
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: Invalid email or password'
      });
    }

    // Handle Google provider account check
    if (user.provider === 'GOOGLE' && !user.password) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: This account was created via Google OAuth. Please sign in using Continue with Google.'
      });
    }

    // Compare BCrypt password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: Invalid email or password'
      });
    }

    // Generate 24h JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        profile_picture: user.profile_picture || '',
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      message: '500 Internal Server Error: Authentication failed'
    });
  }
};

/**
 * Google OAuth2 Login API
 * POST /api/auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { name, email, profile_picture } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google profile email is required'
      });
    }

    let user = await findUserByEmail(email);

    if (!user) {
      // Determine default role based on admin emails or user preference
      const assignedRole = (email.includes('akp73733') || email.includes('admin')) ? 'ADMIN' : 'USER';
      // Create new account with provider=GOOGLE, password=null
      user = await createUser({
        name: name || 'Google User',
        email,
        password: null,
        role: assignedRole,
        provider: 'GOOGLE',
        profile_picture: profile_picture || ''
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Google OAuth login successful',
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        profile_picture: user.profile_picture || '',
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (err) {
    console.error('Google OAuth Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Google OAuth login failed'
    });
  }
};

/**
 * Get Current Authenticated User API
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        profile_picture: user.profile_picture || '',
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};
