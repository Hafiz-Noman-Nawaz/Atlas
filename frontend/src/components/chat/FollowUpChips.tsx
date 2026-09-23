import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calculator, ArrowRight } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { getDynamicSuggestions } from '../../lib/dynamicSuggestions';

interface Props {
  latestAssistantMessage?: string;
  onOpenCalculator?: () => void;
}

export default function FollowUpChips({ latestAssistantMessage = '', onOpenCalculator }: Props) {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isSending = useChatStore((s) => s.isSending);
  const messages = useChatStore((s) => s.messages);

  const chips = useMemo(() => {
    const list = getDynamicSuggestions(messages, latestAssistantMessage);
    return list.slice(0, 4);
  }, [messages, latestAssistantMessage]);

  if (isSending || chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap items-center gap-1.5 pt-2 px-1 max-w-2xl"
    >
      <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1 mr-1">
        <Sparkles size={12} className="text-[#1BD582]" />
        Suggested:
      </span>

      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => {
            if (chip.category === 'calc' && onOpenCalculator) {
              onOpenCalculator();
            } else {
              sendMessage(chip.prompt);
            }
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[#1BD582] hover:bg-[#1BD582]/10 hover:text-[#023047] dark:hover:text-[#1BD582] transition-all shadow-2xs group text-left active:scale-95"
        >
          {chip.category === 'calc' ? (
            <Calculator size={12} className="text-emerald-500" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BD582]/80 group-hover:bg-[#1BD582]" />
          )}
          <span className="truncate max-w-[200px] sm:max-w-xs">{chip.label}</span>
          <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
        </button>
      ))}
    </motion.div>
  );
}

