import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';
import { ragService } from '../rag/ragService.js';

let aiClient = null;

function getAIClient() {
  if (!aiClient && config.geminiApiKey) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are Brian Thomas, the official AI support assistant for Shield Funding (https://shieldfunding.com, Phone: (888) 882-6117).
Your purpose is to assist business owners with commercial financing inquiries using the provided Shield Funding Knowledge Base.

### Core Rules:
1. Always answer the customer's question directly, clearly, and factually based on the provided Knowledge Context.
2. If the user asks about loan products, provide accurate details on Merchant Cash Advances (Factor rates 1.1-1.5, up to $2M), Lines of Credit (up to $200k, 1%-6% monthly), Term Loans (up to $2M), Equipment Financing, Invoice Factoring, and SBA Loans.
3. If the user asks about qualifications, highlight the core criteria: 4+ months in business, $10,000+ monthly revenue ($120k/yr), 500+ FICO, business checking account. Emphasize that we do soft credit pulls only and accept past bankruptcy, tax liens, or existing MCAs.
4. If an objection is raised (e.g. rates high, daily payments, credit check concern), respond respectfully using the official Shield Funding rebuttal approach.
5. Do NOT invent facts or terms not supported by the context.
6. If the question is completely outside the realm of commercial business funding or cannot be answered with the knowledge base, provide the official fallback:
   "I do not have that specific answer in my current knowledgebase, but our team can help through the contact page at https://shieldfunding.com/contact/ or by calling (888) 882-6117."
7. Tone: Professional, authoritative, concise, helpful. Format responses with clean Markdown bullet points.`;

/**
 * Generate context-augmented AI response using Google Gemini + RAG
 */
export async function generateRAGResponse(userMessage, conversationHistory = []) {
  // 1. Retrieve top relevant chunks from RAG vector store
  const relevantChunks = await ragService.retrieveRelevantContext(userMessage, 4);

  // 2. Format context string
  let contextText = '';
  if (relevantChunks.length > 0) {
    contextText = relevantChunks
      .map((c, i) => `[Source ${i + 1}: ${c.title || c.source}]\n${c.content}`)
      .join('\n\n---\n\n');
  }

  // 3. Check if Gemini client is active
  const client = getAIClient();

  if (client) {
    try {
      const historyTurns = conversationHistory.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const promptContent = `### RELEVANT SHIELD FUNDING KNOWLEDGE CONTEXT:
${contextText || 'No direct matches found in knowledge base.'}

### USER QUESTION:
${userMessage}

Please answer the user question using the knowledge context above following your system instructions.`;

      // Try calling Gemini model
      const modelToUse = config.geminiModel || 'gemini-2.5-flash';
      console.log(`[GeminiService] Generating response using model: ${modelToUse}...`);

      const response = await client.models.generateContent({
        model: modelToUse,
        contents: [
          ...historyTurns,
          {
            role: 'user',
            parts: [{ text: promptContent }],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      if (response && response.text) {
        return {
          content: response.text.trim(),
          model: modelToUse,
          sources: relevantChunks.map((c) => ({ title: c.title, source: c.source, score: c.score })),
          ragApplied: true,
        };
      }
    } catch (err) {
      console.warn(`[GeminiService] Gemini API invocation error, falling back to direct RAG context:`, err.message);
    }
  }

  // 4. Standalone / Offline Fallback: Synthesize directly from the highest-scoring RAG chunk
  if (relevantChunks.length > 0 && relevantChunks[0].score > 0.3) {
    const topChunk = relevantChunks[0];
    return {
      content: topChunk.content,
      model: 'rag-direct-synthesizer',
      sources: relevantChunks.slice(0, 2).map((c) => ({ title: c.title, source: c.source, score: c.score })),
      ragApplied: true,
    };
  }

  return {
    content:
      'I do not have that specific answer in my current knowledgebase, but our team can help through the contact page at https://shieldfunding.com/contact/ or by calling (888) 882-6117.',
    model: 'rag-fallback',
    sources: [],
    ragApplied: true,
  };
}

/**
 * Generate streaming AI response using Google Gemini + RAG
 * @param {string} userMessage
 * @param {Array} conversationHistory
 * @param {Function} onToken Callback called with each text token
 * @returns {Promise<{content: string, model: string, sources: Array, ragApplied: boolean}>}
 */
export async function generateRAGResponseStream(userMessage, conversationHistory = [], onToken = () => {}) {
  const relevantChunks = await ragService.retrieveRelevantContext(userMessage, 4);

  let contextText = '';
  if (relevantChunks.length > 0) {
    contextText = relevantChunks
      .map((c, i) => `[Source ${i + 1}: ${c.title || c.source}]\n${c.content}`)
      .join('\n\n---\n\n');
  }

  const client = getAIClient();
  let fullContent = '';
  const modelToUse = config.geminiModel || 'gemini-2.5-flash';

  if (client) {
    try {
      const historyTurns = conversationHistory.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const promptContent = `### RELEVANT SHIELD FUNDING KNOWLEDGE CONTEXT:
${contextText || 'No direct matches found in knowledge base.'}

### USER QUESTION:
${userMessage}

Please answer the user question using the knowledge context above following your system instructions.`;

      console.log(`[GeminiService] Streaming response using model: ${modelToUse}...`);

      const stream = await client.models.generateContentStream({
        model: modelToUse,
        contents: [
          ...historyTurns,
          {
            role: 'user',
            parts: [{ text: promptContent }],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullContent += text;
          onToken(text);
        }
      }

      if (fullContent.trim()) {
        return {
          content: fullContent.trim(),
          model: modelToUse,
          sources: relevantChunks.map((c) => ({ title: c.title, source: c.source, score: c.score })),
          ragApplied: true,
        };
      }
    } catch (err) {
      console.warn(`[GeminiService] Gemini streaming error, falling back to local synthesizer:`, err.message);
    }
  }

  // Fallback: Local knowledge synthesis with simulated natural token streaming
  const fallbackText =
    relevantChunks.length > 0 && relevantChunks[0].score > 0.3
      ? relevantChunks[0].content
      : 'I do not have that specific answer in my current knowledgebase, but our team can help through the contact page at https://shieldfunding.com/contact/ or by calling (888) 882-6117.';

  const words = fallbackText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const token = (i === 0 ? '' : ' ') + words[i];
    fullContent += token;
    onToken(token);
    await new Promise((r) => setTimeout(r, 20));
  }

  return {
    content: fullContent.trim(),
    model: client ? 'rag-fallback-stream' : 'rag-direct-synthesizer',
    sources: relevantChunks.slice(0, 2).map((c) => ({ title: c.title, source: c.source, score: c.score })),
    ragApplied: true,
  };
}
