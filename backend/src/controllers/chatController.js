import { UserRepository, ConversationRepository, MessageRepository } from '../models/repository.js';
import { getChatbotResponse } from '../services/chatbotService.js';

/**
 * @route   POST /api/chat
 * @desc    Send a message (with optional attachments), generate chatbot response, and persist both
 * @access  Private
 */
export async function sendMessage(req, res, next) {
  try {
    const { conversation_id, message, attachments = [] } = req.body;
    const userId = req.user._id || req.user.id;

    const textContent = (message && message.trim()) || '';
    if (!textContent && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ detail: 'Message or attachment is required.' });
    }

    let conversation;

    // 1. Resolve or create conversation
    if (conversation_id) {
      conversation = await ConversationRepository.getById(conversation_id, userId);
      if (!conversation) {
        return res.status(404).json({ detail: 'Conversation not found.' });
      }
    } else {
      let title = textContent.slice(0, 50);
      if (!title && attachments.length > 0) {
        title = `Attachment: ${attachments[0].name}`;
      } else if (textContent.length > 50) {
        title += '...';
      }
      conversation = await ConversationRepository.create(userId, title);
    }

    const conversationId = conversation._id || conversation.id;

    // 2. Save user message with attachments
    const userMessage = await MessageRepository.create({
      conversationId,
      role: 'user',
      content: textContent,
      attachments,
    });

    // 3. Build history context and user context (including explicit memories)
    const historyContext = await MessageRepository.getRecentHistory(conversationId, 20);
    const customMemories = req.user.customMemories || (await UserRepository.getMemories(userId)) || [];
    const userContext = {
      name: req.user.name,
      nickname: req.user.nickname,
      email: req.user.email,
      customMemories,
    };

    // 4. Build rich prompt with document text if attached
    let docContext = '';
    if (attachments.length > 0) {
      const extractedDocs = attachments
        .filter(a => a.extractedText)
        .map(a => `\n--- Document: ${a.name} ---\n${a.extractedText}\n--- End Document ---`)
        .join('\n');
      if (extractedDocs) {
        docContext = `\n[Attached Documents Content]:${extractedDocs}\n`;
      }
    }

    const promptForBot = (textContent + docContext) || (attachments.length > 0 ? `[User uploaded: ${attachments.map(a => a.name).join(', ')}]` : '');
    const botResponse = await getChatbotResponse(promptForBot, historyContext, userContext);

    // 4b. Auto-persist crucial user profile info (name/nickname)
    if (botResponse.extractedName) {
      await UserRepository.updateProfile(userId, { nickname: botResponse.extractedName });
      req.user.nickname = botResponse.extractedName;
    }

    // 4c. Persist explicit memory note when user asked to "remember this / save in memory"
    if (botResponse.extractedMemory) {
      await UserRepository.addMemory(userId, botResponse.extractedMemory);
    }

    // 5. Save assistant message
    const assistantMessage = await MessageRepository.create({
      conversationId,
      role: 'assistant',
      content: botResponse.message,
      attachments: [],
      intent: botResponse.intent,
      confidence: botResponse.confidence,
    });

    // 6. Update conversation last message preview
    conversation.lastMessage = assistantMessage.content.slice(0, 100);
    await conversation.save();

    return res.json({
      conversation_id: conversationId.toString(),
      user_message: userMessage.toJSON(),
      assistant_message: assistantMessage.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/chat/stream
 * @desc    Send a message and stream response tokens via Server-Sent Events (SSE)
 * @access  Private
 */
export async function sendMessageStream(req, res, next) {
  try {
    const { conversation_id, message, attachments = [] } = req.body;
    const userId = req.user._id || req.user.id;

    const textContent = (message && message.trim()) || '';
    if (!textContent && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ detail: 'Message or attachment is required.' });
    }

    let conversation;

    // 1. Resolve or create conversation
    if (conversation_id) {
      conversation = await ConversationRepository.getById(conversation_id, userId);
      if (!conversation) {
        return res.status(404).json({ detail: 'Conversation not found.' });
      }
    } else {
      let title = textContent.slice(0, 50);
      if (!title && attachments.length > 0) {
        title = `Attachment: ${attachments[0].name}`;
      } else if (textContent.length > 50) {
        title += '...';
      }
      conversation = await ConversationRepository.create(userId, title);
    }

    const conversationId = conversation._id || conversation.id;

    // 2. Save user message
    const userMessage = await MessageRepository.create({
      conversationId,
      role: 'user',
      content: textContent,
      attachments,
    });

    // Configure SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Send initial metadata event
    res.write(`data: ${JSON.stringify({
      type: 'start',
      conversation_id: conversationId.toString(),
      user_message: userMessage.toJSON(),
    })}\n\n`);

    // 3. Build history context and user context
    const historyContext = await MessageRepository.getRecentHistory(conversationId, 20);
    const customMemories = req.user.customMemories || (await UserRepository.getMemories(userId)) || [];
    const userContext = {
      name: req.user.name,
      nickname: req.user.nickname,
      email: req.user.email,
      customMemories,
    };

    // 4. Build prompt with attached document content
    let docContext = '';
    if (attachments.length > 0) {
      const extractedDocs = attachments
        .filter(a => a.extractedText)
        .map(a => `\n--- Document: ${a.name} ---\n${a.extractedText}\n--- End Document ---`)
        .join('\n');
      if (extractedDocs) {
        docContext = `\n[Attached Documents Content]:${extractedDocs}\n`;
      }
    }

    const promptForBot = (textContent + docContext) || (attachments.length > 0 ? `[User uploaded: ${attachments.map(a => a.name).join(', ')}]` : '');

    // 5. Generate response with real-time SSE chunk streaming
    const botResponse = await getChatbotResponse(
      promptForBot,
      historyContext,
      userContext,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
      }
    );

    // 5b. Memory Persistence
    if (botResponse.extractedName) {
      await UserRepository.updateProfile(userId, { nickname: botResponse.extractedName });
      req.user.nickname = botResponse.extractedName;
    }
    if (botResponse.extractedMemory) {
      await UserRepository.addMemory(userId, botResponse.extractedMemory);
    }

    // 6. Save final assistant message in database
    const assistantMessage = await MessageRepository.create({
      conversationId,
      role: 'assistant',
      content: botResponse.message,
      attachments: [],
      intent: botResponse.intent,
      confidence: botResponse.confidence,
    });

    conversation.lastMessage = assistantMessage.content.slice(0, 100);
    await conversation.save();

    // Send final completion event
    res.write(`data: ${JSON.stringify({
      type: 'done',
      conversation_id: conversationId.toString(),
      assistant_message: assistantMessage.toJSON(),
    })}\n\n`);

    res.end();
  } catch (error) {
    console.error('[SSE Error]', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
}

/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Get paginated messages for a conversation in chronological order
 * @access  Private
 */
export async function getMessages(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const conversation = await ConversationRepository.getById(req.params.id, userId);

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found.' });
    }

    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 50;

    const messages = await MessageRepository.listByConversation(
      conversation._id || conversation.id,
      skip,
      limit
    );

    return res.json({
      messages: messages.map((m) => (typeof m.toJSON === 'function' ? m.toJSON() : m)),
      total: messages.length,
    });
  } catch (error) {
    next(error);
  }
}
