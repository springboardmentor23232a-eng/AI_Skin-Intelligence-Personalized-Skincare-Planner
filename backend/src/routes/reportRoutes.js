const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadAndAnalyze, getMyReports, getReportById } = require('../controllers/userController');

const router = express.Router();

router.post('/upload', protect, upload.single('image'), uploadAndAnalyze);
router.get('/', protect, getMyReports);
router.get('/:id', protect, getReportById);

module.exports = router;
