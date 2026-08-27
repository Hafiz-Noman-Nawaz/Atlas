import express from 'express';
import authRoutes from './authRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import chatRoutes from './chatRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import mlRoutes from './mlRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);
router.use('/chat', chatRoutes);
router.use('/upload', uploadRoutes);
router.use('/ml', mlRoutes);
router.use('/', feedbackRoutes); // handles /messages/:id/feedback

export default router;
