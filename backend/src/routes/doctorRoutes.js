const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getAssignedPatients,
  getPatientReports,
  addDiagnosis,
  getMyAppointments,
  updateAppointmentStatus,
} = require('../controllers/doctorController');

const router = express.Router();
router.use(protect, authorize('DOCTOR'));

router.get('/patients', getAssignedPatients);
router.get('/reports', getPatientReports);
router.put('/reports/:id/diagnosis', addDiagnosis);
router.get('/appointments', getMyAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

module.exports = router;
