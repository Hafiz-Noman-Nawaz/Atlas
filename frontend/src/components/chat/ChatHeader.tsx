import { useState, useRef, useEffect } from 'react';
import { PanelLeft, Menu, Pencil, Trash2, Download, FileText, FileCode, ChevronDown, Share2, Phone, ExternalLink, Calculator, Sun, Moon } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import ShieldLogo from '../common/ShieldLogo';
import FundingCalculatorModal from '../modals/FundingCalculatorModal';
import toast from 'react-hot-toast';

export default function ChatHeader() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const rawConversations = useChatStore((s) => s.conversations);
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];
  const rawMessages = useChatStore((s) => s.messages);
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  const { sidebarOpen, setSidebarOpen, toggleSidebar, setRenameDialogId, setDeleteDialogId, setShareDialogOpen, theme, toggleTheme } = useUiStore();

  const [exportOpen, setExportOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportAsMarkdown = () => {
    if (!messages || messages.length === 0) {
      toast.error('No consultation messages to export');
      return;
    }

    const title = activeConversation?.title || 'Shield Funding Consultation Summary';
    let md = `# ${title}\n\n`;
    md += `*Exported from Shield Funding AI Assistant on ${new Date().toLocaleString()}*\n\n`;
    md += `**Toll-Free Hotline:** (888) 882-6117 | **Website:** https://shieldfunding.com\n\n---\n\n`;

    messages.forEach((msg) => {
      const isUser = msg.role === 'user';
      const sender = isUser ? '👤 **You**' : '🛡️ **Shield Funding AI Advisor**';
      const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : '';

      md += `### ${sender}  \`${time}\`\n\n`;
      md += `${msg.content}\n\n`;

      if (msg.attachments && msg.attachments.length > 0) {
        md += `**Attachments:**\n`;
        msg.attachments.forEach((att) => {
          md += `- [${att.name}](${att.url})\n`;
        });
        md += '\n';
      }

      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_consultation.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success('Consultation exported as Markdown!');
  };

  const exportAsJSON = () => {
    if (!messages || messages.length === 0) {
      toast.error('No consultation messages to export');
      return;
    }

    const title = activeConversation?.title || 'Shield Funding Consultation';
    const exportData = {
      company: 'Shield Funding LLC',
      consultation_id: activeConversationId,
      title,
      exported_at: new Date().toISOString(),
      messages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_consultation.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success('Consultation exported as JSON!');
  };

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--bg)]">
      <div className="flex min-w-0 items-center gap-3">
        {/* Desktop: show sidebar toggle when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors md:flex items-center justify-center"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!sidebarOpen && <ShieldLogo size="sm" showSubtitle={false} className="hidden sm:flex flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            {activeConversation ? (
              <h2 className="truncate text-xs sm:text-sm font-bold text-[var(--text-primary)] max-w-[140px] xs:max-w-[200px] sm:max-w-[280px] md:max-w-md">
                {activeConversation.title}
              </h2>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">Shield Funding AI Assistant</h2>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-[#06C18C] bg-[#1BD582]/15 px-2 py-0.5 rounded-full flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1BD582] animate-pulse" /> Advisor Online
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Header CTAs */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Phone Hotline CTA (Desktop) */}
        <a
          href="tel:8888826117"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
          title="Direct Toll-Free Phone"
        >
          <Phone size={13} className="text-[#06C18C]" />
          <span>(888) 882-6117</span>
        </a>

        {/* In-Chat Funding Calculator Trigger */}
        <button
          onClick={() => setCalcOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-[#2B7A9D]/40 bg-[#2B7A9D]/10 hover:bg-[#2B7A9D]/20 text-xs font-semibold text-[var(--text-primary)] transition-all shadow-2xs"
          title="Open Business Loan & Advance Calculator"
        >
          <Calculator size={13} className="text-[#2B7A9D] dark:text-[#38bdf8]" />
          <span className="hidden sm:inline">Calculator</span>
        </button>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-2xs"
          aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun size={15} className="text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon size={15} className="text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Official Application Button */}
        <a
          href="https://shieldfunding.com/apply/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#1BD582] hover:bg-[#15b86f] text-[#023047] text-xs font-bold transition-all shadow-2xs"
        >
          <span>Apply</span>
          <ExternalLink size={12} />
        </a>

        {/* Action buttons when conversation is active */}
        {activeConversation && (
          <div className="flex items-center gap-1">
            {/* Export Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                title="Export consultation"
              >
                <Download size={13} />
                <span className="hidden md:inline">Export</span>
                <ChevronDown size={12} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={exportAsMarkdown}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <FileText size={14} className="text-[#137499]" />
                    <span>Summary (.md)</span>
                  </button>
                  <button
                    onClick={exportAsJSON}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <FileCode size={14} className="text-amber-500" />
                    <span>Consultation Data (.json)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={() => setShareDialogOpen(true, activeConversation.id)}
              className="flex items-center gap-1 rounded-lg border border-[#1BD582]/30 bg-[#1BD582]/10 px-2 py-1 text-xs font-medium text-[#06C18C] hover:bg-[#1BD582]/20 transition-colors"
              title="Share consultation"
            >
              <Share2 size={13} />
            </button>

            <button
              onClick={() => setRenameDialogId(activeConversation.id)}
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label="Rename consultation"
              title="Rename consultation"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleteDialogId(activeConversation.id)}
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete consultation"
              title="Delete consultation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      {/* Funding Calculator Modal */}
      <FundingCalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </header>
  );
}
