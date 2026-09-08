import { Plus, Search, Settings, LogOut, PanelLeftClose, Layers, Calculator, PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import ConversationList from './ConversationList';
import ShieldLogo from '../common/ShieldLogo';
import FundingProductsModal from '../modals/FundingProductsModal';
import QualificationModal from '../modals/QualificationModal';
import ContactAdvisorModal from '../modals/ContactAdvisorModal';
import { getInitials } from '../../lib/utils';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function ClerkUserProfile() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-7 h-7',
          },
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
          {user.fullName || user.primaryEmailAddress?.emailAddress || 'Advisor Client'}
        </p>
        <p className="truncate text-[10px] text-[var(--text-tertiary)]">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  );
}

function LocalUserProfile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return (
      <div className="flex items-center gap-2 rounded-xl p-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-xs">
        <div className="w-6 h-6 rounded-full bg-[#023047] text-[#1BD582] flex items-center justify-center font-bold text-[10px]">
          SF
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate text-[var(--text-primary)]">Business Client</p>
          <p className="text-[10px] text-[var(--text-tertiary)] truncate">Shield Funding Portal</p>
        </div>
      </div>
    );
  }

  const displayName = user.nickname || user.name || 'Business Client';

  return (
    <div className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover border border-[#1BD582]"
          />
        ) : (
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#023047] text-xs font-bold text-[#1BD582] shadow-xs">
            {getInitials(displayName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{displayName}</p>
          <p className="truncate text-[10px] text-[var(--text-tertiary)]">{user.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex-shrink-0 rounded-md p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-red-500 transition-colors"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { createConversation } = useChatStore();
  const { setSidebarOpen, setSettingsOpen } = useUiStore();
  const [search, setSearch] = useState('');
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [qualModalOpen, setQualModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  async function handleNewConversation() {
    try {
      await createConversation();
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch {
      // Handled by store
    }
  }

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)]">
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-[var(--border-light)]">
        <ShieldLogo size="sm" />
        <button
          onClick={() => setSidebarOpen(false)}
          className="hidden rounded-md p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors md:flex items-center justify-center"
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New Consultation Primary Action */}
      <div className="p-3 pb-2">
        <button
          onClick={handleNewConversation}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-[#023047] dark:bg-[#132F4C] hover:bg-[#0B1E2E] dark:hover:bg-[#1A3E66] text-white px-3 py-2.5 text-xs font-bold tracking-wide shadow-sm transition-all"
        >
          <Plus size={15} className="text-[#1BD582]" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* Quick Access Tools */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={() => setQualModalOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors text-left"
        >
          <Calculator size={14} className="text-[#06C18C] flex-shrink-0" />
          <span>Check Qualifications</span>
        </button>
        <button
          onClick={() => setProductsModalOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors text-left"
        >
          <Layers size={14} className="text-[#137499] flex-shrink-0" />
          <span>Financing Programs</span>
        </button>
        <button
          onClick={() => setContactModalOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors text-left"
        >
          <PhoneCall size={14} className="text-amber-500 flex-shrink-0" />
          <span>Advisor Desk: (888) 882-6117</span>
        </button>
      </div>

      {/* Search Threads */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search consultation history…"
            className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-[#1BD582]"
          />
        </div>
      </div>

      {/* Consultation History Threads */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          <span>Consultation Threads</span>
        </div>
        <ConversationList searchFilter={search} />
      </div>

      {/* Bottom Actions & Application Link */}
      <div className="border-t border-[var(--border)] p-3 space-y-2 bg-[var(--bg-secondary)]">
        {/* Official Application Card */}
        <a
          href="https://shieldfunding.com/apply/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-[#1BD582]/30 hover:border-[#1BD582] transition-all group"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#06C18C]" />
            <div>
              <p className="text-xs font-bold text-[#023047] dark:text-[#1BD582]">Apply for Funding</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Same-day approval</p>
            </div>
          </div>
          <ExternalLink size={13} className="text-[#06C18C] group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* User Profile */}
        {CLERK_PUBLISHABLE_KEY ? <ClerkUserProfile /> : <LocalUserProfile />}

        {/* Settings button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings size={14} />
          <span>Advisor Preferences & Settings</span>
        </button>
      </div>

      {/* Modals */}
      <FundingProductsModal isOpen={productsModalOpen} onClose={() => setProductsModalOpen(false)} />
      <QualificationModal isOpen={qualModalOpen} onClose={() => setQualModalOpen(false)} />
      <ContactAdvisorModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </div>
  );
}
