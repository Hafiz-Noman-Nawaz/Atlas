import { ConversationRepository, FeedbackRepository, MessageRepository } from '../models/repository.js';

/**
 * @route   POST /api/messages/:id/feedback
 * @desc    Submit feedback on an assistant message
 * @access  Private
 */
export async function submitFeedback(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id || req.user.id;

    if (!rating || !['positive', 'negative'].includes(rating)) {
      return res.status(400).json({ detail: "Rating must be either 'positive' or 'negative'." });
    }

    const message = await MessageRepository.getById(req.params.id);
    if (!message) {
      return res.status(404).json({ detail: 'Message not found.' });
    }

    if (message.role !== 'assistant') {
      return res.status(400).json({ detail: 'Feedback can only be submitted for assistant messages.' });
    }

    // Verify conversation belongs to user
    const conversation = await ConversationRepository.getById(
      message.conversationId || message.conversation_id,
      userId
    );

    if (!conversation) {
      return res.status(404).json({ detail: 'Message not found.' });
    }

    const feedback = await FeedbackRepository.submit({
      messageId: message._id || message.id,
      userId,
      rating,
      comment: comment || null,
    });

    return res.status(201).json(feedback.toJSON());
  } catch (error) {
    next(error);
  }
}
