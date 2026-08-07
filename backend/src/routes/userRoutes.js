const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Simple role-gated ping the frontend can use to confirm dashboard access.
router.get('/dashboard', protect, authorize('USER'), (req, res) => {
  res.json({ message: `Welcome ${req.user.name}`, user: req.user });
});

module.exports = router;
