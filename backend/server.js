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

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/profile", profileRoutes);


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


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});