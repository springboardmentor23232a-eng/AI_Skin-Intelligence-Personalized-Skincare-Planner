require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const session      = require('express-session');

const authRoutes       = require('./routes/auth');
const usersRoutes      = require('./routes/users');
const skinProfileRoutes = require('./routes/skinProfiles');
const skinAssessmentRoutes = require('./routes/skinAssessment');
const routineRoutes    = require('./routes/routines');
const productsRoutes    = require('./routes/products');
const ingredientRoutes  = require('./routes/ingredient');

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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Authenticated routes (must be before other routes)
app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/skin-profile',  skinProfileRoutes);

// Skin assessment routes (no auth required for testing)
app.use('/api/skin',         skinAssessmentRoutes);

// Skincare routine routes
app.use('/api/routine',      routineRoutes);

// Product recommendation routes
app.use('/api/products',     productsRoutes);

// Ingredient intelligence routes
app.use('/api/ingredient',   ingredientRoutes);

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
  console.log(`📋 Available API endpoints:`);
  console.log(`   POST   http://localhost:${PORT}/api/skin/assessment`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/assessment`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/assessment/:id`);
  console.log(`   PUT    http://localhost:${PORT}/api/skin/assessment/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/skin/assessment/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/assessment/history/:userId`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/assessment/risks/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/assessment/score/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/skin/predict-skin-type`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/classifier-info`);
  console.log(`   POST   http://localhost:${PORT}/api/routine/routine`);
  console.log(`   GET    http://localhost:${PORT}/api/routine/routine/:routineId`);
  console.log(`   GET    http://localhost:${PORT}/api/routine/routine/user/:userId`);
  console.log(`   PUT    http://localhost:${PORT}/api/routine/routine/:routineId`);
  console.log(`   DELETE http://localhost:${PORT}/api/routine/routine/:routineId`);
  console.log(`   POST   http://localhost:${PORT}/api/routine/routine/ai-personalize`);
  console.log(`   GET    http://localhost:${PORT}/api/routine/categories`);
  console.log(`   POST   http://localhost:${PORT}/api/routine/routine/:routineId/check-update`);
  console.log(`   POST   http://localhost:${PORT}/api/routine/routine/:routineId/adapt`);
  console.log(`   POST   http://localhost:${PORT}/api/routine/routine/:routineId/regenerate`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
  console.log(`   GET    http://localhost:${PORT}/api/products/categories`);
  console.log(`   GET    http://localhost:${PORT}/api/products`);
  console.log(`   POST   http://localhost:${PORT}/api/products/recommendations`);
  console.log(`   POST   http://localhost:${PORT}/api/products/compare`);
  console.log(`   GET    http://localhost:${PORT}/api/products/:productId`);
  console.log(`   GET    http://localhost:${PORT}/api/products/search/:query`);
  console.log(`   POST   http://localhost:${PORT}/api/ingredient/analyze`);
  console.log(`   POST   http://localhost:${PORT}/api/skin/skin-health/calculate`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/skin-health/current`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/skin-health/history`);
  console.log(`   GET    http://localhost:${PORT}/api/skin/skin-health/trend`);
  console.log(`   POST   http://localhost:${PORT}/api/skin/assessment`);
  console.log(`   GET    http://localhost:${PORT}/api/health\n`);
});
