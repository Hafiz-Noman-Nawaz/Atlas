import { useChatStore } from '../../stores/chatStore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import EmptyState from './EmptyState';

export default function ChatLayout() {
  const { messages, activeConversationId, isLoadingMessages } = useChatStore();

  const showEmptyState = !activeConversationId && messages.length === 0 && !isLoadingMessages;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatHeader />

      {showEmptyState ? (
        <EmptyState />
      ) : (
        <MessageList />
      )}

      <MessageComposer />
    </div>
  );
}
