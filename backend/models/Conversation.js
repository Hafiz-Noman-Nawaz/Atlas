import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Funding Consultation',
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Conversation = mongoose.model('Conversation', conversationSchema);
