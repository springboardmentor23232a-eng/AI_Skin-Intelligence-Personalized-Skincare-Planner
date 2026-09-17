const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Fallback in-memory user store when PostgreSQL database is not connected
const memoryUsers = [];

// Helper to sign JWT token safely
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "skin_ai_jwt_secret_key_12345";
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role || "user"
        },
        secret,
        { expiresIn: "24h" }
    );
};

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userRole = role || "user";

        try {
            const existingUser = await pool.query(
                "SELECT * FROM users WHERE email=$1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                "INSERT INTO users(name,email,password,role,provider) VALUES($1,$2,$3,$4,$5) RETURNING *",
                [name, email, hashedPassword, userRole, "LOCAL"]
            );

            const user = result.rows[0];
            const token = generateToken(user);

            return res.json({
                message: "Registration successful",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (dbError) {
            console.log("DB unavailable, using fallback store:", dbError.message);

            const existingMem = memoryUsers.find(u => u.email === email);
            if (existingMem) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = {
                id: memoryUsers.length + 1,
                name: name,
                email: email,
                password: hashedPassword,
                role: userRole
            };

            memoryUsers.push(newUser);
            const token = generateToken(newUser);

            return res.json({
                message: "Registration successful",
                token: token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        try {
            const result = await pool.query(
                "SELECT * FROM users WHERE email=$1",
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ message: "User not found" });
            }

            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(400).json({ message: "Wrong password" });
            }

            const token = generateToken(user);

            return res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (dbError) {
            console.log("DB unavailable, checking fallback store:", dbError.message);

            const memUser = memoryUsers.find(u => u.email === email);
            if (!memUser) {
                return res.status(400).json({ message: "User not found" });
            }

            const validPassword = await bcrypt.compare(password, memUser.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Wrong password" });
            }

            const token = generateToken(memUser);

            return res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: memUser.id,
                    name: memUser.name,
                    email: memUser.email,
                    role: memUser.role
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

module.exports = router;