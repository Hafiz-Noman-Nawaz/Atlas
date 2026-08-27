import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, default: null },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    intent: {
      type: String,
      default: null,
    },
    confidence: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.conversation_id = ret.conversationId ? ret.conversationId.toString() : null;
        ret.created_at = ret.createdAt;
        ret.attachments = ret.attachments || [];
        delete ret._id;
        delete ret.__v;
        delete ret.conversationId;
        delete ret.createdAt;
        return ret;
      },
    },
  }
);

export const Message = mongoose.model('Message', messageSchema);
