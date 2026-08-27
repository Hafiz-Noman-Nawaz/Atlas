import express from 'express';
import {
  listConversations,
  createConversation,
  deleteAllConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  togglePinConversation,
} from '../controllers/conversationController.js';
import { getMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(listConversations)
  .post(createConversation)
  .delete(deleteAllConversations);

router.route('/:id')
  .get(getConversation)
  .patch(updateConversation)
  .delete(deleteConversation);

router.patch('/:id/pin', togglePinConversation);

// Nested messages route under conversation
router.get('/:id/messages', getMessages);

export default router;
