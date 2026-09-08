import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';

let aiClient = null;

function getAIClient() {
  if (!aiClient && config.geminiApiKey) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Simple deterministic bag-of-words / TF vectorizer fallback
 * Used when Gemini API key is not configured or in offline tests
 */
export function generateLocalFallbackEmbedding(text) {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const vectorDim = 128;
  const vector = new Array(vectorDim).fill(0);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % vectorDim;
    vector[idx] += 1;
  }

  // Normalize vector
  let norm = 0;
  for (let i = 0; i < vectorDim; i++) {
    norm += vector[i] * vector[i];
  }
  if (norm > 0) {
    const sqrtNorm = Math.sqrt(norm);
    for (let i = 0; i < vectorDim; i++) {
      vector[i] /= sqrtNorm;
    }
  }

  return vector;
}

let embeddingApiDisabled = false;

/**
 * Generate embedding for a given text using Gemini or fast fallback
 */
export async function generateEmbedding(text) {
  const client = getAIClient();

  if (client && !embeddingApiDisabled) {
    try {
      const response = await client.models.embedContent({
        model: config.embeddingModel || 'text-embedding-004',
        contents: text,
      });

      if (response && response.embedding && response.embedding.values) {
        return response.embedding.values;
      }
    } catch (err) {
      embeddingApiDisabled = true;
      console.warn(`[EmbeddingService] Remote embedding API unavailable (${err.message}). Using optimized local vectorizer.`);
    }
  }

  // Fast deterministic fallback
  return generateLocalFallbackEmbedding(text);
}

