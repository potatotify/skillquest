import express from 'express';
import {
  createOrUpdateAssessment,
  getAssessmentByUserId,
  getAllAssessments,
} from '../controllers/assessmentController.js';

const router = express.Router();

// POST /api/assessments - Create or update assessment
router.post('/', createOrUpdateAssessment);

// GET /api/assessments - Get all assessments
router.get('/', getAllAssessments);

// GET /api/assessments/user/:userId - Get assessment by userId
router.get('/user/:userId', getAssessmentByUserId);

export default router;
