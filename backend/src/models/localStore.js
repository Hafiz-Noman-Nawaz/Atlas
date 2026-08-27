import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * In-memory / local storage data structures.
 * Provides instant zero-configuration database functionality
 * when a local MongoDB server is not installed.
 */
class LocalDatabase {
  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.feedbacks = new Map();
  }

  generateId() {
    return crypto.randomUUID();
  }

  // --- USER METHODS ---
  async createUser({ name, email, passwordHash }) {
    const id = this.generateId();
    const now = new Date().toISOString();
    const userDoc = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.passwordHash);
      },
      toJSON() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          is_active: this.isActive,
          created_at: this.createdAt,
        };
      },
    };
    this.users.set(id, userDoc);
    return userDoc;
  }

  async findUserByEmail(email) {
    const target = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === target) return user;
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id.toString()) || null;
  }

  // --- CONVERSATION METHODS ---
  async createConversation({ userId, title }) {
    const id = this.generateId();
    const now = new Date().toISOString();
    const convDoc = {
      _id: id,
      id,
      userId: userId.toString(),
      title: title || 'New Conversation',
      lastMessage: null,
      createdAt: now,
      updatedAt: now,
      async save() {
        this.updatedAt = new Date().toISOString();
        return this;
      },
      toJSON() {
        return {
          id: this.id,
          user_id: this.userId,
          title: this.title,
          last_message: this.lastMessage,
          created_at: this.createdAt,
          updated_at: this.updatedAt,
        };
      },
    };
    this.conversations.set(id, convDoc);
    return convDoc;
  }

  async findConversationsByUserId(userId, skip = 0, limit = 50) {
    const uid = userId.toString();
    const userConvs = [];
    for (const conv of this.conversations.values()) {
      if (conv.userId === uid) {
        userConvs.push(conv);
      }
    }
    userConvs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const total = userConvs.length;
    const items = userConvs.slice(skip, skip + limit);
    return { items, total };
  }

  async findConversationById(id, userId) {
    const conv = this.conversations.get(id.toString());
    if (!conv) return null;
    if (userId && conv.userId !== userId.toString()) return null;
    return conv;
  }

  async updateConversationTitle(id, userId, title) {
    const conv = await this.findConversationById(id, userId);
    if (!conv) return null;
    conv.title = title;
    conv.updatedAt = new Date().toISOString();
    return conv;
  }

  async deleteConversation(id, userId) {
    const conv = await this.findConversationById(id, userId);
    if (!conv) return null;
    this.conversations.delete(id.toString());
    for (const [msgId, msg] of this.messages.entries()) {
      if (msg.conversationId === id.toString()) {
        this.messages.delete(msgId);
      }
    }
    return conv;
  }

  // --- MESSAGE METHODS ---
  async createMessage({ conversationId, role, content, attachments = [], intent = null, confidence = null }) {
    const id = this.generateId();
    const now = new Date().toISOString();
    const msgDoc = {
      _id: id,
      id,
      conversationId: conversationId.toString(),
      role,
      content: content || '',
      attachments: attachments || [],
      intent,
      confidence,
      createdAt: now,
      toJSON() {
        return {
          id: this.id,
          conversation_id: this.conversationId,
          role: this.role,
          content: this.content,
          attachments: this.attachments || [],
          intent: this.intent,
          confidence: this.confidence,
          created_at: this.createdAt,
        };
      },
    };
    this.messages.set(id, msgDoc);
    return msgDoc;
  }

  async findMessagesByConversationId(conversationId, skip = 0, limit = 50) {
    const cid = conversationId.toString();
    const convMsgs = [];
    for (const msg of this.messages.values()) {
      if (msg.conversationId === cid) {
        convMsgs.push(msg);
      }
    }
    convMsgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return convMsgs.slice(skip, skip + limit);
  }

  async findRecentMessages(conversationId, limit = 20) {
    const cid = conversationId.toString();
    const convMsgs = [];
    for (const msg of this.messages.values()) {
      if (msg.conversationId === cid) {
        convMsgs.push(msg);
      }
    }
    convMsgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return convMsgs.slice(0, limit).reverse();
  }

  async findMessageById(id) {
    return this.messages.get(id.toString()) || null;
  }

  // --- FEEDBACK METHODS ---
  async findFeedbackByMessageId(messageId) {
    const mid = messageId.toString();
    for (const fb of this.feedbacks.values()) {
      if (fb.messageId === mid) return fb;
    }
    return null;
  }

  async createOrUpdateFeedback({ messageId, userId, rating, comment = null }) {
    const mid = messageId.toString();
    let fb = await this.findFeedbackByMessageId(mid);
    if (fb) {
      fb.rating = rating;
      fb.comment = comment;
      return fb;
    }

    const id = this.generateId();
    const now = new Date().toISOString();
    fb = {
      _id: id,
      id,
      messageId: mid,
      userId: userId.toString(),
      rating,
      comment,
      createdAt: now,
      toJSON() {
        return {
          id: this.id,
          message_id: this.messageId,
          rating: this.rating,
          comment: this.comment,
          created_at: this.createdAt,
        };
      },
    };
    this.feedbacks.set(id, fb);
    return fb;
  }
}

export const localDB = new LocalDatabase();
