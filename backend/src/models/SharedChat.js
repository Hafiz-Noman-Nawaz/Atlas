import mongoose from 'mongoose';

const SharedChatSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Shared Conversation',
    },
    messages: {
      type: Array,
      default: [],
    },
    userId: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const SharedChat = mongoose.models.SharedChat || mongoose.model('SharedChat', SharedChatSchema);
