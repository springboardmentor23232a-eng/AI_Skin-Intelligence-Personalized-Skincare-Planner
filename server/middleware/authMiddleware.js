import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided in Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired JWT authentication token.',
      error: err.message
    });
  }
}

export function requireRole(roles = []) {
  const roleList = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User authentication required.'
      });
    }

    if (roleList.length && !roleList.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden access. Required role(s): [${roleList.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
}
