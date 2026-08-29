import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import App from './App';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Register PWA service worker in production/browser
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.info('[PWA] Service worker registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#0d9488',
            colorBackground: '#131620',
            colorInputBackground: '#1c202d',
            colorInputText: '#ffffff',
            colorText: '#f3f4f6',
            colorTextSecondary: '#9ca3af',
            colorNeutral: '#ffffff',
            borderRadius: '0.625rem',
            fontFamily: 'var(--font-sans)',
          },
          elements: {
            card: 'bg-[#131620] border border-[#262c3e] shadow-2xl rounded-2xl',
            headerTitle: 'text-white font-bold text-xl',
            headerSubtitle: 'text-slate-400 text-sm',
            socialButtonsBlockButton:
              'bg-[#1c202d] border border-[#2e364a] text-white hover:bg-[#252a3b] hover:border-slate-500 transition-all font-medium',
            socialButtonsBlockButtonText: 'text-white font-medium text-sm',
            dividerLine: 'bg-[#262c3e]',
            dividerText: 'text-slate-400 text-xs font-semibold uppercase tracking-wider',
            formFieldLabel: 'text-slate-300 font-medium text-xs uppercase tracking-wide mb-1.5',
            formFieldInput:
              'bg-[#1c202d] border border-[#2e364a] text-white placeholder-slate-500 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm py-2.5 px-3.5',
            formButtonPrimary:
              'bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-teal-600/20 active:scale-[0.99] transition-all text-sm',
            footerActionText: 'text-slate-400 text-sm',
            footerActionLink: 'text-teal-400 hover:text-teal-300 font-medium transition-colors',
            footer: 'bg-transparent border-none',
            identityPreviewText: 'text-white font-medium',
            identityPreviewEditButtonIcon: 'text-teal-400',
          },
        }}
      >
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
