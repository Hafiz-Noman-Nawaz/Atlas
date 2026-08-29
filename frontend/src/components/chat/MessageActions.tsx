import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Check, Volume2, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../../services/chatApi';
import { useUiStore } from '../../stores/uiStore';
import { speakMessage, stopSpeech } from '../../lib/speechSynthesis';
import type { FeedbackRating } from '../../types';

interface Props {
  messageId: string;
  content: string;
}

export default function MessageActions({ messageId, content }: Props) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackRating | null>(null);
  const ttsSpeakingId = useUiStore((s) => s.ttsSpeakingId);
  const setTtsSpeakingId = useUiStore((s) => s.setTtsSpeakingId);

  const isPlayingThis = ttsSpeakingId === messageId;

  function toggleSpeech() {
    if (isPlayingThis) {
      stopSpeech();
      setTtsSpeakingId(null);
    } else {
      speakMessage(
        messageId,
        content,
        () => setTtsSpeakingId(messageId),
        () => setTtsSpeakingId(null),
        () => setTtsSpeakingId(null)
      );
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }

  async function handleFeedback(rating: FeedbackRating) {
    if (feedback === rating) return; // Already submitted this rating
    try {
      await chatApi.submitFeedback(messageId, { rating });
      setFeedback(rating);
      toast.success(rating === 'positive' ? 'Thanks for the feedback!' : 'Feedback noted');
    } catch {
      toast.error('Failed to submit feedback');
    }
  }

  return (
    <div className="flex items-center gap-1 mt-1.5">
      {/* Text-to-Speech Playback Button */}
      <button
        onClick={toggleSpeech}
        className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-all ${
          isPlayingThis
            ? 'bg-accent/15 text-accent border border-accent/30 font-medium'
            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
        }`}
        aria-label={isPlayingThis ? 'Stop listening' : 'Read aloud'}
        title={isPlayingThis ? 'Stop voice readout' : 'Read aloud with AI voice'}
      >
        {isPlayingThis ? (
          <>
            <Square size={13} className="text-accent animate-pulse" />
            <span className="flex items-center gap-0.5">
              <span className="h-2 w-0.5 bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-3 w-0.5 bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-0.5 bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </>
        ) : (
          <Volume2 size={14} />
        )}
      </button>

      <button
        onClick={handleCopy}
        className="rounded-md p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors"
        aria-label="Copy message"
        title="Copy"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <button
        onClick={() => handleFeedback('positive')}
        className={`rounded-md p-1 transition-colors ${
          feedback === 'positive'
            ? 'text-accent'
            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
        }`}
        aria-label="Good response"
        title="Good response"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className={`rounded-md p-1 transition-colors ${
          feedback === 'negative'
            ? 'text-red-500'
            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
        }`}
        aria-label="Bad response"
        title="Bad response"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}
