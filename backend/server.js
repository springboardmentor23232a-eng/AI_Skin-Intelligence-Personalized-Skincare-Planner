require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const passport     = require('./config/passport');

const authRoutes       = require('./routes/auth');
const usersRoutes      = require('./routes/users');
const skinProfileRoutes = require('./routes/skinProfiles');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'null',               // allow file:// opened HTML files
  ],
  credentials: true,      // required for cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware for Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/skin-profile',  skinProfileRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Skin Intelligence API running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found.` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET    http://localhost:${PORT}/api/auth/google`);
  console.log(`   GET    http://localhost:${PORT}/api/auth/google/callback`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/refresh`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/logout`);
  console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
  console.log(`   GET    http://localhost:${PORT}/api/users        (admin)`);
  console.log(`   GET    http://localhost:${PORT}/api/users/stats  (admin)`);
  console.log(`   GET    http://localhost:${PORT}/api/skin-profile`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile`);
  console.log(`   PUT    http://localhost:${PORT}/api/skin-profile`);
  console.log(`   DELETE http://localhost:${PORT}/api/skin-profile`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile/analyze`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile/routine`);
  console.log(`   GET    http://localhost:${PORT}/api/skin-profile/health-score`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile/lifestyle`);
  console.log(`   GET    http://localhost:${PORT}/api/skin-profile/lifestyle`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile/sleep`);
  console.log(`   GET    http://localhost:${PORT}/api/skin-profile/sleep`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile/hydration`);
  console.log(`   PUT    http://localhost:${PORT}/api/skin-profile/hydration`);
  console.log(`   GET    http://localhost:${PORT}/api/skin-profile/hydration`);
  console.log(`   POST   http://localhost:${PORT}/api/skin-profile/environmental`);
  console.log(`   GET    http://localhost:${PORT}/api/skin-profile/environmental`);
  console.log(`   GET    http://localhost:${PORT}/api/health\n`);
});
