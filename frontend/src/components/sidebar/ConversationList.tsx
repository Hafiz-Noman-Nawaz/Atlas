import { useChatStore } from '../../stores/chatStore';
import ConversationItem from './ConversationItem';

interface Props {
  searchFilter: string;
}

export default function ConversationList({ searchFilter }: Props) {
  const { conversations, activeConversationId, isLoadingConversations } = useChatStore();

  const filtered = searchFilter.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : conversations;

  if (isLoadingConversations) {
    return (
      <div className="space-y-1.5 px-1 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-lg bg-[var(--bg-hover)]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (filtered.length === 0 && searchFilter.trim()) {
    return (
      <p className="px-3 pt-4 text-body-sm text-[var(--text-tertiary)]">
        No conversations match "{searchFilter}"
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="px-3 pt-4 text-body-sm text-[var(--text-tertiary)]">
        No conversations yet
      </p>
    );
  }

  return (
    <div className="space-y-0.5 pt-1">
      {filtered.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
        />
      ))}
    </div>
  );
}
