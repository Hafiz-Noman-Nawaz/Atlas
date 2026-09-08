import { knowledgeService } from '../rag/knowledgeService.js';

/**
 * Shield Funding AI Assistant Response Generator
 * Uses the authentic indexed knowledge base files from Shield Funding.
 */
export async function generateShieldFundingResponse(userMessage, conversationHistory = []) {
  // Ensure knowledge base is initialized
  await knowledgeService.initialize();

  // Search knowledge base for best match
  const match = knowledgeService.findBestMatch(userMessage);

  return match.content;
}
