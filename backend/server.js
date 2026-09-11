import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

import { initDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { authenticateJWT } from './middleware/authMiddleware.js';
import { authorizeRoles } from './middleware/roleMiddleware.js';
import { findUserByEmail, createUser, getAllUsers, updateUserRoleAndProfileByAdmin } from './models/userModel.js';
import { generateToken } from './utils/jwtUtils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Health Check Endpoint (Unauthenticated)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Security & Logger Middleware
app.use(helmet({ contentSecurityPolicy: false }));

const allowedFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === allowedFrontend || origin.endsWith('.vercel.app') || allowedFrontend === '*') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
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

// Module 3 - 11: Forward FastAPI engine endpoints to Python FastAPI Engine (port 8000)
app.all([
  '/api/assessment', '/api/assessment/*', 
  '/api/routine', '/api/routine/*', 
  '/api/ai', '/api/ai/*',
  '/api/ingredient', '/api/ingredient/*',
  '/api/product', '/api/product/*',
  '/api/progress', '/api/progress/*',
  '/api/analytics', '/api/analytics/*',
  '/api/score', '/api/score/*',
  '/api/notifications', '/api/notifications/*',
  '/api/reports', '/api/reports/*'
], async (req, res) => {
  let fastApiBase = (process.env.FASTAPI_URL || 'https://ai-skincare-fastapi-backend.onrender.com').trim().replace(/\/+$/, '');
  if (process.env.RENDER || process.env.RENDER_SERVICE_ID || (fastApiBase.includes('localhost') && process.env.NODE_ENV === 'production')) {
    fastApiBase = 'https://ai-skincare-fastapi-backend.onrender.com';
  }

  let targetUrl = `${fastApiBase}${req.originalUrl}`;
  if (req.originalUrl.startsWith('/api/assessment')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/assessment', '/assessment')}`;
  } else if (req.originalUrl.startsWith('/api/routine')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/routine', '/routine')}`;
  } else if (req.originalUrl.startsWith('/api/ingredient')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/ingredient', '/ingredient')}`;
  } else if (req.originalUrl.startsWith('/api/product')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/product', '/product')}`;
  } else if (req.originalUrl.startsWith('/api/progress')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/progress', '/progress')}`;
  } else if (req.originalUrl.startsWith('/api/analytics')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/analytics', '/analytics')}`;
  } else if (req.originalUrl.startsWith('/api/score')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/score', '/score')}`;
  } else if (req.originalUrl.startsWith('/api/reports')) {
    targetUrl = `${fastApiBase}${req.originalUrl.replace('/api/reports', '/reports')}`;
  } else if (req.originalUrl.startsWith('/api/ai') || req.originalUrl.startsWith('/api/notifications')) {
    targetUrl = `${fastApiBase}${req.originalUrl}`;
  }

  // Ensure CORS binary headers are exposed
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');

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

  let fastApiResponse = null;
  let attempts = 3;
  let lastError = null;

  while (attempts > 0) {
    try {
      fastApiResponse = await fetch(targetUrl, fetchOptions);
      if (fastApiResponse.status !== 503 && fastApiResponse.status !== 502) {
        break;
      }
      lastError = new Error(`HTTP ${fastApiResponse.status} from FastAPI backend`);
    } catch (err) {
      lastError = err;
      console.warn(`[Proxy Retrying] Attempt remaining: ${attempts - 1}. Target: ${targetUrl}. Error: ${err.message}`);
    }
    attempts--;
    if (attempts > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!fastApiResponse || (fastApiResponse.status === 503 || fastApiResponse.status === 502)) {
    return res.status(503).json({
      success: false,
      message: 'AI Skin Engine service is currently warming up. Please wait a few seconds and try again.',
      error: lastError ? lastError.message : 'FastAPI cold start timeout'
    });
  }

  try {
    const contentType = fastApiResponse.headers.get('content-type') || '';

    // Check if response is binary (PDF, Excel, Octet-Stream, etc.)
    if (
      contentType.includes('application/pdf') ||
      contentType.includes('application/vnd.openxml') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('binary')
    ) {
      const arrayBuf = await fastApiResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      res.setHeader('Content-Type', contentType);
      const disposition = fastApiResponse.headers.get('content-disposition');
      if (disposition) {
        res.setHeader('Content-Disposition', disposition);
      }
      return res.status(fastApiResponse.status).send(buffer);
    }

    const data = await fastApiResponse.json().catch(() => ({}));
    res.status(fastApiResponse.status).json(data);
  } catch (err) {
    console.warn(`[Proxy Error] ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI Skin Engine response.',
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

app.put('/api/admin/users/:id', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const userId = req.params.id;
    const updated = await updateUserRoleAndProfileByAdmin(userId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User updated successfully by Admin', user: updated });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user' });
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

// Serve static built React assets
app.use(express.static(distPath));

// SPA Client Side Routing Fallback for Non-API Requests
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).json({
        success: true,
        message: 'AI Skin Intelligence & Personalized Skincare Planner API Operational',
        version: '1.0.0'
      });
    }
  });
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
