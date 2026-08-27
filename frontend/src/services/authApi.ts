import api from './api';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/login', data);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; nickname?: string; avatar_url?: string }): Promise<User> => {
    const res = await api.patch<User>('/auth/me', data);
    return res.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/me');
  },
};
