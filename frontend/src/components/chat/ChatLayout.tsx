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
    <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden bg-[var(--bg)]">
      {/* Top Navbar */}
      <div className="flex-shrink-0 z-10">
        <ChatHeader />
      </div>

      {/* Main Scrollable Content (Empty State Hero or Message History) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {showEmptyState ? <EmptyState /> : <MessageList />}
      </div>

      {/* Bottom Chatbox (Anchored directly to the bottom border) */}
      <div className="flex-shrink-0 w-full z-20">
        <MessageComposer />
      </div>
    </div>
  );
}
