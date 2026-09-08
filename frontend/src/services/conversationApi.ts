import type {
  Conversation,
  ConversationListResponse,
  ConversationUpdate,
} from '../types';
import { shieldMockService } from './shieldMockService';

export const conversationApi = {
  list: async (_skip = 0, _limit = 50): Promise<ConversationListResponse> => {
    return shieldMockService.getConversations();
  },

  get: async (id: string): Promise<Conversation> => {
    const list = await shieldMockService.getConversations();
    const found = list.items.find((c) => c.id === id);
    if (!found) throw new Error('Conversation not found');
    return found;
  },

  create: async (title?: string): Promise<Conversation> => {
    return shieldMockService.createConversation(title || 'New Funding Consultation');
  },

  update: async (id: string, data: ConversationUpdate): Promise<Conversation> => {
    return shieldMockService.updateConversationTitle(id, data.title);
  },

  togglePin: async (id: string): Promise<Conversation> => {
    return shieldMockService.togglePin(id);
  },

  delete: async (id: string): Promise<void> => {
    return shieldMockService.deleteConversation(id);
  },

  deleteAll: async (): Promise<void> => {
    return shieldMockService.deleteAllConversations();
  },
};
