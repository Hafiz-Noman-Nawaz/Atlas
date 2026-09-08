import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'assistant', 'system'],
        message: '{VALUE} is not a valid message role',
      },
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Message = mongoose.model('Message', messageSchema);
