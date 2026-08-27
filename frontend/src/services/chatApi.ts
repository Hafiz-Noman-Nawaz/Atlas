import api, { getAuthToken } from './api';
import type { Attachment, ChatRequest, ChatResponse, FeedbackCreate, FeedbackResponse, Message } from '../types';

export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const res = await api.post<ChatResponse>('/chat', data);
    return res.data;
  },

  sendMessageStream: async (
    data: ChatRequest,
    onChunk: (text: string) => void,
    onStart?: (conversationId: string, userMessage: Message) => void,
    onDone?: (conversationId: string, assistantMessage: Message) => void,
    onError?: (err: any) => void
  ): Promise<void> => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${api.defaults.baseURL || 'http://localhost:8000/api'}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body for stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const payload = JSON.parse(trimmed.slice(6));
              if (payload.type === 'start' && onStart) {
                onStart(payload.conversation_id, payload.user_message);
              } else if (payload.type === 'chunk') {
                onChunk(payload.text);
              } else if (payload.type === 'done' && onDone) {
                onDone(payload.conversation_id, payload.assistant_message);
              } else if (payload.type === 'error' && onError) {
                onError(new Error(payload.error));
              }
            } catch (err) {
              console.warn('[SSE Parse Warning]', err);
            }
          }
        }
      }
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  },

  getMessages: async (conversationId: string, skip = 0, limit = 50): Promise<Message[]> => {
    const res = await api.get<any>(`/conversations/${conversationId}/messages`, {
      params: { skip, limit },
    });
    if (res.data && Array.isArray(res.data.messages)) {
      return res.data.messages;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  uploadFiles: async (files: File[]): Promise<Attachment[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await api.post<{ success: boolean; files: Attachment[] }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.files;
  },

  submitFeedback: async (messageId: string, data: FeedbackCreate): Promise<FeedbackResponse> => {
    const res = await api.post<FeedbackResponse>(`/messages/${messageId}/feedback`, data);
    return res.data;
  },
};
