const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllReports,
  getAllAppointments,
  getStats,
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect, authorize('ADMIN'));

router.get('/users', listUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/reports', getAllReports);
router.get('/appointments', getAllAppointments);
router.get('/stats', getStats);

module.exports = router;
