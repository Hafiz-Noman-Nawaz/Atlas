import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get all conversations for logged in user
 * @route   GET /api/conversations
 * @access  Private
 */
export async function getConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    return successResponse(res, conversations, 'Conversations retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create a new conversation
 * @route   POST /api/conversations
 * @access  Private
 */
export async function createConversation(req, res, next) {
  try {
    const { title } = req.body;

    const conversation = await Conversation.create({
      user: req.user._id,
      title: title && title.trim() ? title.trim() : 'New Funding Consultation',
    });

    return successResponse(res, conversation, 'Conversation created successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single conversation by ID
 * @route   GET /api/conversations/:id
 * @access  Private
 */
export async function getConversationById(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    return successResponse(res, conversation, 'Conversation retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a conversation and its messages
 * @route   DELETE /api/conversations/:id
 * @access  Private
 */
export async function deleteConversation(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    // Delete associated messages
    await Message.deleteMany({ conversation: conversation._id });

    // Delete conversation
    await Conversation.findByIdAndDelete(conversation._id);

    return successResponse(res, { id: req.params.id }, 'Conversation deleted successfully');
  } catch (error) {
    next(error);
  }
}
