const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getProfile, updateProfile, getSkinProfile, upsertSkinProfile,
} = require('../controllers/profileController');

const router = express.Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

router.get('/skin-profile', requireAuth, getSkinProfile);
router.put('/skin-profile', requireAuth, upsertSkinProfile);

module.exports = router;
