const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateSkincarePlan,
  getMyLatestPlan,
  getMyPlanHistory,
  updateSkincarePlan,
  updateChecklist,
} = require('../controllers/skincarePlanController');

const router = express.Router();

router.post('/generate', protect, generateSkincarePlan);
router.get('/', protect, getMyLatestPlan);
router.get('/history', protect, getMyPlanHistory);
router.put('/:id', protect, updateSkincarePlan);
router.put('/:id/checklist', protect, updateChecklist);

module.exports = router;
