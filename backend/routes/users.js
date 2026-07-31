const express = require('express');
const pool    = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/users  (admin only) ─────────────────────────────────────────────
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = [];
    let params       = [];
    let paramIdx     = 1;

    if (role) {
      whereClauses.push(`role = $${paramIdx++}`);
      params.push(role);
    }
    if (search) {
      whereClauses.push(`(name ILIKE $${paramIdx} OR email ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereSQL}`,
      params
    );

    const usersResult = await pool.query(
      `SELECT id, name, email, role, provider, is_active, created_at, updated_at
       FROM users ${whereSQL}
       ORDER BY created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    );

    return res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      users: usersResult.rows,
    });

  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/users/stats  (admin only) ───────────────────────────────────────
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [totalRes, byRoleRes, recentRes, activeRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`),
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = true'),
    ]);

    return res.json({
      success: true,
      stats: {
        total:          parseInt(totalRes.rows[0].count),
        active:         parseInt(activeRes.rows[0].count),
        newThisWeek:    parseInt(recentRes.rows[0].count),
        byRole:         byRoleRes.rows.reduce((acc, r) => ({ ...acc, [r.role]: parseInt(r.count) }), {}),
      }
    });

  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PATCH /api/users/:id/toggle  (admin only) ────────────────────────────────
router.patch('/:id/toggle', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "Can't deactivate yourself." });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, email, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Toggle error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/users/:id  (admin only) ──────────────────────────────────────
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "Can't delete yourself." });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: `User "${result.rows[0].name}" deleted.` });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
