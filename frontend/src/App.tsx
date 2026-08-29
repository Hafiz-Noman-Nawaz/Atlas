import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from './stores/authStore';
import { useUiStore } from './stores/uiStore';
import { setAuthTokenGetter } from './services/api';
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import SharedChatPage from './pages/SharedChatPage';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    if (CLERK_PUBLISHABLE_KEY) {
      setAuthTokenGetter(() => getToken());
    }
  }, [getToken]);

  return null;
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const initializeTheme = useUiStore((s) => s.initializeTheme);

  useEffect(() => {
    initialize();
    initializeTheme();
  }, [initialize, initializeTheme]);

  return (
    <BrowserRouter>
      {CLERK_PUBLISHABLE_KEY && <ClerkTokenBridge />}
      <Routes>
        {/* Public shared chat route */}
        <Route path="/share/:shareId" element={<SharedChatPage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/register/*" element={<RegisterPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ChatPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(172 66% 40%)',
              secondary: 'white',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}
