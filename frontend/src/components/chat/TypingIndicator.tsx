import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ShieldLogo from '../common/ShieldLogo';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 px-4 py-3 sm:px-6"
    >
      {/* Avatar with subtle pulsing ring */}
      <div className="flex-shrink-0 mt-0.5">
        <ShieldLogo size="sm" variant="icon" showText={false} />
      </div>

      {/* Typing Bubble */}
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <Sparkles size={13} className="text-[#06C18C] animate-spin" style={{ animationDuration: '3s' }} />
          <span>Shield Funding Advisor is evaluating options</span>
        </div>

        {/* 3 Animated Bouncing Dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-accent"
              animate={{
                y: ['0%', '-50%', '0%'],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
