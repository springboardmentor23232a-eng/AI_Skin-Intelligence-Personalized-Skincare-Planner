const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: verify JWT access token from Authorization header
 * Usage: router.get('/protected', authMiddleware, handler)
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token missing. Please login.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please refresh.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * Middleware: restrict route to specific roles
 * Usage: router.get('/admin', authMiddleware, requireRole('admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}`
    });
  }
  next();
};

module.exports = { authMiddleware, requireRole };
