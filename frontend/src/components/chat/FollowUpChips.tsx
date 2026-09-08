import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calculator, ArrowRight } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

interface Props {
  latestAssistantMessage?: string;
  onOpenCalculator?: () => void;
}

export default function FollowUpChips({ latestAssistantMessage = '', onOpenCalculator }: Props) {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isSending = useChatStore((s) => s.isSending);

  const chips = useMemo(() => {
    const text = latestAssistantMessage.toLowerCase();

    if (text.includes('qualif') || text.includes('requirement') || text.includes('credit')) {
      return [
        { label: 'What documents are required to apply?', icon: 'doc' },
        { label: 'Can I qualify if I had a past bankruptcy?', icon: 'shield' },
        { label: 'Estimate my payments in Calculator', action: 'calculator', icon: 'calc' },
      ];
    }

    if (text.includes('mca') || text.includes('merchant cash advance') || text.includes('factor rate')) {
      return [
        { label: 'How does an MCA compare to a Term Loan?', icon: 'compare' },
        { label: 'Can I pay off an advance early for a discount?', icon: 'rate' },
        { label: 'Calculate estimated MCA daily remittances', action: 'calculator', icon: 'calc' },
      ];
    }

    if (text.includes('rate') || text.includes('cost') || text.includes('payment') || text.includes('percent')) {
      return [
        { label: 'Open Loan Payment Calculator', action: 'calculator', icon: 'calc' },
        { label: 'Are there any upfront fees or application charges?', icon: 'shield' },
        { label: 'How fast can funds be deposited into my account?', icon: 'speed' },
      ];
    }

    // Default suggestions
    return [
      { label: 'Calculate my funding payments', action: 'calculator', icon: 'calc' },
      { label: 'What are the minimum qualification criteria?', icon: 'shield' },
      { label: 'How does Shield Funding differ from a bank loan?', icon: 'compare' },
      { label: 'How do I speak with a human funding specialist?', icon: 'advisor' },
    ];
  }, [latestAssistantMessage]);

  if (isSending) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap items-center gap-2 pt-2 px-1 max-w-2xl"
    >
      <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1 mr-1">
        <Sparkles size={12} className="text-[#2B7A9D]" />
        Suggested:
      </span>

      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => {
            if (chip.action === 'calculator' && onOpenCalculator) {
              onOpenCalculator();
            } else {
              sendMessage(chip.label);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[#2B7A9D] hover:bg-[#2B7A9D]/10 hover:text-[#2B7A9D] dark:hover:text-[#38bdf8] transition-all shadow-2xs group"
        >
          {chip.action === 'calculator' ? (
            <Calculator size={12} className="text-emerald-500" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B7A9D]/60 group-hover:bg-[#2B7A9D]" />
          )}
          <span>{chip.label}</span>
          <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
        </button>
      ))}
    </motion.div>
  );
}
