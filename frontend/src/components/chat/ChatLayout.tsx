import { useChatStore } from '../../stores/chatStore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import EmptyState from './EmptyState';

export default function ChatLayout() {
  const { messages = [], activeConversationId, isLoadingMessages } = useChatStore();
  const msgList = Array.isArray(messages) ? messages : [];

  const showEmptyState = !activeConversationId && msgList.length === 0 && !isLoadingMessages;

  return (
    <div className="flex flex-1 flex-col h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[var(--bg)]">
      {/* Top Navbar */}
      <div className="flex-shrink-0 z-10">
        <ChatHeader />
      </div>

      {/* Main Scrollable Content (Empty State Hero or Message History) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {showEmptyState ? <EmptyState /> : <MessageList />}
      </div>

      {/* Sticky Bottom Chatbox (Always pinned to the screen bottom) */}
      <div className="flex-shrink-0 sticky bottom-0 z-20 w-full bg-[var(--bg-composer)] border-t border-[var(--border)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <MessageComposer />
      </div>
    </div>
  );
}
