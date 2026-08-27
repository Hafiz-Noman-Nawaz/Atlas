import express from 'express';
import { sendMessage, sendMessageStream } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.post('/stream', protect, sendMessageStream);

export default router;
