const express = require("express");
const router = express.Router();

const passport = require("../config/passport");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

// JWT Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth Login
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Google OAuth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    (req, res) => {
        res.redirect("http://127.0.0.1:5500/Frontend/user_dashboard.html");
    }
);

// Logout
router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.redirect("http://127.0.0.1:5500/Frontend/login.html");
    });
});

module.exports = router;