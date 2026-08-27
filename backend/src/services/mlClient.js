import axios from 'axios';

/**
 * Client for communicating with an external Python/ML inference service.
 * Used when CHATBOT_MODE=real.
 */
export async function getMLPrediction(userMessage, conversationHistory = []) {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000/predict';

  try {
    const response = await axios.post(
      mlServiceUrl,
      {
        message: userMessage,
        history: conversationHistory,
      },
      { timeout: 10000 }
    );

    return {
      message: response.data.message || response.data.response || "I have processed your request.",
      intent: response.data.intent || null,
      confidence: response.data.confidence ? Number(response.data.confidence) : null,
    };
  } catch (error) {
    console.error(`[ML Client] Error connecting to ML service at ${mlServiceUrl}: ${error.message}`);
    throw new Error('ML inference service unavailable. Please check ML_SERVICE_URL or switch CHATBOT_MODE=mock.');
  }
}
