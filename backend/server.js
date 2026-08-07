require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const pool = require('./src/config/db');
const passport = require('./src/config/passport');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const consultantRoutes = require('./src/routes/consultantRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// ---------- Core middleware ----------
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Passport is used in stateless mode (session: false) — it only signs a
// JWT after Google verifies the user, so no server-side session is needed.
app.use(passport.initialize());

// Serve uploaded skin images
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ---------- API routes ----------
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ai-skin-intelligence-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/admin', adminRoutes);

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// `new Pool()` never validates credentials by itself — it only tries to
// connect on the first query. Previously this meant `npm run dev` could
// print its success banner even with a totally broken PGPASSWORD, and the
// failure would only appear later on the first login/register request (or
// in `npm run db:init`, which is why it looked like only db:init was
// broken). Querying here makes a bad DB config fail immediately and
// clearly, at the point you'd expect it to.
async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('✓ Connected to PostgreSQL.');
  } catch (err) {
    console.error('✗ Could not connect to PostgreSQL:', err.message);
    console.error('  Check backend/.env — PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`AI Skin Intelligence API running on http://localhost:${PORT}`);
  });
}

start();
