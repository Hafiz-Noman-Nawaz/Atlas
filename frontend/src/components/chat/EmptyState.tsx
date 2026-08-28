import { Code2, Sparkles, Cpu, FileCode } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

const suggestions = [
  {
    icon: Code2,
    label: 'Debug & optimize code',
    description: 'Find errors, fix edge cases, or improve time complexity',
    prompt: 'Can you help me debug and optimize this function?',
  },
  {
    icon: Sparkles,
    label: 'Classify text intent',
    description: 'Predict intent categories and confidence scores for NLP queries',
    prompt: 'Classify the intent and extract key entities from this user query: "How do I upgrade my team plan?"',
  },
  {
    icon: Cpu,
    label: 'API & system architecture',
    description: 'Design robust REST endpoints, schemas, or state flows',
    prompt: 'Design a clean REST API structure and data schema for a real-time chat application.',
  },
  {
    icon: FileCode,
    label: 'Generate code & algorithms',
    description: 'Write boilerplate, async pipelines, or data algorithms',
    prompt: 'Write an efficient JavaScript algorithm to find the longest substring without repeating characters.',
  },
];

export default function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-4 sm:pb-12 sm:pt-6 overflow-y-auto">
      {/* Brand mark */}
      <div className="mb-3 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-accent/10">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-accent shadow-xs">
          <span className="text-xs sm:text-sm font-bold text-white">Z</span>
        </div>
      </div>

      <h1 className="text-heading-md sm:text-heading-lg font-bold text-[var(--text-primary)] text-center">ZeoAtlas AI Assistant</h1>
      <p className="mt-1.5 sm:mt-2 max-w-md text-center text-body-sm sm:text-body text-[var(--text-secondary)] px-2">
        Specialized in <strong>intent classification</strong> and <strong>programming assistance</strong>.
      </p>

      {/* Suggestion chips */}
      <div className="mt-5 sm:mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => sendMessage(s.prompt)}
            className="focus-ring group flex flex-col items-start gap-1 sm:gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 sm:p-4 text-left hover:border-accent/40 hover:bg-[var(--bg-hover)] transition-all active:scale-[0.99] shadow-2xs"
          >
            <div className="flex items-center gap-2 text-body-sm font-medium text-[var(--text-primary)] group-hover:text-accent transition-colors">
              <s.icon size={15} className="text-accent flex-shrink-0" />
              <span>{s.label}</span>
            </div>
            <p className="text-[11px] sm:text-caption text-[var(--text-secondary)] line-clamp-2">
              {s.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
