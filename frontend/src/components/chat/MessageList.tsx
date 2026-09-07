import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MarkdownRenderer from './MarkdownRenderer';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MessageList() {
  const { messages = [], isLoadingMessages, isSending, streamingContent, error, clearError, sendMessage } = useChatStore();
  const msgList = Array.isArray(messages) ? messages : [];
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageContent = useRef<string>('');

  // Smooth Token Interpolator State
  const [displayedStreamingText, setDisplayedStreamingText] = useState('');
  const targetStreamingTextRef = useRef('');
  const animationFrameRef = useRef<number | null>(null);

  targetStreamingTextRef.current = streamingContent;

  useEffect(() => {
    if (!streamingContent) {
      setDisplayedStreamingText('');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateSmoothText = () => {
      setDisplayedStreamingText((current) => {
        const target = targetStreamingTextRef.current;
        if (current.length >= target.length) {
          return target;
        }

        // Adaptive typing speed based on backlog
        const diff = target.length - current.length;
        const step = Math.max(1, Math.min(diff, Math.ceil(diff / 4)));
        return target.slice(0, current.length + step);
      });

      animationFrameRef.current = requestAnimationFrame(updateSmoothText);
    };

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateSmoothText);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [streamingContent]);

  // Auto-scroll on new messages or streaming chunks
  useEffect(() => {
    const lastMsg = msgList.length > 0 ? msgList[msgList.length - 1] : null;
    if (lastMsg && lastMsg.content !== lastMessageContent.current) {
      lastMessageContent.current = lastMsg.content;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Scroll during active streaming or typing indicator
  useEffect(() => {
    if (isSending || displayedStreamingText) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isSending, displayedStreamingText]);

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className="h-12 animate-pulse rounded-2xl bg-[var(--bg-hover)]"
              style={{ width: `${50 + Math.random() * 30}%`, animationDelay: `${i * 100}ms` }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl py-4 space-y-1">
        {msgList.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} index={i} />
        ))}

        {/* Live Smooth Streaming Message Bubble */}
        {displayedStreamingText && (
          <div className="group flex gap-3 px-4 py-3 sm:px-6 justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-xs mt-0.5 animate-pulse">
              <span className="text-xs font-bold">Z</span>
            </div>
            <div className="max-w-[90%] sm:max-w-[80%] flex flex-col items-start">
              <div className="rounded-2xl rounded-bl-md border border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] shadow-sm">
                <MarkdownRenderer content={displayedStreamingText} />
                <span className="inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-accent align-middle ml-1 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator (only shown if sending and streaming has not started yet) */}
        {isSending && !displayedStreamingText && <TypingIndicator />}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/15 px-4 py-2.5 text-body-sm text-red-600 dark:text-red-400 border border-red-500/20 shadow-xs">
              <AlertCircle size={15} />
              <span>{error}</span>
              <button
                onClick={() => {
                  clearError();
                  const lastUserMsg = [...msgList].reverse().find((m) => m.role === 'user');
                  if (lastUserMsg) {
                    sendMessage(lastUserMsg.content);
                  }
                }}
                className="ml-1 inline-flex items-center gap-1 font-medium hover:underline text-accent"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
