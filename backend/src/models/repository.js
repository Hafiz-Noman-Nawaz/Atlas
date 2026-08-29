import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { User as MongoUser } from './User.js';
import { Conversation as MongoConversation } from './Conversation.js';
import { Message as MongoMessage } from './Message.js';
import { Feedback as MongoFeedback } from './Feedback.js';
import { SharedChat as MongoSharedChat } from './SharedChat.js';
import { localDB } from './localStore.js';
import bcrypt from 'bcryptjs';

export const UserRepository = {
  async findByEmail(email) {
    if (isMongoConnected) {
      return await MongoUser.findOne({ email: email.toLowerCase() });
    }
    return await localDB.findUserByEmail(email);
  },

  async findByClerkId(clerkId) {
    if (isMongoConnected) {
      return await MongoUser.findOne({ clerkId });
    }
    for (const user of localDB.users.values()) {
      if (user.clerkId === clerkId) return user;
    }
    return null;
  },

  async findById(id) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      return await MongoUser.findById(id);
    }
    return await localDB.findUserById(id);
  },

  async create({ name, email, password, clerkId = null }) {
    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    if (isMongoConnected) {
      return await MongoUser.create({
        clerkId,
        name,
        email: email.toLowerCase(),
        passwordHash,
      });
    }
    const userDoc = await localDB.createUser({ name, email, passwordHash });
    userDoc.clerkId = clerkId;
    return userDoc;
  },

  async findOrCreateFromClerk({ clerkId, email, name }) {
    let user = await this.findByClerkId(clerkId);
    if (user) return user;

    user = await this.findByEmail(email);
    if (user) {
      user.clerkId = clerkId;
      await user.save();
      return user;
    }

    return await this.create({
      clerkId,
      email,
      name: name || email.split('@')[0],
      password: null,
    });
  },

  async updateProfile(userId, { name, nickname, avatarUrl }) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return null;
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (nickname !== undefined) updateData.nickname = nickname ? nickname.trim() : null;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      return await MongoUser.findByIdAndUpdate(userId, updateData, { new: true });
    }
    const user = await localDB.findUserById(userId);
    if (user) {
      if (name !== undefined) user.name = name.trim();
      if (nickname !== undefined) user.nickname = nickname ? nickname.trim() : null;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    }
    return user;
  },

  async addMemory(userId, note) {
    if (!note || !note.trim()) return null;
    const cleanNote = note.trim();
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return null;
      return await MongoUser.findByIdAndUpdate(
        userId,
        { $push: { customMemories: { note: cleanNote, createdAt: new Date() } } },
        { new: true }
      );
    }
    const user = await localDB.findUserById(userId);
    if (user) {
      if (!user.customMemories) user.customMemories = [];
      user.customMemories.push({ note: cleanNote, createdAt: new Date() });
    }
    return user;
  },

  async getMemories(userId) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return [];
      const user = await MongoUser.findById(userId).select('customMemories');
      return user?.customMemories || [];
    }
    const user = await localDB.findUserById(userId);
    return user?.customMemories || [];
  },

  async clearMemories(userId) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return false;
      await MongoUser.findByIdAndUpdate(userId, { $set: { customMemories: [] } });
      return true;
    }
    const user = await localDB.findUserById(userId);
    if (user) {
      user.customMemories = [];
    }
    return true;
  },

  async deleteAccount(userId) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return false;
      const convs = await MongoConversation.find({ userId });
      const convIds = convs.map((c) => c._id);
      await MongoMessage.deleteMany({ conversationId: { $in: convIds } });
      await MongoConversation.deleteMany({ userId });
      await MongoFeedback.deleteMany({ userId });
      await MongoUser.findByIdAndDelete(userId);
      return true;
    }
    const uid = userId.toString();
    localDB.users.delete(uid);
    for (const [id, conv] of localDB.conversations.entries()) {
      if (conv.userId === uid) {
        localDB.conversations.delete(id);
        for (const [msgId, msg] of localDB.messages.entries()) {
          if (msg.conversationId === id) {
            localDB.messages.delete(msgId);
          }
        }
      }
    }
    return true;
  },
};

export const ConversationRepository = {
  async listByUser(userId, skip = 0, limit = 50) {
    if (isMongoConnected) {
      const [conversations, total] = await Promise.all([
        MongoConversation.find({ userId })
          .sort({ isPinned: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        MongoConversation.countDocuments({ userId }),
      ]);
      return {
        items: conversations.map((c) => c.toJSON()),
        total,
      };
    }
    const result = await localDB.findConversationsByUserId(userId, skip, limit);
    result.items.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    return {
      items: result.items.map((c) => c.toJSON()),
      total: result.total,
    };
  },

  async togglePin(id, userId) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const conv = await MongoConversation.findOne({ _id: id, userId });
      if (!conv) return null;
      conv.isPinned = !conv.isPinned;
      await conv.save();
      return conv.toJSON();
    }
    const conv = await localDB.findConversationById(id, userId);
    if (conv) {
      conv.is_pinned = !conv.is_pinned;
      return conv;
    }
    return null;
  },

  async create(userId, title) {
    if (isMongoConnected) {
      return await MongoConversation.create({
        userId,
        title: (title && title.trim()) || 'New Conversation',
      });
    }
    return await localDB.createConversation({ userId, title });
  },

  async getById(id, userId) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await MongoConversation.findOne({ _id: id, userId });
    }
    return await localDB.findConversationById(id, userId);
  },

  async updateTitle(id, userId, title) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await MongoConversation.findOneAndUpdate(
        { _id: id, userId },
        { title: title.trim() },
        { new: true }
      );
    }
    return await localDB.updateConversationTitle(id, userId, title.trim());
  },

  async delete(id, userId) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const conv = await MongoConversation.findOneAndDelete({ _id: id, userId });
      if (conv) {
        await MongoMessage.deleteMany({ conversationId: conv._id });
      }
      return conv;
    }
    return await localDB.deleteConversation(id, userId);
  },

  async deleteAllByUser(userId) {
    if (isMongoConnected) {
      const convs = await MongoConversation.find({ userId });
      const convIds = convs.map((c) => c._id);
      await MongoMessage.deleteMany({ conversationId: { $in: convIds } });
      const result = await MongoConversation.deleteMany({ userId });
      return result.deletedCount;
    }
    const uid = userId.toString();
    let count = 0;
    for (const [id, conv] of localDB.conversations.entries()) {
      if (conv.userId === uid) {
        localDB.conversations.delete(id);
        count++;
        for (const [msgId, msg] of localDB.messages.entries()) {
          if (msg.conversationId === id) {
            localDB.messages.delete(msgId);
          }
        }
      }
    }
    return count;
  },
};

export const MessageRepository = {
  async create({ conversationId, role, content, attachments = [], intent = null, confidence = null }) {
    if (isMongoConnected) {
      return await MongoMessage.create({
        conversationId,
        role,
        content,
        attachments,
        intent,
        confidence,
      });
    }
    return await localDB.createMessage({ conversationId, role, content, attachments, intent, confidence });
  },

  async listByConversation(conversationId, skip = 0, limit = 50) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return [];
      const messages = await MongoMessage.find({ conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);
      return messages.map((m) => m.toJSON());
    }
    const messages = await localDB.findMessagesByConversationId(conversationId, skip, limit);
    return messages.map((m) => m.toJSON());
  },

  async getRecentHistory(conversationId, limit = 20) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return [];
      const recent = await MongoMessage.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit);
      return recent.reverse().map((m) => ({ role: m.role, content: m.content }));
    }
    const recent = await localDB.findRecentMessages(conversationId, limit);
    return recent.map((m) => ({ role: m.role, content: m.content }));
  },

  async getById(id) {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await MongoMessage.findById(id);
    }
    return await localDB.findMessageById(id);
  },
};

export const FeedbackRepository = {
  async submit({ messageId, userId, rating, comment = null }) {
    if (isMongoConnected) {
      let fb = await MongoFeedback.findOne({ messageId });
      if (fb) {
        fb.rating = rating;
        fb.comment = comment;
        await fb.save();
      } else {
        fb = await MongoFeedback.create({
          messageId,
          userId,
          rating,
          comment,
        });
      }
      return fb;
    }
    return await localDB.createOrUpdateFeedback({ messageId, userId, rating, comment });
  },
};

const localSharedChats = new Map();

export const ShareRepository = {
  async create({ shareId, conversationId, title, messages, userId = null }) {
    if (isMongoConnected) {
      return await MongoSharedChat.create({
        shareId,
        conversationId,
        title,
        messages,
        userId,
      });
    }
    const doc = {
      shareId,
      conversationId,
      title,
      messages,
      userId,
      views: 0,
      createdAt: new Date(),
    };
    localSharedChats.set(shareId, doc);
    return doc;
  },

  async findByShareId(shareId) {
    if (isMongoConnected) {
      const doc = await MongoSharedChat.findOne({ shareId });
      if (doc) {
        doc.views = (doc.views || 0) + 1;
        await doc.save();
        return doc;
      }
      return null;
    }
    const doc = localSharedChats.get(shareId);
    if (doc) {
      doc.views = (doc.views || 0) + 1;
      return doc;
    }
    return null;
  },
};

