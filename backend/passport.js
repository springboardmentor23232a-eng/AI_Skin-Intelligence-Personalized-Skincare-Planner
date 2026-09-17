const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = require("./db");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
            },
            async function(accessToken, refreshToken, profile, done) {
                try {
                    const email = profile.emails[0].value;
                    const name = profile.displayName;

                    const userExist = await pool.query(
                        "SELECT * FROM users WHERE email=$1",
                        [email]
                    );

                    let user;

                    if (userExist.rows.length > 0) {
                        user = userExist.rows[0];
                    } else {
                        const newUser = await pool.query(
                            "INSERT INTO users(name,email,password,role,provider) VALUES($1,$2,$3,$4,$5) RETURNING *",
                            [name, email, "google-login", "user", "GOOGLE"]
                        );
                        user = newUser.rows[0];
                    }

                    const token = jwt.sign(
                        {
                            id: user.id,
                            email: user.email,
                            role: user.role
                        },
                        process.env.JWT_SECRET || "skin_ai_jwt_secret_key_12345",
                        { expiresIn: "1h" }
                    );

                    user.token = token;
                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;