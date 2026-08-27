import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../../services/chatApi';
import type { FeedbackRating } from '../../types';

interface Props {
  messageId: string;
  content: string;
}

export default function MessageActions({ messageId, content }: Props) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackRating | null>(null);

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
    <div className="flex items-center gap-0.5 mt-1.5">
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
