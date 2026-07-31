const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || 'Google User';

        if (!email) return done(new Error('Google account has no email.'));

        // Already registered (by email or by this Google id)?
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
          // brand-new account via Google — defaults to 'user' role
          const insert = await pool.query(
            `INSERT INTO users (name, email, role, oauth_provider, oauth_id)
             VALUES ($1, $2, 'user', 'google', $3)
             RETURNING *`,
            [name, email, profile.id]
          );
          user = insert.rows[0];
        } else if (!user.oauth_id) {
          // existing email/password account signing in with Google for the first time — link it
          await pool.query(
            `UPDATE users SET oauth_provider = 'google', oauth_id = $1 WHERE id = $2`,
            [profile.id, user.id]
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Required by passport even though we don't use persistent sessions for API auth —
// only used during the brief OAuth handshake redirect.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
