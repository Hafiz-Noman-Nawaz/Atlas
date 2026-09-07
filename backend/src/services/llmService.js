import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Returns an initialized Google GenAI instance if GEMINI_API_KEY is present.
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Builds concise system instructions tailored to Atlas.
 */
function buildSystemInstruction(intent) {
  const topicHint = intent && intent !== 'unknown'
    ? ` The user's query has been identified as related to the domain: "${intent.replace(/_/g, ' ')}".`
    : '';

  return (
    `You are ZeoAtlas, a premier, highly intelligent, and friendly AI assistant specialized in software engineering, programming, computer science, and technology.${topicHint}\n\n` +
    `Core Guidelines:\n` +
    `• Answer the user's prompt directly, thoroughly, and with high technical precision.\n` +
    `• Whenever mentioning, recommending, or asked for tutorials, YouTube channels, documentation, GitHub repositories, libraries, or external resources, ALWAYS provide real, clickable Markdown links in an attractive, structured format (e.g., \`[YouTube Channel Name](https://www.youtube.com/...)\`, \`[Official Docs](https://...)\`, \`[GitHub Repo](https://github.com/...)\`).\n` +
    `• Provide practical code examples with specified language identifiers (e.g., \`\`\`dart, \`\`\`python, \`\`\`javascript).\n` +
    `• Use rich Markdown formatting (bullet points, bold key terms, blockquotes, clean sections).\n` +
    `• Do not mention internal classification models, intent routers, API keys, or underlying backend mechanics.\n` +
    `• Deliver responses with engaging tone, crystal clarity, and actionable guidance.`
  );
}

/**
 * Formats conversation history for Gemini API.
 */
function formatHistory(conversationHistory = []) {
  const formatted = [];
  const recent = conversationHistory.slice(-10);

  for (const msg of recent) {
    if (msg.role === 'user' && msg.content) {
      formatted.push({
        role: 'user',
        parts: [{ text: msg.content }],
      });
    } else if (msg.role === 'assistant' && msg.content) {
      formatted.push({
        role: 'model',
        parts: [{ text: msg.content }],
      });
    }
  }

  return formatted;
}

/**
 * Candidate models to try in order of preference for high resilience.
 */
const MODEL_FALLBACK_CHAIN = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

/**
 * Generates an LLM response using Google Gemini API with automatic model failover and optional Web Search Grounding.
 */
export async function generateResponse(prompt, intent, confidence, conversationHistory = [], webSearch = false) {
  const client = getGeminiClient();

  if (!client) {
    const domainLabel = (intent || 'General Knowledge').replace(/_/g, ' ').toUpperCase();
    return (
      `I detected that your question is related to **${domainLabel}** (Confidence: ${Math.round(confidence * 100)}%).\n\n` +
      `> **Prompt:** "${prompt}"\n\n` +
      `*(To enable live Google Gemini responses, add your \`GEMINI_API_KEY\` into \`backend/.env\` and restart the server).*`
    );
  }

  let systemInstruction = buildSystemInstruction(intent);
  if (webSearch) {
    systemInstruction += '\n\n• Ground your response using real-time Google Search results. Cite source links and provide current, up-to-date facts.';
  }

  const historyContents = formatHistory(conversationHistory);
  const contents = [
    ...historyContents,
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const uniqueModels = Array.from(new Set(MODEL_FALLBACK_CHAIN));

  for (const model of uniqueModels) {
    try {
      const config = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        temperature: webSearch ? 0.4 : 0.7,
      };

      if (webSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await client.models.generateContent({
        model,
        contents,
        config,
      });

      const outputText = response.text ? response.text.trim() : '';
      if (outputText) {
        return outputText;
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown Gemini API error';
      console.warn(`[LLM Service Warning] Model "${model}" failed: ${errorMessage}. Trying next candidate...`);

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('403')) {
        return "The configured Google Gemini API key appears to be invalid. Please check your `GEMINI_API_KEY` in `backend/.env`.";
      }
    }
  }

  return "I encountered a temporary issue connecting to the generative AI service. Please try again in a moment.";
}

/**
 * Generates an LLM response via token streaming (SSE) with optional Google Search Grounding.
 */
export async function generateStreamResponse(prompt, intent, confidence, conversationHistory = [], onChunk = () => {}, webSearch = false) {
  const client = getGeminiClient();

  if (!client) {
    const fallbackText = await generateResponse(prompt, intent, confidence, conversationHistory, webSearch);
    onChunk(fallbackText);
    return fallbackText;
  }

  let systemInstruction = buildSystemInstruction(intent);
  if (webSearch) {
    systemInstruction += '\n\n• Ground your response using real-time Google Search results. Cite source links and provide current, up-to-date facts.';
  }

  const historyContents = formatHistory(conversationHistory);
  const contents = [
    ...historyContents,
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const uniqueModels = Array.from(new Set(MODEL_FALLBACK_CHAIN));
  let fullAccumulatedText = '';

  for (const model of uniqueModels) {
    try {
      const config = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        temperature: webSearch ? 0.4 : 0.7,
      };

      if (webSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const stream = await client.models.generateContentStream({
        model,
        contents,
        config,
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullAccumulatedText += chunkText;
          onChunk(chunkText);
        }
      }

      if (fullAccumulatedText.trim()) {
        return fullAccumulatedText.trim();
      }
    } catch (error) {
      console.warn(`[LLM Stream Error] Model "${model}" (webSearch: ${webSearch}) failed: ${error.message}. Trying next model...`);
    }
  }

  // Fallback to synchronous generation if stream failed
  const fallback = await generateResponse(prompt, intent, confidence, conversationHistory, webSearch);
  onChunk(fallback);
  return fallback;
}

