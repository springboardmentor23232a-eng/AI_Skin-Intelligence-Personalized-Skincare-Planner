const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ---------- Standard email/password auth ----------
router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);

// ---------- Google OAuth2 ----------
// Step 1: kick off the Google consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back here with the profile; we issue our own JWT
// and hand it to the frontend via a redirect with the token in the query string.
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login.html?error=oauth_failed` }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    // Frontend reads ?token= from the URL, stores it, then redirects to the right dashboard.
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback.html?token=${token}`);
  }
);

module.exports = router;
