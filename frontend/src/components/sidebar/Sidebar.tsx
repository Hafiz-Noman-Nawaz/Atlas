import { Plus, Search, Settings, LogOut, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import ConversationList from './ConversationList';
import { getInitials } from '../../lib/utils';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function ClerkUserProfile() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-7 h-7',
          },
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-[var(--text-primary)]">
          {user.fullName || user.primaryEmailAddress?.emailAddress || 'User'}
        </p>
        <p className="truncate text-[11px] text-[var(--text-tertiary)]">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  );
}

function LocalUserProfile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const displayName = user.nickname || user.name || 'User';

  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover border border-accent/30"
          />
        ) : (
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-xs">
            {getInitials(displayName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-body-sm font-medium text-[var(--text-primary)]">{displayName}</p>
          <p className="truncate text-[11px] text-[var(--text-tertiary)]">{user.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex-shrink-0 rounded-md p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-red-500 transition-colors"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { createConversation } = useChatStore();
  const { setSidebarOpen, setSettingsOpen } = useUiStore();
  const [search, setSearch] = useState('');

  async function handleNewConversation() {
    try {
      await createConversation();
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch {
      // Error handled by store
    }
  }

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)]">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <span className="text-heading-sm text-[var(--text-primary)]" style={{ fontSize: 16 }}>
            Atlas
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="hidden rounded-md p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors md:flex items-center justify-center"
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New conversation */}
      <div className="px-3 pb-2">
        <button
          onClick={handleNewConversation}
          className="focus-ring flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-body-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Plus size={16} />
          New conversation
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="focus-ring w-full rounded-md border border-[var(--border-light)] bg-transparent py-1.5 pl-8 pr-3 text-body-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        <ConversationList searchFilter={search} />
      </div>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] p-3 space-y-1">
        <button
          onClick={() => setSettingsOpen(true)}
          className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-body-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings size={16} />
          Settings
        </button>

        {CLERK_PUBLISHABLE_KEY ? <ClerkUserProfile /> : <LocalUserProfile />}
      </div>
    </div>
  );
}
