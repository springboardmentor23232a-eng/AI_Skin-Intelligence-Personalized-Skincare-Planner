const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

// Only wire up the Google strategy if credentials are actually configured,
// so the rest of the app still runs for local-only development/testing.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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
          const avatar = profile.photos?.[0]?.value;

          // 1. Match an existing account by google_id
          let { rows } = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
          if (rows[0]) return done(null, rows[0]);

          // 2. Match an existing LOCAL account by email and link Google to it
          ({ rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]));
          if (rows[0]) {
            const updated = await pool.query(
              `UPDATE users SET google_id = $1, provider = 'GOOGLE', avatar_url = COALESCE(avatar_url, $2)
               WHERE id = $3 RETURNING *`,
              [profile.id, avatar, rows[0].id]
            );
            return done(null, updated.rows[0]);
          }

          // 3. Brand-new account, defaults to role USER
          const created = await pool.query(
            `INSERT INTO users (name, email, role, provider, google_id, avatar_url)
             VALUES ($1, $2, 'USER', 'GOOGLE', $3, $4) RETURNING *`,
            [profile.displayName, email, profile.id, avatar]
          );
          return done(null, created.rows[0]);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// Passport session plumbing is only used transiently during the OAuth
// handshake; the app itself is stateless and relies on JWT afterwards.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
