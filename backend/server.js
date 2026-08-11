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

// Module 3 & 4: Forward /api/assessment and /api/routine requests to Python FastAPI Engine (port 8000)
app.all(['/api/assessment', '/api/assessment/*', '/api/routine', '/api/routine/*'], async (req, res) => {
  const fastApiBase = process.env.FASTAPI_URL || 'http://localhost:8000';
  let targetUrl = `${fastApiBase}${req.originalUrl}`;
  if (req.originalUrl.startsWith('/api/assessment')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/assessment', '/assessment')}`;
  } else if (req.originalUrl.startsWith('/api/routine')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/routine', '/routine')}`;
  }

  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    const fetchOptions = {
      method: req.method,
      headers: headers
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && Object.keys(req.body || {}).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
      headers['content-type'] = 'application/json';
    }

    const fastApiResponse = await fetch(targetUrl, fetchOptions);
    const data = await fastApiResponse.json().catch(() => ({}));
    res.status(fastApiResponse.status).json(data);
  } catch (err) {
    console.warn(`[Proxy Warning] Failed to reach Python FastAPI on port 8000: ${err.message}`);
    res.status(503).json({
      success: false,
      message: 'FastAPI Skin Engine service is starting or unavailable on port 8000. Please verify Python service status.',
      error: err.message
    });
  }
});


// Role-Based Protected Routes
// USER Permissions: User Dashboard, Profile, Skin Analysis, Routine, Appointments
app.get('/api/user/dashboard', authenticateJWT, authorizeRoles('USER', 'ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to User Dashboard',
    permissions: ['USER_DASHBOARD', 'PROFILE', 'SKIN_ANALYSIS', 'ROUTINE', 'APPOINTMENT_BOOKING', 'CHAT', 'NOTIFICATIONS'],
    user: req.user
  });
});

// SKINCARE CONSULTANT Permissions: Assigned Users, Review AI Reports, Skincare Plans
app.get('/api/consultant/dashboard', authenticateJWT, authorizeRoles('SKINCARE_CONSULTANT', 'CONSULTANT', 'ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Skincare Consultant Dashboard',
    permissions: ['CONSULTANT_DASHBOARD', 'ASSIGNED_USERS', 'REVIEW_AI_REPORTS', 'CREATE_SKINCARE_PLANS', 'RECOMMEND_PRODUCTS', 'CHAT_WITH_USERS'],
    user: req.user
  });
});

// DERMATOLOGIST Permissions: Patient List, Appointment Schedule, Diagnosis, Prescriptions
app.get('/api/doctor/dashboard', authenticateJWT, authorizeRoles('DERMATOLOGIST', 'ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Dermatologist Clinical Dashboard',
    permissions: ['DOCTOR_DASHBOARD', 'PATIENT_LIST', 'APPOINTMENT_SCHEDULE', 'MEDICAL_HISTORY', 'DIAGNOSIS', 'PRESCRIPTIONS', 'TREATMENT_PLANS'],
    user: req.user
  });
});

// WELLNESS_COACH Permissions: Coach Dashboard, Assigned Clients, Diet & Lifestyle Plans
app.get('/api/wellness/dashboard', authenticateJWT, authorizeRoles('WELLNESS_COACH', 'ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Wellness Coach Dashboard',
    permissions: ['COACH_DASHBOARD', 'ASSIGNED_CLIENTS', 'DIET_PLANS', 'LIFESTYLE_GUIDANCE', 'WATER_SLEEP_TRACKING', 'EXERCISE_RECOMMENDATIONS'],
    user: req.user
  });
});

// ADMIN Permissions: System Dashboard, Full System Access
app.get('/api/admin/dashboard', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to System Admin Dashboard',
    permissions: ['ADMIN_DASHBOARD', 'MANAGE_USERS', 'ROLE_MANAGEMENT', 'ANALYTICS', 'AUDIT_LOGS', 'SYSTEM_SETTINGS', 'BACKUP_RESTORE'],
    user: req.user
  });
});

app.get('/api/admin/users', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (_err) {
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
app.use((err, req, res, _next) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({ success: false, message: '500 Internal Server Error: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AI Skincare Express API Server running on port ${PORT}`);
  console.log(` Database: PostgreSQL (Port: ${process.env.DB_PORT || 7410})`);
  console.log(`====================================================`);
});
