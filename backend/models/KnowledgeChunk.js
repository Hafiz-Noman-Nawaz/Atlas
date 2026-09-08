import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    chunkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
      index: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Method to strip large embedding from standard JSON responses
knowledgeChunkSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
