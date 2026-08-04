const pool = require("../config/db");

// Logged in user profile
const getUserProfile = async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT user_id, full_name, email, role
             FROM Users
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT user_id, full_name, email, role
             FROM Users
             ORDER BY user_id`
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    getUserProfile,
    getAllUsers
};