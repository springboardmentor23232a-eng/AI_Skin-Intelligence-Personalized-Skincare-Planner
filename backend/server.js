import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

import { initDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { authenticateJWT } from './middleware/authMiddleware.js';
import { authorizeRoles } from './middleware/roleMiddleware.js';
import { findUserByEmail, createUser, getAllUsers } from './models/userModel.js';
import { generateToken } from './utils/jwtUtils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logger Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport Google OAuth Strategy Setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_client_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`;
      let user = await findUserByEmail(email);
      if (!user) {
        user = await createUser({
          name: profile.displayName || 'Google User',
          email,
          password: null,
          role: 'USER',
          provider: 'GOOGLE',
          profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : ''
        });
      }
      const token = generateToken(user);
      return done(null, { ...user, token });
    } catch (err) {
      return done(err, null);
    }
  }
));
app.use(passport.initialize());

// Initialize PostgreSQL Database & Create Users Table
initDb();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Role-Based Protected Routes
// USER Permissions: User Dashboard, Profile, Skin Analysis
app.get('/api/user/dashboard', authenticateJWT, authorizeRoles('USER', 'ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to User Dashboard',
    permissions: ['USER_DASHBOARD', 'PROFILE', 'SKIN_ANALYSIS', 'HISTORY', 'APPOINTMENT_BOOKING'],
    user: req.user
  });
});

// WELLNESS_COACH Permissions: Coach Dashboard, View Assigned Users, Consultation Requests
app.get('/api/coach/dashboard', authenticateJWT, authorizeRoles('WELLNESS_COACH', 'ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Wellness Coach Dashboard',
    permissions: ['COACH_DASHBOARD', 'VIEW_ASSIGNED_USERS', 'CONSULTATION_REQUESTS'],
    user: req.user
  });
});

// ADMIN Permissions: Admin Dashboard, Manage Users, Manage Coaches, Analytics
app.get('/api/admin/dashboard', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to System Admin Dashboard',
    permissions: ['ADMIN_DASHBOARD', 'MANAGE_USERS', 'MANAGE_COACHES', 'ANALYTICS'],
    user: req.user
  });
});

app.get('/api/admin/users', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// API Root & Information Index Route (Fixes 404 on /api)
app.get(['/', '/api', '/api/'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Skin Intelligence & Personalized Skincare Planner API Operational',
    version: '1.0.0',
    status: 'HEALTHY',
    database: 'PostgreSQL (Port 7410)',
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login',
      register: '/api/auth/register',
      userProfile: '/api/auth/me',
      userDashboard: '/api/user/dashboard',
      adminDashboard: '/api/admin/dashboard'
    }
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'AI Skincare Backend API operational on port ' + PORT });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `404 Not Found: Route '${req.originalUrl}' does not exist.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({ success: false, message: '500 Internal Server Error: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AI Skincare Express API Server running on port ${PORT}`);
  console.log(` Database: PostgreSQL (Port: ${process.env.DB_PORT || 7410})`);
  console.log(`====================================================`);
});
