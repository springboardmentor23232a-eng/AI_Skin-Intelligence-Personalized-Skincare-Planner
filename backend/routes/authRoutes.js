import express from 'express';
import passport from 'passport';

import { register, login, googleAuth, getCurrentUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/google
router.post('/google', googleAuth);

// GET /api/auth/me
router.get('/me', authenticateJWT, getCurrentUser);

// Passport Google OAuth Routes
router.get('/google/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const token = req.user ? req.user.token : '';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/login?oauth_token=${token}`);
});

export default router;
