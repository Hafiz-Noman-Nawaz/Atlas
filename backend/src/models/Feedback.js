import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: String,
      enum: ['positive', 'negative'],
      required: true,
    },
    comment: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.message_id = ret.messageId ? ret.messageId.toString() : null;
        ret.created_at = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        delete ret.messageId;
        delete ret.userId;
        delete ret.createdAt;
        return ret;
      },
    },
  }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
