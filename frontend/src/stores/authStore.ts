import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../services/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setToken: (token: string) => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: { name?: string; nickname?: string; avatar_url?: string }) => Promise<User>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('atlas_token'),
  isAuthenticated: false,
  isLoading: true,

  setToken: (token: string) => {
    localStorage.setItem('atlas_token', token);
    set({ token });
  },

  fetchUser: async () => {
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      // Token is invalid or expired
      get().logout();
    }
  },

  updateUser: async (data) => {
    const updated = await authApi.updateProfile(data);
    set({ user: updated });
    return updated;
  },

  deleteAccount: async () => {
    await authApi.deleteAccount();
    get().logout();
  },

  logout: () => {
    localStorage.removeItem('atlas_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initialize: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      get().logout();
    }
  },
}));
