const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  listProviders,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
} = require('../controllers/userController');

const router = express.Router();

router.get('/providers', protect, listProviders);
router.post('/', protect, bookAppointment);
router.get('/mine', protect, getMyAppointments);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
