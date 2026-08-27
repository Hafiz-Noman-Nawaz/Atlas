import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Registers Clerk's getToken function to inject fresh session tokens into API requests.
 */
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

/**
 * Resolves current authentication token (Clerk JWT or local JWT from storage).
 */
export async function getAuthToken(): Promise<string | null> {
  let token: string | null = null;
  if (tokenGetter) {
    try {
      token = await tokenGetter();
    } catch {
      token = null;
    }
  }

  if (!token) {
    token = localStorage.getItem('atlas_token');
  }
  return token;
}

// Attach JWT / Clerk token to every request
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('atlas_token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
