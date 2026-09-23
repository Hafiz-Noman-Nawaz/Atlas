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

const SYSTEM_INSTRUCTION = `You are Brian Thomas, Senior Commercial Funding Advisor at Shield Funding (https://shieldfunding.com, Phone: (888) 882-6117).
Your purpose is to answer the user's specific business funding questions directly, intelligently, and concisely using the provided Shield Funding Knowledge Base.

### STRICT RULES (DIRECT & INTELLIGENT ANSWERS - NO GENERIC YAPPING):
1. **ANSWER THE EXACT QUESTION DIRECTLY IN THE FIRST SENTENCE**:
   - Deliver the direct answer immediately without generic preamble or pleasantries.
   - Example (Collateral): If asked "Is collateral required for a term loan?", immediately answer:
     "**No**, commercial or personal collateral is not required for a small business term loan through Shield Funding. Our term loans are completely **unsecured**, meaning you do not have to pledge real estate, personal vehicles, or equipment."
   - Example (Line of Credit Rates): If asked "What interest rates apply when drawing funds?", immediately answer:
     "For a Business Line of Credit, the monthly interest rate is **1% to 6% per month** applied **strictly to the capital you actually draw**, with draw fees between 0% and 4%."
2. **DO NOT DUMP UNREQUESTED PRODUCT BROCHURES**:
   - Answer ONLY what the user specifically asked. Do NOT dump the entire product catalog or irrelevant qualifications unless the user explicitly requested a broad overview.
3. **DO NOT REPEAT THE SAME TEXT OR CATERGORIZED RESPONSES**:
   - Read the user's exact query and provide an intelligent, tailored answer. Never repeat boilerplate marketing paragraphs.
4. **KEY SHIELD FUNDING FACTS (From Knowledge Base)**:
   - **Term Loans**: Up to $2,000,000, 6–48 months, fixed weekly or monthly payments, unsecured (NO collateral).
   - **Business Line of Credit**: Up to $250,000, 1%–6% monthly interest on drawn amount only, revolving, monthly payments.
   - **Merchant Cash Advance (MCA)**: Factor rates 1.10–1.50, up to $2,000,000, daily/weekly remittances based on sales volume, 500+ FICO accepted.
   - **Equipment Financing**: Up to $2,000,000, up to 100% financed, equipment itself serves as collateral.
   - **Invoice Factoring**: Advances up to 90% in 24 hours, based on customer creditworthiness.
   - **General Qualifications**: 4+ months in business, $10,000+/month revenue ($120k/yr), business checking account. 500+ FICO accepted (soft credit pull only; zero impact on credit score). Discharged bankruptcies and tax liens accepted.
   - **Speed**: Funding wired in as little as 24 hours. Underwriting decisions in 2–4 hours.
5. **CONCISE & STRUCTURED FORMATTING**:
   - Use brief bullet points for clarity. Keep responses focused and readable.`;

// Cascade candidate models: prioritize gemini-3.5-flash which has active quota and instant latency
const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];

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
    const historyTurns = conversationHistory.slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const promptContent = `### RELEVANT SHIELD FUNDING KNOWLEDGE CONTEXT:
${contextText || 'No direct matches found in knowledge base.'}

### USER QUESTION:
${userMessage}

Please provide a direct, concise, and intelligent answer to the user question using the knowledge context above following your system instructions.`;

    // Try candidate models in cascade order
    for (const modelToUse of CANDIDATE_MODELS) {
      try {
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
        console.warn(`[GeminiService] Model ${modelToUse} failed (${err.message?.slice(0, 100)}). Trying next candidate...`);
      }
    }
  }

  // 4. Standalone / Offline Fallback: Extract directly and concisely from the top RAG chunk
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
      'I do not have that specific detail in our current knowledge base. Please speak directly with a Senior Funding Advisor at **(888) 882-6117** or apply online at **shieldfunding.com/apply** for immediate assistance.',
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

  if (client) {
    const historyTurns = conversationHistory.slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const promptContent = `### RELEVANT SHIELD FUNDING KNOWLEDGE CONTEXT:
${contextText || 'No direct matches found in knowledge base.'}

### USER QUESTION:
${userMessage}

Please provide a direct, concise, and intelligent answer to the user question using the knowledge context above following your system instructions.`;

    for (const modelToUse of CANDIDATE_MODELS) {
      try {
        console.log(`[GeminiService] Streaming response using model: ${modelToUse}...`);
        fullContent = '';

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
        console.warn(`[GeminiService] Streaming model ${modelToUse} failed (${err.message?.slice(0, 100)}). Trying next candidate...`);
      }
    }
  }

  // Fallback: Local knowledge synthesis with simulated token streaming
  const fallbackText =
    relevantChunks.length > 0 && relevantChunks[0].score > 0.3
      ? relevantChunks[0].content
      : 'I do not have that specific detail in our current knowledge base. Please speak directly with a Senior Funding Advisor at (888) 882-6117 or visit shieldfunding.com for immediate assistance.';

  fullContent = '';
  const words = fallbackText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const token = (i === 0 ? '' : ' ') + words[i];
    fullContent += token;
    onToken(token);
    await new Promise((r) => setTimeout(r, 15));
  }

  return {
    content: fullContent.trim(),
    model: client ? 'rag-fallback-stream' : 'rag-direct-synthesizer',
    sources: relevantChunks.slice(0, 2).map((c) => ({ title: c.title, source: c.source, score: c.score })),
    ragApplied: true,
  };
}
