
const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getUserProfile,
    getAllUsers
} = require("../controllers/userController");

router.get("/profile", verifyToken, getUserProfile);

router.get("/", verifyToken, getAllUsers);

module.exports = router;