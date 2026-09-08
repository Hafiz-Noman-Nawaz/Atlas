import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Calculator,
  Mic,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  forceOpen?: boolean;
}

interface TourSlide {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  features: { title: string; desc: string }[];
}

const SLIDES: TourSlide[] = [
  {
    id: 1,
    badge: 'Official AI Advisor',
    badgeColor: 'bg-[#1BD582]/15 text-[#06C18C] border-[#1BD582]/30',
    title: 'Welcome to Shield Funding AI',
    subtitle: 'Your 24/7 dedicated commercial financing assistant with nearly 20 years of business capital expertise.',
    icon: ShieldCheck,
    iconBg: 'bg-[#023047]',
    iconColor: 'text-[#1BD582]',
    features: [
      {
        title: 'Instant Financial Intelligence',
        desc: 'Trained exclusively on official Shield Funding guidelines, loan programs, and qualification criteria.',
      },
      {
        title: '24/7 Dedicated Guidance',
        desc: 'Get immediate answers about rates, repayment terms, and application steps without waiting on hold.',
      },
      {
        title: 'Seamless Underwriter Handoff',
        desc: 'Direct connection to human funding specialists at (888) 882-6117 whenever you want personalized assistance.',
      },
    ],
  },
  {
    id: 2,
    badge: 'Capital Programs',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    title: 'Explore 6 Funding Solutions',
    subtitle: 'From $5,000 to $2,000,000+ tailored to your company cash flow and growth goals.',
    icon: Layers,
    iconBg: 'bg-[#137499]',
    iconColor: 'text-white',
    features: [
      {
        title: 'Merchant Cash Advance (MCA)',
        desc: 'Fast advances (24-48 hrs) with remittances that automatically flex with your daily sales volume.',
      },
      {
        title: 'Business Line of Credit',
        desc: 'Revolving capital up to $250k. Draw only what you need and pay interest only on borrowed funds.',
      },
      {
        title: 'Term Loans & Equipment Financing',
        desc: 'Predictable fixed monthly payments for expansion, equipment, and large capital purchases.',
      },
    ],
  },
  {
    id: 3,
    badge: 'Interactive Tool',
    badgeColor: 'bg-[#2B7A9D]/20 text-[#2B7A9D] dark:text-[#38bdf8] border-[#2B7A9D]/40',
    title: 'Interactive Loan Calculator',
    subtitle: 'Estimate factor rates, remittances, and monthly cash flow impact before you apply.',
    icon: Calculator,
    iconBg: 'bg-[#2B7A9D]',
    iconColor: 'text-white',
    features: [
      {
        title: 'Dynamic Sliders',
        desc: 'Adjust your requested capital and monthly sales volume to test different repayment durations.',
      },
      {
        title: 'Daily & Weekly Remittances',
        desc: 'See realistic estimates calculated for standard business days with total payback amounts.',
      },
      {
        title: 'Instant Approval Odds',
        desc: 'Gauge your pre-qualification likelihood based on time in business and monthly gross receipts.',
      },
    ],
  },
  {
    id: 4,
    badge: 'Voice & Smart Controls',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    title: 'Voice Input & Audio Read-Aloud',
    subtitle: 'Designed for effortless hands-free use whether on your phone or laptop.',
    icon: Mic,
    iconBg: 'bg-purple-900/40 border border-purple-500/30',
    iconColor: 'text-purple-400',
    features: [
      {
        title: 'Dictate With Your Voice',
        desc: 'Tap the microphone icon in the chatbox to speak your questions instead of typing.',
      },
      {
        title: 'Listen to Explanations',
        desc: 'Click the speaker button on any assistant reply to hear clear audio narration.',
      },
      {
        title: 'Proactive Suggestion Chips',
        desc: 'One-click follow-up pills underneath answers to keep your loan exploration moving forward.',
      },
    ],
  },
  {
    id: 5,
    badge: 'Zero Risk Application',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    title: 'Soft Credit Pull • Fast Approvals',
    subtitle: 'Getting pre-qualified takes under 2 minutes and will never hurt your credit score.',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-950/60 border border-emerald-500/30',
    iconColor: 'text-emerald-400',
    features: [
      {
        title: 'Soft Credit Inquiries Only',
        desc: 'Shield Funding checks eligibility without impacting your personal or business credit score.',
      },
      {
        title: 'Low Credit Flexibility (500+ FICO)',
        desc: 'Accepts past bankruptcies, existing cash advances, and tax liens with 4+ months in business.',
      },
      {
        title: 'Same-Day Funding Capability',
        desc: 'Complete the simple e-sign application and receive funds directly in your business checking account.',
      },
    ],
  },
];

export default function OnboardingTourModal({ isOpen: controlledOpen, onClose: controlledClose, forceOpen }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Automatically check if user has completed tour
  useEffect(() => {
    if (forceOpen) {
      setInternalOpen(true);
      return;
    }

    if (controlledOpen !== undefined) {
      setInternalOpen(controlledOpen);
      return;
    }

    const hasSeenTour = localStorage.getItem('shield_funding_tour_completed');
    if (!hasSeenTour) {
      // Small timeout so initial page renders before showing tour
      const timer = setTimeout(() => {
        setInternalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [controlledOpen, forceOpen]);

  // Listen for manual trigger events (e.g. from Sidebar or EmptyState button)
  useEffect(() => {
    const handleOpenTour = () => {
      setCurrentSlideIndex(0);
      setInternalOpen(true);
    };
    window.addEventListener('open-onboarding-tour', handleOpenTour);
    return () => window.removeEventListener('open-onboarding-tour', handleOpenTour);
  }, []);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleClose = () => {
    localStorage.setItem('shield_funding_tour_completed', 'true');
    setInternalOpen(false);
    controlledClose?.();
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const currentSlide = SLIDES[currentSlideIndex] ?? SLIDES[0];
  if (!currentSlide) return null;
  const IconComponent = currentSlide.icon;
  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[var(--bg)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col"
        >
          {/* Top Progress Bar & Skip */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Shield Funding" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Assistant Walkthrough
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-tertiary)] ml-1">
                Step {currentSlideIndex + 1} of {SLIDES.length}
              </span>
            </div>

            <button
              onClick={handleClose}
              className="text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            >
              Skip Tour
            </button>
          </div>

          {/* Animated Slide Content */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto max-h-[70vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Header Icon + Title */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl ${currentSlide.iconBg} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <IconComponent size={24} className={currentSlide.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 ${currentSlide.badgeColor}`}>
                      {currentSlide.badge}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      {currentSlide.subtitle}
                    </p>
                  </div>
                </div>

                {/* Feature Points Cards */}
                <div className="space-y-2.5 pt-2">
                  {currentSlide.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xs hover:border-[#1BD582]/40 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)]">{feat.title}</div>
                        <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                          {feat.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between gap-3">
            {/* Slide Progress Dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? 'w-6 bg-[#1BD582]'
                      : 'w-2 bg-[var(--border)] hover:bg-[var(--border-strong)]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Back Buttons */}
            <div className="flex items-center gap-2">
              {currentSlideIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                  isLastSlide
                    ? 'bg-[#1BD582] hover:bg-[#15b86f] text-[#023047]'
                    : 'bg-[#023047] dark:bg-[#132F4C] hover:bg-[#082233] text-white'
                }`}
              >
                <span>{isLastSlide ? 'Get Started' : 'Next'}</span>
                {isLastSlide ? <Sparkles size={13} /> : <ArrowRight size={13} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
