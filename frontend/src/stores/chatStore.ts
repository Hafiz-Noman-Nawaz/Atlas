import { create } from 'zustand';
import type { Attachment, Conversation, Message } from '../types';
import { conversationApi } from '../services/conversationApi';
import { chatApi } from '../services/chatApi';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  streamingContent: string;
  searchQuery: string;
  webSearchEnabled: boolean;
  error: string | null;

  // Search & Filter
  setSearchQuery: (query: string) => void;
  toggleWebSearch: () => void;
  setWebSearchEnabled: (enabled: boolean) => void;

  // Conversations
  fetchConversations: () => Promise<void>;
  setActiveConversation: (id: string | null) => Promise<void>;
  createConversation: () => Promise<Conversation>;
  renameConversation: (id: string, title: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteAllConversations: () => Promise<void>;

  // Messages
  sendMessage: (message: string, attachments?: Attachment[]) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  streamingContent: '',
  searchQuery: '',
  webSearchEnabled: false,
  error: null,

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  toggleWebSearch: () => set((s) => ({ webSearchEnabled: !s.webSearchEnabled })),
  setWebSearchEnabled: (webSearchEnabled: boolean) => set({ webSearchEnabled }),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const data = await conversationApi.list();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      set({ conversations: items, isLoadingConversations: false });
    } catch {
      set({ conversations: [], isLoadingConversations: false, error: 'Failed to load conversations.' });
    }
  },

  setActiveConversation: async (id: string | null) => {
    set({ activeConversationId: id, messages: [], streamingContent: '', error: null });
    if (!id) return;

    set({ isLoadingMessages: true });
    try {
      const messages = await chatApi.getMessages(id);
      const msgList = Array.isArray(messages)
        ? messages
        : Array.isArray((messages as any)?.items)
        ? (messages as any).items
        : [];
      set({ messages: msgList, isLoadingMessages: false });
    } catch {
      set({ messages: [], isLoadingMessages: false, error: 'Failed to load messages.' });
    }
  },

  createConversation: async () => {
    try {
      const conv = await conversationApi.create();
      set((state) => ({
        conversations: [conv, ...(state.conversations || [])],
        activeConversationId: conv.id,
        messages: [],
        streamingContent: '',
        error: null,
      }));
      return conv;
    } catch {
      const fallbackConv: Conversation = {
        id: `local-${Date.now()}`,
        title: 'New Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({
        conversations: [fallbackConv, ...(state.conversations || [])],
        activeConversationId: fallbackConv.id,
        messages: [],
        streamingContent: '',
      }));
      return fallbackConv;
    }
  },

  renameConversation: async (id: string, title: string) => {
    try {
      const updated = await conversationApi.update(id, { title });
      set((state) => ({
        conversations: (state.conversations || []).map((c) => (c.id === id ? { ...c, title: updated.title } : c)),
      }));
    } catch {
      set({ error: 'Failed to rename conversation.' });
    }
  },

  togglePinConversation: async (id: string) => {
    try {
      const updated = await conversationApi.togglePin(id);
      set((state) => {
        const nextConvs = (state.conversations || []).map((c) =>
          c.id === id ? { ...c, is_pinned: updated.is_pinned } : c
        );
        // Re-sort: pinned on top, then by updated_at
        nextConvs.sort((a, b) => {
          if (Boolean(b.is_pinned) !== Boolean(a.is_pinned)) {
            return b.is_pinned ? 1 : -1;
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        return { conversations: nextConvs };
      });
    } catch {
      set({ error: 'Failed to update pin status.' });
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await conversationApi.delete(id);
      const { activeConversationId, conversations = [] } = get();
      const remaining = (conversations || []).filter((c) => c.id !== id);
      set({
        conversations: remaining,
        activeConversationId: activeConversationId === id ? (remaining[0]?.id ?? null) : activeConversationId,
        messages: activeConversationId === id ? [] : get().messages || [],
      });
      if (activeConversationId === id && remaining[0]?.id) {
        get().setActiveConversation(remaining[0].id);
      }
    } catch {
      set({ error: 'Failed to delete conversation.' });
    }
  },

  deleteAllConversations: async () => {
    try {
      await conversationApi.deleteAll();
    } catch {
      // Ignored
    }
    set({
      conversations: [],
      activeConversationId: null,
      messages: [],
      streamingContent: '',
    });
  },

  sendMessage: async (message: string, attachments: Attachment[] = []) => {
    const { activeConversationId, webSearchEnabled } = get();
    set({ isSending: true, streamingContent: '', error: null });

    let currentConversationId = activeConversationId;

    try {
      let accumulatedStreaming = '';

      await chatApi.sendMessageStream(
        {
          conversation_id: currentConversationId,
          message,
          attachments,
          web_search: webSearchEnabled,
        },
        (chunkText) => {
          accumulatedStreaming += chunkText;
          set({ streamingContent: accumulatedStreaming });
        },
        (newConvId, userMsg) => {
          currentConversationId = newConvId;
          set((state) => ({
            activeConversationId: newConvId,
            messages: [...state.messages, userMsg],
          }));
        },
        (finalConvId, assistantMsg) => {
          set((state) => ({
            activeConversationId: finalConvId,
            messages: [...state.messages, assistantMsg],
            streamingContent: '',
            isSending: false,
          }));

          // Refresh or update conversations list
          get().fetchConversations();
        },
        (streamErr) => {
          console.error('[Stream Error]', streamErr);
          set({ isSending: false, streamingContent: '', error: 'Streaming error occurred.' });
        }
      );
    } catch {
      set({ isSending: false, streamingContent: '', error: 'Failed to send message. Please try again.' });
    }
  },

  clearMessages: () => set({ messages: [], activeConversationId: null, streamingContent: '' }),
  clearError: () => set({ error: null }),
}));
