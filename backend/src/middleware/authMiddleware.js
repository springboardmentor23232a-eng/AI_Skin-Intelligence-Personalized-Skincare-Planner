const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Verifies the Bearer JWT on the request, loads the current user from the
 * database (so role/active-status changes take effect immediately), and
 * attaches it to req.user. This protects every route it's applied to.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email, role, provider, avatar_url, phone, skin_type, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows[0]) return res.status(401).json({ message: 'User no longer exists.' });
    if (!rows[0].is_active) return res.status(403).json({ message: 'Account has been disabled.' });

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
