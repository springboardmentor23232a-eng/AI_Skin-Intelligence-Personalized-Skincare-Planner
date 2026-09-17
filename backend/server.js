console.log("THIS IS MY AI SKIN SERVER");

const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const passport = require("./passport");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const profileRoutes = require("./routes/profile");


const app = express();



// Test Route

app.get("/test", (req, res) => {

    res.send("New server code is running");

});

app.get("/api/test", (req, res) => {
    res.json({ status: "ok", message: "AI Skin Backend API is active" });
});

app.get("/api/db-status", async (req, res) => {
    try {
        const pool = require("./db");
        const result = await pool.query("SELECT NOW()");
        res.json({
            connected: true,
            database_url_configured: !!process.env.DATABASE_URL,
            server_time: result.rows[0].now
        });
    } catch (err) {
        res.status(500).json({
            connected: false,
            database_url_configured: !!process.env.DATABASE_URL,
            error: err.message
        });
    }
});



const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "*";
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

// Session setup

app.use(session({

    secret: process.env.SESSION_SECRET || "skin-ai-secret",

    resave: false,

    saveUninitialized: false

}));

// Passport setup

app.use(passport.initialize());

app.use(passport.session());


// Routes

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardRoutes);

app.use("/api/profile", profileRoutes);
app.use("/profile", profileRoutes);


// Google Login Route

app.get("/auth/google",

    passport.authenticate("google", {

        scope: ["profile", "email"]

    })

);


// Google Callback Route (OAuth + JWT)

app.get("/auth/google/callback",

    passport.authenticate("google", {

        failureRedirect: "/"

    }),

    (req, res) => {

        const token = req.user.token;
        const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5500";

        res.redirect(
            `${frontendUrl}/pages/user-dashboard.html?token=${token}`
        );

    }

);


// Home Route

app.get("/", (req, res) => {

    res.send("AI Skin Intelligence Backend Running");

});


module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}