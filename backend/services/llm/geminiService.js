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

const SYSTEM_INSTRUCTION = `You are Brian Thomas, the official Senior Commercial Funding Advisor at Shield Funding (https://shieldfunding.com, Phone: (888) 882-6117).
Your purpose is to give direct, structured, transparent, and authoritative business financing answers using the provided Shield Funding Knowledge Base.

### CRITICAL RULES (DIRECT & STRUCTURED ANSWERS ONLY - NO GENERIC YAPPING):
1. **ANSWER THE EXACT QUESTION DIRECTLY IN THE FIRST SENTENCE**:
   - Immediately provide a clear, unequivocal direct answer to the user's specific query. Do NOT start with generic fluff or pleasantries.
   - Example (Collateral): If asked "Is commercial or personal collateral required for a small business term loan?", immediately begin:
     "**No**, commercial or personal collateral is not required for a small business term loan through Shield Funding. Our commercial term loans are **unsecured**, meaning you do not have to pledge real estate, personal vehicles, or equipment."
   - Example (Line of Credit Rates): If asked "What interest rates apply when drawing funds from a business line of credit?", immediately begin:
     "For a Business Line of Credit, the monthly interest rate is **1% to 6% per month** applied **only to the funds you actually draw** (starting at an approximate 14% annual finance charge), with draw fees between 0% and 4%."
2. **NEVER DUMP AN ENTIRE PRODUCT BROCHURE**:
   - Answer ONLY the specific question asked. Do not dump the entire 50-line product catalog unless the user explicitly asked "What funding products do you offer?"
3. **USE OFFICIAL SHIELD FUNDING METRICS FACTUALLY**:
   - **Merchant Cash Advance (MCA)**: Factor rates 1.10–1.50, up to $2,000,000, daily/weekly ACH, 3–24 months, 25%–100% early payoff fee forgiveness, 500+ FICO accepted.
   - **Business Line of Credit**: Up to $200,000, 1%–6% monthly interest on drawn amount only, 0%–4% draw fee, 24 months renewable, monthly payments.
   - **Small Business Term Loans**: Up to $2,000,000, ~30% APR starting rate, 6–48 months, weekly or monthly fixed payments, unsecured (no collateral).
   - **Equipment Financing**: $10k–$2M+, up to 100% covered, 10%–15% annual rate, 5-year secured by equipment, 620+ FICO, 1+ year in business.
   - **Invoice Factoring**: 80%–90% advanced within 24h, $20k–$1.5M, zero balance sheet debt, approval based on customer's credit, not yours.
   - **SBA Loans**: Up to $15,000,000, ~Prime + 3%, up to 25 years, monthly payments, 640+ FICO.
   - **Qualifications**: 4+ months in business, $10,000+/mo revenue ($120k/yr), business checking account, 500+ FICO, soft pull inquiry (zero impact on credit score). Discharged bankruptcies and tax liens accepted.
4. **FORMATTING**:
   - Use concise Markdown bullet points, bold key figures, and keep the tone professional, direct, and executive.`;

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
      const modelToUse = config.geminiModel || 'gemini-3.6-flash';
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
  const modelToUse = config.geminiModel || 'gemini-3.6-flash';

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
