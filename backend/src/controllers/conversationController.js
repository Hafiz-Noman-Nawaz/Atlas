import { ConversationRepository } from '../models/repository.js';

/**
 * @route   GET /api/conversations
 * @desc    List all conversations for the authenticated user
 * @access  Private
 */
export async function listConversations(req, res, next) {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 50;

    const data = await ConversationRepository.listByUser(req.user._id || req.user.id, skip, limit);
    return res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/conversations
 * @desc    Create a new empty conversation
 * @access  Private
 */
export async function createConversation(req, res, next) {
  try {
    const { title } = req.body || {};
    const conversation = await ConversationRepository.create(
      req.user._id || req.user.id,
      title
    );

    return res.status(201).json(conversation.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/conversations/:id
 * @desc    Get a single conversation by ID
 * @access  Private
 */
export async function getConversation(req, res, next) {
  try {
    const conversation = await ConversationRepository.getById(
      req.params.id,
      req.user._id || req.user.id
    );

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found.' });
    }

    return res.json(conversation.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * @route   PATCH /api/conversations/:id
 * @desc    Update a conversation title
 * @access  Private
 */
export async function updateConversation(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ detail: 'Title is required.' });
    }

    const conversation = await ConversationRepository.updateTitle(
      req.params.id,
      req.user._id || req.user.id,
      title.trim()
    );

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found.' });
    }

    return res.json(conversation.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Delete a conversation and its messages
 * @access  Private
 */
export async function deleteConversation(req, res, next) {
  try {
    const conversation = await ConversationRepository.delete(
      req.params.id,
      req.user._id || req.user.id
    );

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found.' });
    }

    return res.json({ detail: 'Conversation deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   PATCH /api/conversations/:id/pin
 * @desc    Toggle pin status for a conversation
 * @access  Private
 */
export async function togglePinConversation(req, res, next) {
  try {
    const conversation = await ConversationRepository.togglePin(
      req.params.id,
      req.user._id || req.user.id
    );

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found.' });
    }

    return res.json(conversation);
  } catch (error) {
    next(error);
  }
}

/**
 * @route   DELETE /api/conversations
 * @desc    Delete ALL conversations and messages for the user
 * @access  Private
 */
export async function deleteAllConversations(req, res, next) {
  try {
    await ConversationRepository.deleteAllByUser(req.user._id || req.user.id);
    return res.json({ detail: 'All conversations and history cleared successfully.' });
  } catch (error) {
    next(error);
  }
}
