import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from './stores/authStore';
import { useUiStore } from './stores/uiStore';
import { setAuthTokenGetter } from './services/api';
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Code-split page components for fast initial load
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SharedChatPage = lazy(() => import('./pages/SharedChatPage'));

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function PageFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0B1320] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#1BD582]" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">Loading Shield Funding AI Assistant...</span>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>

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
