import { generateResponse as generateLLMResponse, generateStreamResponse as generateLLMStreamResponse } from './llmService.js';

const CAPABILITIES_AND_LIMITS_TEXT = `Here is a quick summary of what I can and cannot do for now:

### ✅ What I Can Do:
• **Software Engineering**: Write, debug, and explain code in Python, JavaScript, TypeScript, SQL, React, Node.js, and more.
• **Machine Learning & System Design**: Explain algorithms, data structures, cloud architectures, and database queries.
• **Conversational Memory**: Remember your name, preferences, and explicitly saved notes (*"Remember this: [note]"*).
• **Multimodal Attachments**: Process uploaded code files and screenshots pasted with \`Ctrl+V\`.
• **Chat Management**: Rename, delete, and export your chat histories as Markdown (\`.md\`) or JSON (\`.json\`).

### ❌ What I Cannot Do (For Now):
• Execute destructive actions or terminal commands directly on your local computer.
• Control physical real-world devices, make phone calls, or send SMS.
• Access private offline files or external accounts unless you explicitly upload them.`;

/**
 * Category A: Predefined Conversational & Application Response Pools
 */
export const PREDEFINED_RESPONSES = {
  chat_management: [
    `Yes! You can manage this conversation directly from the interface:
• **Rename Chat**: Hover over the chat title in the left sidebar and click the **Pencil (Rename)** icon ✏️.
• **Delete Chat**: Click the **Trash** icon 🗑️ next to any conversation in the sidebar.
• **Export Chat**: Click the **Export** button in the top-right header to download this conversation as Markdown (\`.md\`) or JSON (\`.json\`).
• **New Chat**: Click the **+ New Chat** button at the top of the sidebar to start a new thread.`,
  ],
  capabilities: [
    CAPABILITIES_AND_LIMITS_TEXT,
  ],
  unsupported_tasks: [
    `I cannot perform physical or external offline actions like that. ${CAPABILITIES_AND_LIMITS_TEXT}`,
  ],
  app_features: [
    `Here are the features and shortcuts available in ZeoAtlas:
• **Screenshot & File Upload**: Click the Paperclip 📎 icon or paste screenshots directly (\`Ctrl+V\`).
• **Syntax Highlighting & Copy**: Clean dark syntax blocks with a 1-click **Copy Code** button.
• **Settings Panel**: Click the **Settings ⚙️** icon in the sidebar to change your nickname, avatar, theme, font size, and AI temperature.
• **Export Options**: Download chats as formatted Markdown (\`.md\`) or raw JSON (\`.json\`).
• **Data Privacy**: Delete individual chats or clear your entire conversation history in Settings.`,
  ],
  greeting: [
    "Hello! I am ZeoAtlas, your AI assistant. How can I help you with your coding or machine learning projects today? 👋",
    "Hey there! Ready to write code, debug issues, or explore ML models. What are you working on today?",
    "Greetings! ZeoAtlas is online and ready. How can I assist you?",
    "Hi! Great to have you here. Let me know what programming or AI questions you have!",
  ],
  goodbye: [
    "Goodbye! Feel free to return whenever you have more coding or machine learning questions. Happy building! 🚀",
    "Have a great day! Keep coding and building amazing software.",
    "See you later! Don't hesitate to reach out if you get stuck on an algorithm or project.",
    "Farewell! ZeoAtlas will be here whenever you need assistance next.",
  ],
  thanks: [
    "You're very welcome! Let me know if you need anything else. 😊",
    "Glad I could help! Happy coding!",
    "Anytime! Always here to help you solve technical challenges and debug code.",
    "You got it! Reach out whenever you run into another challenge.",
  ],
  bot_identity: [
    "I am **ZeoAtlas**, a full-stack conversational AI assistant powered by a custom Python ML Intent Classification engine, Node.js, and Google Gemini.",
    "I am **ZeoAtlas** — your software engineering and intent classification companion.",
  ],
  help: [
    "I'm here to assist you! You can ask me questions about programming (Python, JavaScript), Databases & SQL, System Design, Debugging, or test intent classification.",
    "Need assistance? Type any coding question, paste an error message, or test my intent classification model by asking technical questions!",
  ],
  how_are_you: [
    "All systems are operating smoothly at 100% efficiency! Ready to tackle any coding or intent classification problem.",
    "I'm doing great, thank you for asking! How are your software and ML projects coming along?",
  ],
  name: [
    "My name is **ZeoAtlas**. I am your AI intent classification and engineering assistant.",
    "You can call me **ZeoAtlas**! 🤖",
  ],
  age: [
    "I was initialized in 2026 and continuously evolve with updated machine learning models and knowledge bases!",
    "I am a modern AI assistant built and deployed in 2026.",
  ],
  creator: [
    "I was built and engineered as the ZeoAtlas platform using a custom Python ML model, Node.js + Express backend, and React frontend.",
    "I was designed and developed by my engineering team using full-stack JavaScript and Python Machine Learning.",
  ],
  positive_feedback: [
    "Thank you so much for the positive feedback! I'm thrilled that my response was helpful to you. ⭐",
    "Much appreciated! I'm always striving to give accurate and clear technical assistance.",
  ],
  negative_feedback: [
    "I apologize if my response wasn't helpful. Please feel free to provide more context, paste the error or code snippet, and I'll do my best to give you the exact solution.",
    "Thank you for the feedback. I'm actively improving! Please let me know what went wrong or how I can clarify the answer.",
  ],
};

/**
 * List of intents recognized as Simple / Conversational / App Features
 */
export const SIMPLE_INTENTS = new Set(Object.keys(PREDEFINED_RESPONSES));

/**
 * List of intents recognized as Knowledge / Generative (LLM Route)
 */
export const GENERATIVE_INTENTS = new Set([
  'programming',
  'python',
  'javascript',
  'machine_learning',
  'data_science',
  'web_development',
  'database_sql',
  'code_debugging',
  'git_devops',
  'system_design',
  'cybersecurity',
  'algorithms',
  'motivation',
  'study_help',
  'jokes',
  'weather',
  'time',
  'contact',
  'summarize_simplify',
]);

/**
 * Default fallback responses when message is genuine gibberish / uninterpretable
 */
export const FALLBACK_RESPONSES = [
  `I'm unable to process that specific request. ${CAPABILITIES_AND_LIMITS_TEXT}`,
];

/**
 * Helper to detect pure gibberish, spam, keyboard smashing, or uninterpretable strings.
 */
function isGibberishOrSpam(text) {
  if (!text || typeof text !== 'string') return true;
  const clean = text.trim();
  if (clean.length < 2) return true;

  if (/^[^a-zA-Z0-9\s]+$/.test(clean)) return true;
  if (/^(.)\1{4,}$/i.test(clean)) return true;

  const words = clean.split(/\s+/);
  if (words.length === 1 && clean.length > 7) {
    const vowels = (clean.match(/[aeiou]/gi) || []).length;
    const vowelRatio = vowels / clean.length;
    if (vowelRatio < 0.15 && !/(?:html|http|grpc|json|scss|stmt|func|const|struct)/i.test(clean)) {
      return true;
    }
  }

  if (/^\d{5,}$/.test(clean)) return true;
  return false;
}

/**
 * Helper to extract user's name from declaration text.
 */
function extractNameFromMessage(text) {
  if (!text) return null;
  const match = text.match(/(?:my name is|i am|i'm|call me|you can call me|the name is|this is|it's|everyone calls me)\s+([A-Za-z0-9_\-]+)/i);
  if (match && match[1]) {
    const raw = match[1].trim();
    const exclude = new Set(['a', 'an', 'the', 'here', 'now', 'there', 'just', 'not', 'atlas', 'zeoatlas', 'busy', 'writing', 'trying', 'building', 'asking', 'wondering', 'thinking', 'it', 'line', 'sentence', 'one', 'two', 'short', 'brief']);
    if (!exclude.has(raw.toLowerCase())) {
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
  }
  return null;
}

/**
 * Helper to extract custom note from explicit memory phrases:
 * e.g., "remember this: my favorite library is PyTorch" -> "my favorite library is PyTorch"
 */
function extractExplicitMemoryNote(text) {
  if (!text) return null;
  const regex = /(?:remember\s+(?:this|that|note)|save\s+(?:this\s+)?in\s+(?:your\s+)?memory|memorize\s+this|store\s+(?:this\s+)?in\s+(?:your\s+)?memory|keep\s+in\s+mind\s+that|make\s+a\s+note\s+that|note\s+that)\s*[:,-]?\s*(.+)/i;
  const match = text.match(regex);
  if (match && match[1] && match[1].trim().length > 2) {
    return match[1].trim();
  }
  return null;
}

/**
 * Centralized Intent Router with capabilities/limitations briefs on unsupported/unanswerable requests.
 * 
 * @param {Object} params
 * @param {string} params.message - Original user query
 * @param {string} params.intent - Predicted intent label
 * @param {number} params.confidence - Confidence score (0.0 to 1.0)
 * @param {Array} [params.conversationHistory] - Previous chat messages context
 * @param {Object} [params.userContext] - User profile info (nickname, name, customMemories)
 * @returns {Promise<{ message: string, intent: string, confidence: number, responseType: string, response: string, extractedName?: string, extractedMemory?: string }>}
 */
export async function routeIntent({ message, intent, confidence, conversationHistory = [], userContext = {}, onChunk = null, webSearch = false }) {
  const normalizedIntent = (intent || 'unknown').toLowerCase().trim();
  const threshold = parseFloat(process.env.ML_CONFIDENCE_THRESHOLD || '0.50');
  const isConfident = confidence >= threshold && normalizedIntent !== 'unknown';

  let responseType = 'fallback';
  let responseText = '';
  let extractedName = null;
  let extractedMemory = null;

  // 1. Explicit Memory Trigger (e.g. "remember this: ...", "save this in your memory: ...")
  const explicitNote = extractExplicitMemoryNote(message);
  if (explicitNote) {
    extractedMemory = explicitNote;
    responseType = 'memory';
    responseText = `I have saved that to my memory! 🧠\n\n📌 **Saved Note:** *"${explicitNote}"*\n\nI will remember this across your conversations. You can ask me *"what do you remember?"* at any time.`;
    if (onChunk) onChunk(responseText);
  }
  // 2. Memory Recall Queries (e.g. "what do you remember about me?", "what is in your memory?")
  else if (/(?:what\s+do\s+you\s+remember|what\s+is\s+in\s+your\s+memory|what\s+did\s+i\s+tell\s+you\s+to\s+remember|list\s+(?:my\s+)?memories|show\s+(?:my\s+)?memories|what\s+notes\s+do\s+you\s+have|what\s+have\s+you\s+saved)/i.test(message)) {
    responseType = 'memory';
    const knownName = userContext.nickname || userContext.name || 'Friend';
    const memories = userContext.customMemories || [];

    if (memories.length === 0) {
      responseText = `Here is what I know about you:\n• **Name**: **${knownName}**\n\nI don't have any custom notes stored yet! You can ask me to save anything by saying: *"Remember that my favorite stack is MERN"* or *"Save this in your memory: [note]"*.`;
    } else {
      const memoryItems = memories
        .map((m, idx) => `• **${idx + 1}.** ${typeof m === 'string' ? m : m.note}`)
        .join('\n');
      responseText = `Here is what I have saved in memory for you:\n\n👤 **User**: **${knownName}**\n\n🧠 **Saved Notes & Preferences**:\n${memoryItems}`;
    }
    if (onChunk) onChunk(responseText);
  }
  // 3. User Name Declaration (Crucial profile info - saved automatically ONLY if explicit name found)
  else if ((normalizedIntent === 'user_name_declare' || /my name is|call me/i.test(message)) && extractNameFromMessage(message)) {
    extractedName = extractNameFromMessage(message);
    responseType = 'memory';
    responseText = `Nice to meet you, **${extractedName}**! 👋 I've saved your name to your profile and will remember it. How can I help you today?`;
    if (onChunk) onChunk(responseText);
  }
  // 4. User Name Query Recall
  else if (normalizedIntent === 'user_name_query' || /what is my name|do you remember my name|who am i/i.test(message)) {
    responseType = 'memory';
    const knownName = userContext.nickname || userContext.name;
    if (knownName) {
      responseText = `Your name is **${knownName}**! 😊 Always glad to assist you. What are we working on?`;
    } else {
      responseText = `I don't have your name saved in this session yet! You can tell me by saying *"My name is [your name]"* and I'll remember it.`;
    }
    if (onChunk) onChunk(responseText);
  }
  // 5. App Chat Management (Renaming, Exporting, Deleting)
  else if (normalizedIntent === 'chat_management' || /(?:rename|change name of|delete|export|clear)\s+(?:this\s+)?(?:chat|conversation|title)/i.test(message)) {
    responseType = 'predefined';
    const pool = PREDEFINED_RESPONSES.chat_management;
    responseText = pool[0];
    if (onChunk) onChunk(responseText);
  }
  // 6. Predefined Conversational & Feature intents (unless web search is explicitly forced)
  else if (isConfident && SIMPLE_INTENTS.has(normalizedIntent) && !webSearch) {
    responseType = 'predefined';
    const pool = PREDEFINED_RESPONSES[normalizedIntent];
    responseText = pool[Math.floor(Math.random() * pool.length)];
    if (onChunk) onChunk(responseText);
  }
  // 7. Generative / Technical Knowledge intents (Gemini LLM Route)
  else if (isConfident && GENERATIVE_INTENTS.has(normalizedIntent)) {
    responseType = 'llm';
    if (onChunk) {
      responseText = await generateLLMStreamResponse(message, normalizedIntent, confidence, conversationHistory, onChunk, webSearch);
    } else {
      responseText = await generateLLMResponse(message, normalizedIntent, confidence, conversationHistory, webSearch);
    }
  }
  // 8. Unclassified / Low Confidence
  else {
    if (isGibberishOrSpam(message) && !webSearch) {
      responseType = 'fallback';
      responseText = FALLBACK_RESPONSES[0];
      if (onChunk) onChunk(responseText);
    } else {
      try {
        responseType = 'llm';
        console.log(`[Intent Router] 🌐 Routing query to Gemini LLM (webSearch: ${webSearch})`);
        if (onChunk) {
          responseText = await generateLLMStreamResponse(message, 'general_assistant', 0.90, conversationHistory, onChunk, webSearch);
        } else {
          responseText = await generateLLMResponse(message, 'general_assistant', 0.90, conversationHistory, webSearch);
        }
      } catch (err) {
        console.warn(`[Intent Router] LLM generation failed, providing capabilities brief:`, err.message);
        responseType = 'fallback';
        responseText = FALLBACK_RESPONSES[0];
        if (onChunk) onChunk(responseText);
      }
    }
  }

  // Safe server logging
  console.log(
    `[Intent Router] 📥 Query: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}" | 🎯 Intent: ${normalizedIntent} (${(confidence * 100).toFixed(1)}%) | ⚡ Route: ${responseType}`
  );

  return {
    message,
    intent: isConfident ? normalizedIntent : (isGibberishOrSpam(message) ? 'unknown' : 'general_assistant'),
    confidence: Number(confidence.toFixed(4)),
    responseType,
    response: responseText,
    extractedName,
    extractedMemory,
  };
}
