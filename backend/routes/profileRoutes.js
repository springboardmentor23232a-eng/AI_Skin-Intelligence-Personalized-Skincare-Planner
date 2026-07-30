import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/profile
router.get('/', authenticateJWT, getProfile);

// PUT /api/profile
router.put('/', authenticateJWT, updateProfile);

export default router;
