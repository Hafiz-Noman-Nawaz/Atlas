import { Router } from 'express';
import { knowledgeService } from '../services/rag/knowledgeService.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * GET /api/knowledge/overview
 * Overview of loaded knowledge base assets
 */
router.get('/overview', async (_req, res, next) => {
  try {
    await knowledgeService.initialize();
    return successResponse(res, {
      faqsCount: knowledgeService.faqs.length,
      productsCount: knowledgeService.products.length,
      rebuttalsCount: knowledgeService.rebuttals.length,
      declineReasonsCount: knowledgeService.declineReasons.length,
      companyProfile: knowledgeService.companyProfile,
      qualifications: {
        minimum: knowledgeService.qualifications.minimum,
        premium: knowledgeService.qualifications.premium,
        additional: knowledgeService.qualifications.additional,
      },
    }, 'Knowledge base overview retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/knowledge/faqs
 * List all loaded FAQs
 */
router.get('/faqs', async (_req, res, next) => {
  try {
    await knowledgeService.initialize();
    return successResponse(res, knowledgeService.faqs, 'FAQs retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/knowledge/products
 * List commercial loan products
 */
router.get('/products', async (_req, res, next) => {
  try {
    await knowledgeService.initialize();
    return successResponse(res, knowledgeService.products, 'Products retrieved');
  } catch (err) {
    next(err);
  }
});

export default router;
