import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  X,
  User as UserIcon,
  Palette,
  Bot,
  Sliders,
  Database,
  Trash2,
  AlertTriangle,
  Check,
  Upload,
  Camera,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  CornerDownLeft,
  Download,
  ShieldAlert,
  Play,
  Save,
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { uploadApi } from '../../services/uploadApi';
import { mlApi, type MLPredictionResult } from '../../services/mlApi';
import { getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'appearance' | 'ai' | 'preferences' | 'data' | 'ml' | 'danger';

type Theme = 'light' | 'dark' | 'system';
type Creativity = 'focused' | 'balanced' | 'creative';
type FontSize = 'sm' | 'base' | 'lg';

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPanel() {
  const {
    settingsOpen,
    setSettingsOpen,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    sendOnEnter,
    setSendOnEnter,
    aiCreativity,
    setAiCreativity,
    fontSize,
    setFontSize,
  } = useUiStore();

  const { user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const localUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const rawConversations = useChatStore((s) => s.conversations);
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];
  const deleteAllConversations = useChatStore((s) => s.deleteAllConversations);

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile Form States
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Danger States
  const [confirmClear, setConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // ML Diagnostics States
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<MLPredictionResult | null>(null);
  const [isTestingML, setIsTestingML] = useState(false);

  const handleTestML = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    try {
      setIsTestingML(true);
      const res = await mlApi.predict(testQuery.trim());
      setTestResult(res);
    } catch {
      toast.error('Failed to run ML prediction.');
    } finally {
      setIsTestingML(false);
    }
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync profile data on mount / user change
  useEffect(() => {
    if (clerkUser) {
      setName(clerkUser.fullName || '');
      setNickname(localUser?.nickname || clerkUser.firstName || '');
      setCustomAvatar(localUser?.avatar_url || null);
    } else if (localUser) {
      setName(localUser.name || '');
      setNickname(localUser.nickname || '');
      setCustomAvatar(localUser.avatar_url || null);
    }
  }, [clerkUser, localUser, settingsOpen]);

  // Determine avatar to show (Google / Clerk profile picture OR custom avatar OR initials)
  const isGoogleUser = Boolean(clerkUser?.imageUrl);
  const displayAvatar = isGoogleUser ? clerkUser?.imageUrl : (customAvatar || localUser?.avatar_url);
  const displayName = nickname || name || clerkUser?.fullName || localUser?.name || 'User';
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || localUser?.email || '';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const uploaded = await uploadApi.uploadFile(file);
      setCustomAvatar(uploaded.url);
      await updateUser({ avatar_url: uploaded.url });
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await updateUser({
        name: name.trim(),
        nickname: nickname.trim(),
        avatar_url: customAvatar || undefined,
      });
      toast.success('Profile settings saved successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleClearAllConversations = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    try {
      setIsClearing(true);
      await deleteAllConversations();
      toast.success('All conversation history deleted.');
      setConfirmClear(false);
    } catch {
      toast.error('Failed to clear conversations.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportAllData = () => {
    if (conversations.length === 0) {
      toast.error('No conversation history to export.');
      return;
    }

    const exportBundle = {
      export_date: new Date().toISOString(),
      user: {
        name: displayName,
        email: displayEmail,
        nickname,
      },
      conversations,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlas_archive_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('All data exported successfully!');
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }

    try {
      setIsDeletingAccount(true);
      await deleteAccount();
      if (clerkUser) {
        await clerkSignOut();
      }
      setSettingsOpen(false);
      toast.success('Your account has been permanently deleted.');
    } catch {
      toast.error('Failed to delete account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex h-[580px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl md:flex-row"
            >
              {/* Sidebar Tabs */}
              <div className="flex flex-row md:flex-col justify-start border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg-secondary)] p-2 md:w-52 md:p-3 overflow-x-auto">
                <div className="hidden md:flex items-center gap-2 px-2 py-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#023047] text-[#1BD582] font-bold text-xs">
                    SF
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">Advisor Settings</span>
                </div>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <UserIcon size={15} />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Palette size={15} />
                  <span>Appearance</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Bot size={15} />
                  <span>AI Model</span>
                </button>

                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'preferences'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Sliders size={15} />
                  <span>Preferences</span>
                </button>

                <button
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'data'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Database size={15} />
                  <span>Data</span>
                </button>

                <button
                  onClick={() => setActiveTab('ml')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'ml'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Brain size={15} />
                  <span>ML Diagnostics</span>
                </button>

                <div className="my-1 hidden md:block border-t border-[var(--border-light)]" />

                <button
                  onClick={() => setActiveTab('danger')}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'danger'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  <ShieldAlert size={15} />
                  <span>Danger Zone</span>
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                    {activeTab === 'profile' && 'User Profile & Identity'}
                    {activeTab === 'appearance' && 'Theme & Visual Styling'}
                    {activeTab === 'ai' && 'AI Model & Intelligence Parameters'}
                    {activeTab === 'preferences' && 'Chat & Interaction Preferences'}
                    {activeTab === 'data' && 'Data Management & Exports'}
                    {activeTab === 'danger' && 'Account & Danger Zone'}
                  </h3>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Tab Pane Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* TAB 1: PROFILE */}
                  {activeTab === 'profile' && (
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      {/* Avatar Header */}
                      <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <div className="relative group">
                          {displayAvatar ? (
                            <img
                              src={displayAvatar}
                              alt="Avatar"
                              className="h-16 w-16 rounded-full object-cover border-2 border-accent/40 shadow-sm"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 border border-accent/40 text-heading-md font-bold text-accent">
                              {getInitials(displayName)}
                            </div>
                          )}

                          {!isGoogleUser && (
                            <button
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={isUploadingAvatar}
                              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
                            >
                              <Camera size={18} />
                            </button>
                          )}
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-body font-semibold text-[var(--text-primary)]">
                              {displayName}
                            </p>
                            {isGoogleUser && (
                              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400 border border-teal-500/20">
                                Google Connected
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-[var(--text-tertiary)]">{displayEmail}</p>

                          {!isGoogleUser ? (
                            <button
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={isUploadingAvatar}
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                            >
                              <Upload size={12} />
                              <span>{isUploadingAvatar ? 'Uploading...' : 'Upload custom photo'}</span>
                            </button>
                          ) : (
                            <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                              Avatar automatically synced with your Google account.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                            Nickname / Display Alias
                          </label>
                          <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g. Alex or AtlasDev"
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={displayEmail}
                          disabled
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/50 px-3 py-2 text-xs text-[var(--text-tertiary)] cursor-not-allowed"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
                        >
                          <Save size={13} />
                          <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TAB 2: APPEARANCE */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                          Theme Color Scheme
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {themes.map((t) => (
                            <button
                              key={t.value}
                              onClick={() => setTheme(t.value)}
                              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-medium transition-all ${
                                theme === t.value
                                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-sm'
                                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                              }`}
                            >
                              <t.icon size={20} />
                              <span>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-[var(--border-light)] pt-4">
                        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                          Chat Font Size
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'sm', label: 'Compact', size: '13px' },
                            { value: 'base', label: 'Default', size: '14.5px' },
                            { value: 'lg', label: 'Comfortable', size: '16px' },
                          ].map((f) => (
                            <button
                              key={f.value}
                              onClick={() => setFontSize(f.value as FontSize)}
                              className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs transition-colors ${
                                fontSize === f.value
                                  ? 'border-accent bg-accent/10 text-accent font-semibold'
                                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                              }`}
                            >
                              <span>{f.label}</span>
                              <span className="text-[10px] text-[var(--text-tertiary)]">{f.size}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AI MODEL */}
                  {activeTab === 'ai' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4">
                        <div className="flex items-center gap-2 text-teal-400 mb-1">
                          <Bot size={16} />
                          <span className="text-xs font-semibold uppercase tracking-wider">Active Engine</span>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          Google Gemini 3.5 Flash-Lite
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          Integrated with the persistent Python ML Intent Classification pipeline.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                          AI Creativity & Temperature
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'focused', label: 'Focused', desc: 'Precise code & logic' },
                            { value: 'balanced', label: 'Balanced', desc: 'Standard assistant' },
                            { value: 'creative', label: 'Creative', desc: 'Brainstorming' },
                          ].map((c) => (
                            <button
                              key={c.value}
                              onClick={() => setAiCreativity(c.value as Creativity)}
                              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                                aiCreativity === c.value
                                  ? 'border-accent bg-accent/10 text-accent font-semibold'
                                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                              }`}
                            >
                              <span className="text-xs font-medium">{c.label}</span>
                              <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{c.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PREFERENCES */}
                  {activeTab === 'preferences' && (
                    <div className="space-y-4">
                      {/* Send on enter */}
                      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3.5">
                        <div className="flex items-center gap-3">
                          <CornerDownLeft size={16} className="text-[var(--text-tertiary)]" />
                          <div>
                            <p className="text-xs font-medium text-[var(--text-primary)]">
                              Send message on Enter
                            </p>
                            <p className="text-[11px] text-[var(--text-tertiary)]">
                              Use Shift + Enter to add a new line in the text area.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={sendOnEnter}
                          onChange={(e) => setSendOnEnter(e.target.checked)}
                          className="h-4 w-4 rounded accent-accent cursor-pointer"
                        />
                      </div>

                      {/* Sound effects */}
                      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3.5">
                        <div className="flex items-center gap-3">
                          {soundEnabled ? (
                            <Volume2 size={16} className="text-teal-400" />
                          ) : (
                            <VolumeX size={16} className="text-[var(--text-tertiary)]" />
                          )}
                          <div>
                            <p className="text-xs font-medium text-[var(--text-primary)]">
                              Audio Completion Cues
                            </p>
                            <p className="text-[11px] text-[var(--text-tertiary)]">
                              Play a subtle chime when the advisor completes funding guidance.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={soundEnabled}
                          onChange={(e) => setSoundEnabled(e.target.checked)}
                          className="h-4 w-4 rounded accent-accent cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DATA */}
                  {activeTab === 'data' && (
                    <div className="space-y-4">
                      {/* Export entire data */}
                      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">
                            Export Full Chat History
                          </p>
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                            Download a complete JSON backup of all {conversations.length} conversation threads and metadata.
                          </p>
                        </div>
                        <button
                          onClick={handleExportAllData}
                          disabled={conversations.length === 0}
                          className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 transition-colors"
                        >
                          <Download size={13} />
                          <span>Export Archive</span>
                        </button>
                      </div>

                      {/* Clear history */}
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">
                              Clear All Conversations
                            </p>
                            <p className="text-[11px] text-[var(--text-tertiary)]">
                              Permanently delete all conversation logs from your database.
                            </p>
                          </div>
                        </div>

                        {confirmClear ? (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={handleClearAllConversations}
                              disabled={isClearing}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                            >
                              <Check size={14} />
                              <span>{isClearing ? 'Deleting...' : 'Confirm Clear All'}</span>
                            </button>
                            <button
                              onClick={() => setConfirmClear(false)}
                              disabled={isClearing}
                              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmClear(true)}
                            disabled={conversations.length === 0}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={13} />
                            <span>Clear All History</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: ML DIAGNOSTICS */}
                  {activeTab === 'ml' && (
                    <div className="space-y-4">
                      {/* Model Card */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                              <Brain size={18} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                                Calibrated LinearSVC Intent Engine
                              </h4>
                              <p className="text-[11px] text-[var(--text-tertiary)]">
                                32 Intent Classes • 14,546 Samples • L2 Regularization (C=0.8)
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                            100% Accuracy
                          </span>
                        </div>
                      </div>

                      {/* Interactive Query Tester */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">
                            Live Intent Classifier Playground
                          </p>
                          <p className="text-[11px] text-[var(--text-tertiary)]">
                            Test how any custom message or typo is classified by the trained ML pipeline.
                          </p>
                        </div>

                        <form onSubmit={handleTestML} className="flex gap-2">
                          <input
                            type="text"
                            value={testQuery}
                            onChange={(e) => setTestQuery(e.target.value)}
                            placeholder="e.g. can I change the name of this chat?"
                            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-accent focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isTestingML || !testQuery.trim()}
                            className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-light disabled:opacity-50 transition-all shadow-xs"
                          >
                            <Play size={13} className="fill-current" />
                            <span>{isTestingML ? 'Testing...' : 'Test'}</span>
                          </button>
                        </form>

                        {/* Prediction Results */}
                        {testResult && (
                          <div className="mt-3 space-y-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg)] p-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-[var(--text-tertiary)]">Top Prediction:</span>
                              <div className="flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-400">
                                <span>{testResult.intent}</span>
                                <span>• {(testResult.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>

                            {/* Confidence bar */}
                            <div className="h-1.5 w-full rounded-full bg-[var(--bg-hover)] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-400 transition-all duration-300"
                                style={{ width: `${Math.min(100, testResult.confidence * 100)}%` }}
                              />
                            </div>

                            {/* Top 3 breakdown */}
                            {testResult.top_predictions && testResult.top_predictions.length > 0 && (
                              <div className="pt-2 border-t border-[var(--border-light)] space-y-1.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                                  Top Alternative Predictions
                                </p>
                                {testResult.top_predictions.slice(0, 3).map((p, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-[11px]">
                                    <span className="text-[var(--text-secondary)]">{p.intent}</span>
                                    <span className="font-mono text-[var(--text-tertiary)]">
                                      {(p.confidence * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: DANGER ZONE */}
                  {activeTab === 'danger' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertTriangle size={16} />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Delete Account & Erase All Data
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          Once deleted, your account cannot be recovered. All your saved conversations, message history, intent records, and files will be permanently erased.
                        </p>

                        {!confirmDeleteAccount ? (
                          <button
                            onClick={() => setConfirmDeleteAccount(true)}
                            className="w-full rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Delete Client Account
                          </button>
                        ) : (
                          <div className="space-y-3 border-t border-red-500/20 pt-3">
                            <p className="text-xs font-medium text-red-400">
                              To confirm deletion, type <strong>DELETE</strong> below:
                            </p>
                            <input
                              type="text"
                              value={deleteInput}
                              onChange={(e) => setDeleteInput(e.target.value)}
                              placeholder="Type DELETE to confirm"
                              className="w-full rounded-xl border border-red-500/30 bg-black/20 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleteInput !== 'DELETE' || isDeletingAccount}
                                className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete'}
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteAccount(false);
                                  setDeleteInput('');
                                }}
                                className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
