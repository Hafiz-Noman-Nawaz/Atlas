import { Router } from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

// Merge params to access :id from parent conversation route
const router = Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getMessages)
  .post(createMessage);

export default router;
