import { verifyToken } from '../utils/jwtUtils.js';
import { findUserById } from '../models/userModel.js';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '401 Unauthorized: Access token is missing or invalid'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: '401 Unauthorized: JWT token has expired or is invalid'
    });
  }

  const user = await findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '401 Unauthorized: User no longer exists'
    });
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider
  };

  next();
};
