import express from 'express';
import {
  createOrUpdateUser,
  getUserByEmail,
  getUserByGoogleId,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

// POST /api/users - Create or update user
router.post('/', createOrUpdateUser);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/email/:email - Get user by email
router.get('/email/:email', getUserByEmail);

// GET /api/users/google/:googleId - Get user by Google ID
router.get('/google/:googleId', getUserByGoogleId);

export default router;
