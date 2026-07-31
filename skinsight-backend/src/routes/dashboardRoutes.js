const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// GET /api/dashboard/redirect — frontend calls this right after login/OAuth
// to find out which dashboard page to send the user to.
router.get('/redirect', requireAuth, (req, res) => {
  const map = {
    admin: 'admin.html',
    dermatologist: 'dermatologist.html',
    consultant: 'skincare-consultant.html',
    user: 'user.html',
  };
  res.json({ redirectTo: map[req.user.role] || 'user.html' });
});

// GET /api/dashboard/admin — admin only
router.get('/admin', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await pool.query('SELECT COUNT(*) FROM users');
  const derms = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'dermatologist'`);
  res.json({
    totalUsers: Number(users.rows[0].count),
    totalDermatologists: Number(derms.rows[0].count),
  });
});

// GET /api/dashboard/dermatologist — dermatologist only
router.get('/dermatologist', requireAuth, requireRole('dermatologist'), async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 20`
  );
  res.json({ patients: result.rows });
});

// GET /api/dashboard/consultant — skincare consultant only
router.get('/consultant', requireAuth, requireRole('consultant'), async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 20`
  );
  res.json({ clients: result.rows });
});

// GET /api/dashboard/user — logged-in patient's own summary
router.get('/user', requireAuth, requireRole('user'), async (req, res) => {
  const sleep = await pool.query(
    'SELECT * FROM sleep_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 1', [req.user.id]
  );
  const hydration = await pool.query(
    'SELECT COALESCE(SUM(amount_ml),0) AS total FROM hydration_logs WHERE user_id = $1 AND logged_at::date = CURRENT_DATE', [req.user.id]
  );
  res.json({
    lastSleep: sleep.rows[0] || null,
    todayHydrationMl: Number(hydration.rows[0].total),
  });
});

module.exports = router;
