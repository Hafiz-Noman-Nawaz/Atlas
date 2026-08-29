import { predictIntent } from './mlService.js';
import { routeIntent } from './intentRouter.js';

/**
 * Generates a chatbot response (with optional token streaming callback).
 * 
 * @param {string} userMessage - User input prompt
 * @param {Array} [conversationHistory] - Previous chat messages context
 * @param {Object} [userContext] - Profile info (nickname, name, email, customMemories)
 * @param {Function} [onChunk] - Token streaming callback: (chunkText) => void
 * @returns {Promise<{ message: string, intent: string, confidence: number, responseType: string, response: string, raw_intent: string, is_confident: boolean, extractedName?: string, extractedMemory?: string }>}
 */
export async function getChatbotResponse(userMessage, conversationHistory = [], userContext = {}, onChunk = null, webSearch = false) {
  try {
    // 1. Predict intent using the trained Python ML model
    const prediction = await predictIntent(userMessage);

    // 2. Route intent using the Intent Router with memory context and streaming
    const routed = await routeIntent({
      message: userMessage,
      intent: prediction.intent,
      confidence: prediction.confidence,
      conversationHistory,
      userContext,
      onChunk,
      webSearch,
    });

    return {
      message: routed.response,
      response: routed.response,
      intent: routed.intent,
      confidence: routed.confidence,
      responseType: routed.responseType,
      raw_intent: prediction.raw_intent,
      is_confident: prediction.is_confident,
      top_predictions: prediction.top_predictions,
      extractedName: routed.extractedName,
      extractedMemory: routed.extractedMemory,
    };
  } catch (error) {
    console.error('[ChatbotService Error]', error);
    const fallbackMsg = "I encountered an issue processing your request. Please try again.";
    if (onChunk) onChunk(fallbackMsg);
    return {
      message: fallbackMsg,
      response: fallbackMsg,
      intent: "unknown",
      confidence: 0.0,
      responseType: "fallback",
      raw_intent: "unknown",
      is_confident: false,
      top_predictions: [],
    };
  }
}
