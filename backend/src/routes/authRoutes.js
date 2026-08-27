import express from 'express';
import { register, login, getMe, updateProfile, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.route('/me')
  .get(protect, getMe)
  .patch(protect, updateProfile)
  .delete(protect, deleteAccount);

export default router;
