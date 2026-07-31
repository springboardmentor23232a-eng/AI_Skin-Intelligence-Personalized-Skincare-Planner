const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const router = express.Router();

// ===============================
// GOOGLE OAUTH CONFIGURATION
// ===============================

passport.use(
new GoogleStrategy(
{
clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
callbackURL: "http://localhost:5000/api/auth/google/callback"
},


    async (accessToken, refreshToken, profile, done) => {

        try {

            const email = profile.emails[0].value;
            const name = profile.displayName;

            // Check whether Google user already exists
            const existingUser = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                return done(null, existingUser.rows[0]);
            }

            // Create new Google user
            const result = await pool.query(
                `INSERT INTO users
                (name, email, password, role, provider)
                VALUES ($1, $2, $3, $4, 'GOOGLE')
                RETURNING id, name, email, role, provider`,
                [
                    name,
                    email,
                    "GOOGLE_USER",
                    "user"
                ]
            );

            return done(null, result.rows[0]);

        } catch (error) {

            console.error("Google OAuth error:", error);

            return done(error, null);
        }
    }
)


);

// ===============================
// TEST ROUTE
// ===============================

router.get("/test", (req, res) => {


res.send("Auth route is working!");


});

// ===============================
// REGISTER
// ===============================

router.post("/register", async (req, res) => {


try {

    const { name, email, password, role } = req.body;

    // Check whether all fields are provided
    if (!name || !email || !password || !role) {

        return res.status(400).json({
            message: "All fields are required"
        });

    }

    // Check whether email already exists
    const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {

        return res.status(409).json({
            message: "Email already registered"
        });

    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in PostgreSQL
    const result = await pool.query(
        `INSERT INTO users
        (name, email, password, role, provider)
        VALUES ($1, $2, $3, $4, 'LOCAL')
        RETURNING id, name, email, role, provider`,
        [name, email, hashedPassword, role]
    );

    res.status(201).json({

        message: "Registration successful",

        user: result.rows[0]

    });

} catch (error) {

    console.error("Registration error:", error);

    res.status(500).json({
        message: "Server error"
    });

}


});

// ===============================
// NORMAL LOGIN WITH JWT
// ===============================

router.post("/login", async (req, res) => {


try {

    const { email, password } = req.body;

    // Check whether email and password are provided
    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }

    // Find user by email
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {

        return res.status(401).json({
            message: "Invalid email or password"
        });

    }

    const user = result.rows[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {

        return res.status(401).json({
            message: "Invalid email or password"
        });

    }

    // Generate JWT
    const token = jwt.sign(

        {
            id: user.id,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1h"
        }

    );

    // Send response
    res.json({

        message: "Login successful",

        token: token,

        user: {

            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            provider: user.provider

        }

    });

} catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
        message: "Server error"
    });

}


});

// ===============================
// START GOOGLE LOGIN
// ===============================

router.get(
"/google",

passport.authenticate("google", {

    scope: ["profile", "email"]

})


);

// ===============================
// GOOGLE OAUTH CALLBACK
// ===============================

router.get(


"/google/callback",

passport.authenticate("google", {

    session: false

}),

(req, res) => {

    // Generate JWT
    const token = jwt.sign(

        {
            id: req.user.id,
            role: req.user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1h"
        }

    );

    // Prepare user information
    const userData = encodeURIComponent(

        JSON.stringify({

            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            provider: req.user.provider

        })

    );

    // Redirect user back to frontend
    res.redirect(
    `http://127.0.0.1:5500/frontend/login.html?token=${encodeURIComponent(token)}&user=${userData}`
);
}


);

// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;
