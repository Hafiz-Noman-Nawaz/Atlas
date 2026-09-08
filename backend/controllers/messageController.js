import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { generateRAGResponse } from '../services/llm/geminiService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get all messages for a specific conversation
 * @route   GET /api/conversations/:id/messages
 * @access  Private
 */
export async function getMessages(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return successResponse(res, messages, 'Messages retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create a message in a conversation and get AI response
 * @route   POST /api/conversations/:id/messages
 * @access  Private
 */
export async function createMessage(req, res, next) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return errorResponse(res, 'Message content is required', 400);
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    // 1. Save user's message
    const userMessage = await Message.create({
      conversation: conversation._id,
      role: 'user',
      content: content.trim(),
    });

    // 2. Fetch past context for mock LLM service
    const history = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // 3. Generate AI response using Google Gemini + RAG
    const ragResult = await generateRAGResponse(content, history);

    // 4. Save assistant's message
    const assistantMessage = await Message.create({
      conversation: conversation._id,
      role: 'assistant',
      content: ragResult.content,
    });

    // 5. Update conversation title if this is the first message
    if (conversation.title === 'New Funding Consultation') {
      const generatedTitle = content.trim().slice(0, 40) + (content.length > 40 ? '...' : '');
      conversation.title = generatedTitle;
    }
    conversation.updatedAt = new Date();
    await conversation.save();

    return successResponse(
      res,
      {
        userMessage,
        assistantMessage,
        rag: {
          applied: ragResult.ragApplied,
          model: ragResult.model,
          sources: ragResult.sources,
        },
      },
      'Message sent and RAG response generated',
      201
    );
  } catch (error) {
    next(error);
  }
}
