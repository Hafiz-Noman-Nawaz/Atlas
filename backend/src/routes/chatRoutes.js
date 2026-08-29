import express from 'express';
import {
  sendMessage,
  sendMessageStream,
  createShareLink,
  getSharedConversation,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.post('/stream', protect, sendMessageStream);
router.post('/:id/share', protect, createShareLink);
router.get('/public/share/:shareId', getSharedConversation);

export default router;

