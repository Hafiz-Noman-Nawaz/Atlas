import type { Attachment, ChatRequest, ChatResponse, FeedbackCreate, FeedbackResponse, Message } from '../types';
import { shieldMockService } from './shieldMockService';

/**
 * Chat API layer tailored for Shield Funding AI Assistant.
 * Fully decoupled mock service ensuring 100% reliable standalone frontend prototype.
 */
export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    let convId = data.conversation_id;
    if (!convId) {
      const newConv = await shieldMockService.createConversation('Business Funding Inquiry');
      convId = newConv.id;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      conversation_id: convId,
      role: 'user',
      content: data.message,
      attachments: data.attachments || [],
      intent: 'funding_inquiry',
      confidence: 0.98,
      created_at: new Date().toISOString(),
    };

    const responseText = (shieldMockService as any).generateResponse ? (shieldMockService as any).generateResponse(data.message) : '';

    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      conversation_id: convId,
      role: 'assistant',
      content: responseText,
      attachments: [],
      intent: 'shield_advisory',
      confidence: 0.99,
      created_at: new Date().toISOString(),
    };

    return {
      conversation_id: convId,
      user_message: userMessage,
      assistant_message: assistantMessage,
    };
  },

  sendMessageStream: async (
    data: ChatRequest,
    onChunk: (text: string) => void,
    onStart?: (conversationId: string, userMessage: Message) => void,
    onDone?: (conversationId: string, assistantMessage: Message) => void,
    onError?: (err: any) => void
  ): Promise<void> => {
    return shieldMockService.sendMessageStream(data, onChunk, onStart, onDone, onError);
  },

  getMessages: async (conversationId: string, _skip = 0, _limit = 50): Promise<Message[]> => {
    return shieldMockService.getMessages(conversationId);
  },

  uploadFiles: async (files: File[]): Promise<Attachment[]> => {
    // Client-side mock document attachments
    return files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      extractedText: `[Attached Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`,
    }));
  },

  submitFeedback: async (messageId: string, data: FeedbackCreate): Promise<FeedbackResponse> => {
    return {
      id: `fb-${Date.now()}`,
      message_id: messageId,
      rating: data.rating,
      comment: data.comment || null,
      created_at: new Date().toISOString(),
    };
  },

  createShareLink: async (_conversationId: string): Promise<{ share_id: string; share_url: string; title: string }> => {
    const shareId = `shield-share-${Date.now()}`;
    return {
      share_id: shareId,
      share_url: `${window.location.origin}/share/${shareId}`,
      title: 'Shield Funding AI Consultation',
    };
  },

  getSharedChat: async (_shareId: string): Promise<any> => {
    const convs = await shieldMockService.getConversations();
    const first = convs.items[0];
    const msgs = first ? await shieldMockService.getMessages(first.id) : [];
    return {
      share_id: _shareId,
      title: first ? first.title : 'Shield Funding Consultation',
      messages: msgs,
      views: 12,
      created_at: new Date().toISOString(),
    };
  },
};
