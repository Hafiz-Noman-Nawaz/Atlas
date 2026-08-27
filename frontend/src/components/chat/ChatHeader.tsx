import { useState, useRef, useEffect } from 'react';
import { PanelLeft, Menu, Pencil, Trash2, Download, FileText, FileCode, ChevronDown } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

export default function ChatHeader() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const { sidebarOpen, setSidebarOpen, toggleSidebar, setRenameDialogId, setDeleteDialogId } = useUiStore();

  const [exportOpen, setExportOpen] = useState(false);
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
      toast.error('No messages to export');
      return;
    }

    const title = activeConversation?.title || 'ZeoAtlas Chat Export';
    let md = `# ${title}\n\n`;
    md += `*Exported from ZeoAtlas on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((msg) => {
      const isUser = msg.role === 'user';
      const sender = isUser ? '👤 **You**' : '🤖 **ZeoAtlas**';
      const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : '';
      
      md += `### ${sender}  \`${time}\`\n\n`;
      if (!isUser && msg.intent) {
        md += `> **Intent:** \`${msg.intent}\` (${Math.round((msg.confidence || 0) * 100)}%)\n\n`;
      }
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
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success('Chat exported as Markdown!');
  };

  const exportAsJSON = () => {
    if (!messages || messages.length === 0) {
      toast.error('No messages to export');
      return;
    }

    const title = activeConversation?.title || 'ZeoAtlas Chat Export';
    const exportData = {
      conversation_id: activeConversationId,
      title,
      exported_at: new Date().toISOString(),
      messages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success('Chat exported as JSON!');
  };

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* Desktop: show sidebar toggle when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden rounded-md p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors md:flex items-center justify-center"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          {activeConversation ? (
            <h2 className="truncate text-body font-medium text-[var(--text-primary)]">
              {activeConversation.title}
            </h2>
          ) : (
            <h2 className="text-body font-bold text-[var(--text-primary)]">ZeoAtlas</h2>
          )}
        </div>
      </div>

      {/* Action buttons when conversation is active */}
      {activeConversation && (
        <div className="flex items-center gap-1.5">
          {/* Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              title="Export conversation"
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown size={12} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={exportAsMarkdown}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <FileText size={14} className="text-teal-400" />
                  <span>Export as Markdown (.md)</span>
                </button>
                <button
                  onClick={exportAsJSON}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <FileCode size={14} className="text-amber-400" />
                  <span>Export as JSON (.json)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setRenameDialogId(activeConversation.id)}
            className="rounded-md p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label="Rename conversation"
            title="Rename conversation"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteDialogId(activeConversation.id)}
            className="rounded-md p-1.5 text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Delete conversation"
            title="Delete conversation"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </header>
  );
}
