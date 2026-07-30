import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { initAndSeedDb } from './db/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and Request Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BUG 6 FIX: Rate limiting for auth endpoints — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // max 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1-hour window
  max: 5,                    // max 5 registrations per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  }
});

// Serve static frontend files
app.use(express.static(rootDir));

// API Route Mounts with rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'PanaceaAI Skin Intelligence Platform',
    auth: 'JWT & Google OAuth 2.0 Enabled',
    database: 'PostgreSQL Integrated',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for client SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Initialize database and start server
async function startServer() {
  await initAndSeedDb();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` PanaceaAI Server is running on http://localhost:${PORT}`);
    console.log(` JWT Auth:  http://localhost:${PORT}/api/auth/login`);
    console.log(` OAuth:     http://localhost:${PORT}/api/auth/google`);
    console.log(` PostgreSQL DB Integration: Active`);
    console.log(`=======================================================`);
  });
}

startServer();

export default app;
