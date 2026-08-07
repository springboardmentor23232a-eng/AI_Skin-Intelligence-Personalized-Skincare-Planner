const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getUserReports,
  recommendRoutine,
  getMyConsultations,
  updateConsultationStatus,
} = require('../controllers/consultantController');

const router = express.Router();
router.use(protect, authorize('CONSULTANT'));

router.get('/reports', getUserReports);
router.put('/reports/:id/recommend', recommendRoutine);
router.get('/appointments', getMyConsultations);
router.put('/appointments/:id/status', updateConsultationStatus);

module.exports = router;
