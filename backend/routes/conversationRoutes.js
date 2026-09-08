import { Router } from 'express';
import {
  getConversations,
  createConversation,
  getConversationById,
  deleteConversation,
} from '../controllers/conversationController.js';
import messageRoutes from './messageRoutes.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all conversation routes
router.use(protect);

// Nested routes for messages under /api/conversations/:id/messages
router.use('/:id/messages', messageRoutes);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversationById)
  .delete(deleteConversation);

export default router;
