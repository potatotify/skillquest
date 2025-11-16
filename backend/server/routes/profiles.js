import express from 'express';
import {
  createOrUpdateProfile,
  getProfileByUserId,
  getAllProfiles,
} from '../controllers/profileController.js';

const router = express.Router();

// POST /api/profiles - Create or update profile
router.post('/', createOrUpdateProfile);

// GET /api/profiles - Get all profiles
router.get('/', getAllProfiles);

// GET /api/profiles/user/:userId - Get profile by userId
router.get('/user/:userId', getProfileByUserId);

export default router;
