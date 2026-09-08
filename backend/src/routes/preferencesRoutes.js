const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyPreferences, upsertMyPreferences } = require('../controllers/preferencesController');

const router = express.Router();

router.get('/', protect, getMyPreferences);
router.put('/', protect, upsertMyPreferences);

module.exports = router;
