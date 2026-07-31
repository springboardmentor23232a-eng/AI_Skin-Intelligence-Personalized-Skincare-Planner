const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db/pool');
require('dotenv').config();

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, provider, is_active FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName || profile.name.givenName + ' ' + profile.name.familyName;
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, name, email, role, provider, is_active FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      if (!user.is_active) {
        return done(null, false, { message: 'Account is deactivated.' });
      }

      // Update user if they previously had LOCAL auth but now using Google
      if (user.provider !== 'GOOGLE') {
        await pool.query(
          'UPDATE users SET provider = $1, password_hash = NULL WHERE id = $2',
          ['GOOGLE', user.id]
        );
        user.provider = 'GOOGLE';
      }

      return done(null, user);
    }

    // Create new user with Google auth
    const newUser = await pool.query(
      `INSERT INTO users (name, email, role, provider, password_hash)
       VALUES ($1, $2, 'user', 'GOOGLE', NULL)
       RETURNING id, name, email, role, provider, is_active`,
      [name, email]
    );

    return done(null, newUser.rows[0]);

  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, null);
  }
}));

module.exports = passport;
