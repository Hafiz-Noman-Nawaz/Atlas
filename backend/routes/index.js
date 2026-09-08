import { Router } from 'express';
import authRoutes from './authRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import knowledgeRoutes from './knowledgeRoutes.js';
import { isDbConnected } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (_req, res) => {
  return successResponse(
    res,
    {
      status: 'healthy',
      service: 'Shield Funding AI Assistant Backend',
      database: isDbConnected() ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    'Health check passed'
  );
});

import { generateRAGResponse } from '../services/llm/geminiService.js';
import { errorResponse } from '../utils/apiResponse.js';

// Mount module routes
router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);
router.use('/knowledge', knowledgeRoutes);

/**
 * Public AI Chat Consultation Endpoint (Gemini 3.6 Flash + RAG)
 * POST /api/chat
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return errorResponse(res, 'Message is required', 400);
    }

    const result = await generateRAGResponse(message, history || []);

    return successResponse(
      res,
      {
        reply: result.content,
        model: result.model,
        sources: result.sources,
        ragApplied: result.ragApplied,
      },
      'Response generated successfully'
    );
  } catch (err) {
    next(err);
  }
});

export default router;
