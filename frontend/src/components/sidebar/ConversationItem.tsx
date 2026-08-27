import { MessageSquare, MoreHorizontal, Pencil, Trash2, Pin, PinOff, Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Conversation } from '../../types';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { formatRelativeTime, truncate } from '../../lib/utils';

interface Props {
  conversation: Conversation;
  isActive: boolean;
}

export default function ConversationItem({ conversation, isActive }: Props) {
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const togglePinConversation = useChatStore((s) => s.togglePinConversation);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const setDeleteDialogId = useUiStore((s) => s.setDeleteDialogId);
  const setRenameDialogId = useUiStore((s) => s.setRenameDialogId);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function handleClick() {
    setActiveConversation(conversation.id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(true);
  }

  return (
    <div className="group relative" ref={menuRef} onContextMenu={handleContextMenu}>
      <button
        onClick={handleClick}
        className={`focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
          isActive
            ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
        }`}
      >
        {conversation.is_pinned ? (
          <Star size={14} className="flex-shrink-0 text-amber-400 fill-amber-400" />
        ) : (
          <MessageSquare size={15} className="flex-shrink-0 opacity-50" />
        )}
        <div className="min-w-0 flex-1 pr-6">
          <p className="truncate text-body-sm">{truncate(conversation.title, 28)}</p>
        </div>
        <span className="flex-shrink-0 text-caption text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatRelativeTime(conversation.updated_at)}
        </span>
      </button>

      {/* Context menu trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-all ${
          menuOpen ? 'opacity-100 bg-[var(--bg-hover)]' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Conversation options"
        title="More options"
      >
        <MoreHorizontal size={15} />
      </button>

      {/* Dropdown context menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-lg)]">
          <button
            onClick={() => {
              setMenuOpen(false);
              togglePinConversation(conversation.id);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {conversation.is_pinned ? (
              <>
                <PinOff size={13} className="text-amber-400" />
                Unpin Chat
              </>
            ) : (
              <>
                <Pin size={13} className="text-amber-400" />
                Pin to Top
              </>
            )}
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              setRenameDialogId(conversation.id);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Pencil size={13} />
            Rename
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              setDeleteDialogId(conversation.id);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
