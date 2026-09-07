// ─── Backend API Types ───────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  nickname?: string | null;
  email: string;
  avatar_url?: string | null;
  clerk_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string | null;
  is_pinned?: boolean;
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
}

export interface ConversationCreate {
  title?: string;
}

export interface ConversationUpdate {
  title: string;
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
  size?: number;
  extractedText?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  intent: string | null;
  confidence: number | null;
  created_at: string;
}

export interface ChatRequest {
  conversation_id: string | null;
  message: string;
  attachments?: Attachment[];
  web_search?: boolean;
}

export interface SharedChatResponse {
  share_id: string;
  title: string;
  messages: Message[];
  views: number;
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  user_message: Message;
  assistant_message: Message;
}

export type FeedbackRating = 'positive' | 'negative';

export interface FeedbackCreate {
  rating: FeedbackRating;
  comment?: string | null;
}

export interface FeedbackResponse {
  id: string;
  message_id: string;
  rating: string;
  comment: string | null;
  created_at: string;
}
