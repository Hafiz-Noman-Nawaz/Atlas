import api from './api';
import type {
  Conversation,
  ConversationListResponse,
  ConversationUpdate,
} from '../types';

export const conversationApi = {
  list: async (skip = 0, limit = 50): Promise<ConversationListResponse> => {
    const res = await api.get<ConversationListResponse>('/conversations', {
      params: { skip, limit },
    });
    return res.data;
  },

  get: async (id: string): Promise<Conversation> => {
    const res = await api.get<Conversation>(`/conversations/${id}`);
    return res.data;
  },

  create: async (title?: string): Promise<Conversation> => {
    const res = await api.post<Conversation>('/conversations', { title: title || 'New Conversation' });
    return res.data;
  },

  update: async (id: string, data: ConversationUpdate): Promise<Conversation> => {
    const res = await api.patch<Conversation>(`/conversations/${id}`, data);
    return res.data;
  },

  togglePin: async (id: string): Promise<Conversation> => {
    const res = await api.patch<Conversation>(`/conversations/${id}/pin`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await api.delete('/conversations');
  },
};
