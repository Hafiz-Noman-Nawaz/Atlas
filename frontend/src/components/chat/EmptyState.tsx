import { useState } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  Calculator,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import ShieldLogo from '../common/ShieldLogo';
import FundingProductsModal from '../modals/FundingProductsModal';
import QualificationModal from '../modals/QualificationModal';
import ContactAdvisorModal from '../modals/ContactAdvisorModal';
import FundingCalculatorModal from '../modals/FundingCalculatorModal';

const starterQuestions = [
  {
    title: 'Is collateral required for a business term loan?',
    tag: 'Term Loans',
  },
  {
    title: 'What interest rates apply when drawing from a business line of credit?',
    tag: 'Line of Credit',
  },
  {
    title: 'Can I qualify for funding with bad credit or a past bankruptcy?',
    tag: 'Qualification',
  },
  {
    title: 'How fast can funds be approved and wired to my account?',
    tag: 'Speed & Process',
  },
];

export default function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [qualModalOpen, setQualModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 max-w-3xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Brand Hero Crest - Minimalist, Executive & Calm */}
      <div className="flex flex-col items-center text-center space-y-3 w-full">
        <div className="relative p-1">
          <ShieldLogo size="lg" showText={false} />
        </div>

        <div className="space-y-1.5 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1BD582]/10 border border-[#1BD582]/25 text-[#06C18C] text-[11px] font-semibold tracking-wide">
            <ShieldCheck size={13} />
            <span>Shield Funding Commercial AI Advisory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            How can we help your business grow today?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Direct, factual answers on commercial loans, rates, and qualification requirements.
          </p>
        </div>

        {/* Minimal Trust Line */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-[var(--text-tertiary)] pt-1">
          <span>⭐ 4.9/5 Trustpilot</span>
          <span>•</span>
          <span>20+ Years Experience</span>
          <span>•</span>
          <span>Fast 24-Hour Funding</span>
        </div>
      </div>

      {/* Interactive Tool Actions - Clean 4-Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
        <button
          onClick={() => setQualModalOpen(true)}
          className="flex flex-col items-start p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#1BD582] hover:bg-[var(--bg-hover)] transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-[#1BD582]/10 text-[#06C18C] group-hover:bg-[#1BD582] group-hover:text-[#023047] transition-colors mb-2">
            <ShieldCheck size={16} />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#06C18C] transition-colors">
            Pre-Qualify
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Check in 60 secs</span>
        </button>

        <button
          onClick={() => setCalcModalOpen(true)}
          className="flex flex-col items-start p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#2B7A9D] hover:bg-[var(--bg-hover)] transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-[#2B7A9D]/10 text-[#2B7A9D] dark:text-[#38bdf8] group-hover:bg-[#2B7A9D] group-hover:text-white transition-colors mb-2">
            <Calculator size={16} />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#2B7A9D] transition-colors">
            Calculator
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Estimate payments</span>
        </button>

        <button
          onClick={() => setProductsModalOpen(true)}
          className="flex flex-col items-start p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)] transition-colors mb-2">
            <Layers size={16} />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] transition-colors">
            Loan Catalog
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">All 6 programs</span>
        </button>

        <button
          onClick={() => setContactModalOpen(true)}
          className="flex flex-col items-start p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-[#137499]/10 text-[#137499] group-hover:bg-[#137499] group-hover:text-white transition-colors mb-2">
            <PhoneCall size={16} />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] transition-colors">
            Advisor Desk
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">(888) 882-6117</span>
        </button>
      </div>

      {/* Suggested Questions - Spacious & Uncluttered */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#1BD582]" />
            <span>Suggested Direct Inquiries</span>
          </p>
          <span className="text-[10.5px] text-[var(--text-tertiary)]">Click any question to ask</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {starterQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(item.title)}
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#1BD582] hover:bg-[var(--bg-hover)] text-left transition-all shadow-2xs group cursor-pointer active:scale-[0.99]"
            >
              <div className="space-y-0.5 pr-2">
                <span className="inline-block text-[9.5px] font-semibold text-[#06C18C] bg-[#1BD582]/10 px-1.5 py-0.2 rounded">
                  {item.tag}
                </span>
                <p className="text-xs text-[var(--text-primary)] group-hover:text-[#06C18C] transition-colors leading-snug">
                  {item.title}
                </p>
              </div>
              <ArrowUpRight
                size={14}
                className="text-[var(--text-tertiary)] group-hover:text-[#06C18C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <FundingProductsModal isOpen={productsModalOpen} onClose={() => setProductsModalOpen(false)} />
      <QualificationModal isOpen={qualModalOpen} onClose={() => setQualModalOpen(false)} />
      <ContactAdvisorModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      <FundingCalculatorModal isOpen={calcModalOpen} onClose={() => setCalcModalOpen(false)} />
    </div>
  );
}
