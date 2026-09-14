import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/profile and /api/profile/me
router.get('/', authenticateJWT, getProfile);
router.get('/me', authenticateJWT, getProfile);

// PUT /api/profile and /api/profile/me
router.put('/', authenticateJWT, updateProfile);
router.put('/me', authenticateJWT, updateProfile);

export default router;

