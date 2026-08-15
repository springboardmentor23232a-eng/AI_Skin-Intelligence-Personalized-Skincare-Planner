import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createAssessment, getAssessments, getAssessmentById, updateAssessment, deleteAssessment,
  getHistory, addConcerns, getConcerns, addRisks, getRisks
} from '../controllers/assessmentController.js';

const router = express.Router();

router.use(authMiddleware);

// IMPORTANT: /history must come BEFORE /:id
router.get('/history', getHistory);

router.post('/', createAssessment);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.put('/:id', updateAssessment);
router.delete('/:id', deleteAssessment);

router.post('/:id/concerns', addConcerns);
router.get('/:id/concerns', getConcerns);
router.post('/:id/risks', addRisks);
router.get('/:id/risks', getRisks);

export default router;
