import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type Creativity = 'focused' | 'balanced' | 'creative';
type FontSize = 'sm' | 'base' | 'lg';

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  settingsOpen: boolean;
  deleteDialogId: string | null;
  renameDialogId: string | null;
  shareDialogOpen: boolean;
  shareDialogConversationId: string | null;

  // Code Canvas Panel State
  canvasOpen: boolean;
  canvasCode: string;
  canvasLanguage: string;
  canvasTitle: string;

  // Text to Speech State
  ttsSpeakingId: string | null;

  // Preferences
  soundEnabled: boolean;
  sendOnEnter: boolean;
  aiCreativity: Creativity;
  fontSize: FontSize;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setSettingsOpen: (open: boolean) => void;
  setDeleteDialogId: (id: string | null) => void;
  setRenameDialogId: (id: string | null) => void;
  setShareDialogOpen: (open: boolean, convId?: string | null) => void;

  // Canvas methods
  openCanvas: (code: string, language: string, title?: string) => void;
  closeCanvas: () => void;
  setCanvasCode: (code: string) => void;

  // TTS methods
  setTtsSpeakingId: (id: string | null) => void;

  setSoundEnabled: (enabled: boolean) => void;
  setSendOnEnter: (send: boolean) => void;
  setAiCreativity: (creativity: Creativity) => void;
  setFontSize: (size: FontSize) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  theme: (localStorage.getItem('atlas_theme') as Theme) || 'light',
  settingsOpen: false,
  deleteDialogId: null,
  renameDialogId: null,
  shareDialogOpen: false,
  shareDialogConversationId: null,

  // Canvas
  canvasOpen: false,
  canvasCode: '',
  canvasLanguage: 'html',
  canvasTitle: 'Code Sandbox',

  // TTS
  ttsSpeakingId: null,

  soundEnabled: localStorage.getItem('atlas_sound') !== 'false',
  sendOnEnter: localStorage.getItem('atlas_send_on_enter') !== 'false',
  aiCreativity: (localStorage.getItem('atlas_creativity') as Creativity) || 'balanced',
  fontSize: (localStorage.getItem('atlas_fontsize') as FontSize) || 'base',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem('atlas_theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const resolved = current === 'system' ? getSystemTheme() : current;
    const next: Theme = resolved === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setDeleteDialogId: (id) => set({ deleteDialogId: id }),
  setRenameDialogId: (id) => set({ renameDialogId: id }),
  setShareDialogOpen: (open, convId = null) => set({ shareDialogOpen: open, shareDialogConversationId: convId }),

  openCanvas: (code, language, title = 'Code Sandbox') =>
    set({
      canvasOpen: true,
      canvasCode: code,
      canvasLanguage: language.toLowerCase(),
      canvasTitle: title,
    }),
  closeCanvas: () => set({ canvasOpen: false }),
  setCanvasCode: (code) => set({ canvasCode: code }),

  setTtsSpeakingId: (id) => set({ ttsSpeakingId: id }),

  setSoundEnabled: (soundEnabled) => {
    localStorage.setItem('atlas_sound', String(soundEnabled));
    set({ soundEnabled });
  },

  setSendOnEnter: (sendOnEnter) => {
    localStorage.setItem('atlas_send_on_enter', String(sendOnEnter));
    set({ sendOnEnter });
  },

  setAiCreativity: (aiCreativity) => {
    localStorage.setItem('atlas_creativity', aiCreativity);
    set({ aiCreativity });
  },

  setFontSize: (fontSize) => {
    localStorage.setItem('atlas_fontsize', fontSize);
    set({ fontSize });
  },

  initializeTheme: () => {
    const theme = get().theme;
    applyTheme(theme);

    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (get().theme === 'system') {
        applyTheme('system');
      }
    });
  },
}));
