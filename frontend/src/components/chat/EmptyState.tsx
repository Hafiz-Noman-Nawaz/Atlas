import { useState } from 'react';
import {
  Zap,
  RefreshCw,
  TrendingUp,
  Truck,
  FileCheck2,
  Landmark,
  ShieldCheck,
  PhoneCall,
  Calculator,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import ShieldLogo from '../common/ShieldLogo';
import FundingProductsModal from '../modals/FundingProductsModal';
import QualificationModal from '../modals/QualificationModal';
import ContactAdvisorModal from '../modals/ContactAdvisorModal';
import FundingCalculatorModal from '../modals/FundingCalculatorModal';

const fundingCategories = [
  {
    icon: Zap,
    title: 'Merchant Cash Advance',
    badge: 'Fastest Funding',
    amount: '$5k – $500k+',
    prompt: 'What are the requirements and terms for a Merchant Cash Advance (MCA)?',
  },
  {
    icon: RefreshCw,
    title: 'Business Line of Credit',
    badge: 'Revolving Capital',
    amount: '$10k – $250k',
    prompt: 'How does a business line of credit work, and what interest rates apply?',
  },
  {
    icon: TrendingUp,
    title: 'Small Business Term Loan',
    badge: 'Fixed Monthly Rates',
    amount: '$10k – $1M+',
    prompt: 'What are the terms and qualification criteria for small business term loans?',
  },
  {
    icon: Truck,
    title: 'Equipment Financing',
    badge: 'Up to 100% Covered',
    amount: 'Up to $2M',
    prompt: 'How can I finance commercial equipment or vehicles with Shield Funding?',
  },
  {
    icon: FileCheck2,
    title: 'Invoice Factoring',
    badge: 'Zero Balance Debt',
    amount: '$20k – $1.5M',
    prompt: 'How does invoice factoring work for B2B businesses with unpaid invoices?',
  },
  {
    icon: Landmark,
    title: 'SBA 7(a) & Express',
    badge: 'Lowest APR',
    amount: '$50k – $5M',
    prompt: 'What are the eligibility requirements for an SBA 7(a) business loan?',
  },
];

const quickPrompts = [
  'What are the minimum requirements to qualify for funding?',
  'How fast can I get funded after submitting an application?',
  'Do you work with businesses with low or challenged credit?',
  'What is the difference between an MCA and a traditional term loan?',
];

export default function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [qualModalOpen, setQualModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-3 py-4 sm:px-6 sm:py-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-4 sm:space-y-5">
      {/* Brand Hero Crest - Streamlined & Elegant */}
      <div className="flex flex-col items-center text-center space-y-2.5 w-full">
        <div className="relative group">
          <ShieldLogo size="lg" showText={false} />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1BD582]/10 border border-[#1BD582]/25 text-[#06C18C] text-[10.5px] font-bold tracking-wider uppercase">
            <ShieldCheck size={12} />
            <span>Official Shield Funding AI Advisor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            How can we fund your business growth today?
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Instant commercial loan guidance, qualification checks, rates, and same-day funding programs.
          </p>
        </div>

        {/* Compact Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10.5px] text-[var(--text-tertiary)] pt-0.5">
          <span className="flex items-center gap-1">
            ⭐ <span className="font-semibold text-[var(--text-secondary)]">4.9/5</span> Trustpilot
          </span>
          <span className="text-[var(--border)]">•</span>
          <span className="flex items-center gap-1">
            🛡️ <span className="font-semibold text-[var(--text-secondary)]">20+ Yrs</span> Exp
          </span>
          <span className="text-[var(--border)]">•</span>
          <span className="flex items-center gap-1">
            ⚡ <span className="font-semibold text-[var(--text-secondary)]">24h</span> Wire
          </span>
          <span className="text-[var(--border)]">•</span>
          <span className="flex items-center gap-1">
            🔒 <span className="font-semibold text-[var(--text-secondary)]">256-Bit</span> Encrypted
          </span>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('focus-chat-input'))}
            className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1BD582]/10 hover:bg-[#1BD582]/20 border border-[#1BD582]/30 text-[#023047] dark:text-[#1BD582] text-[11px] font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Focus the bottom sticky chatbox to begin asking questions"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1BD582] animate-ping" />
            <span>Type below to chat</span>
            <span className="text-[#06C18C] group-hover:translate-y-0.5 transition-transform text-xs">↓</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-onboarding-tour'))}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles size={11} className="text-[#1BD582]" />
            <span>Take Tour</span>
          </button>
        </div>
      </div>

      {/* Interactive Quick Tools - Sleek 4-Pill / Command Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
        <button
          onClick={() => setQualModalOpen(true)}
          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1BD582]/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-[#1BD582] transition-all text-left group shadow-2xs cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-[#1BD582] text-[#023047] flex-shrink-0">
            <ShieldCheck size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Eligibility</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate">Pre-qualify</p>
          </div>
          <ArrowRight size={13} className="text-[#06C18C] group-hover:translate-x-0.5 transition-transform flex-shrink-0 opacity-70 group-hover:opacity-100" />
        </button>

        <button
          onClick={() => setCalcModalOpen(true)}
          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#2B7A9D]/30 bg-sky-500/5 hover:bg-sky-500/10 hover:border-[#2B7A9D] transition-all text-left group shadow-2xs cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-[#2B7A9D] text-white flex-shrink-0">
            <Calculator size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Calculator</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate">Estimate payments</p>
          </div>
          <ArrowRight size={13} className="text-[#2B7A9D] dark:text-[#38bdf8] group-hover:translate-x-0.5 transition-transform flex-shrink-0 opacity-70 group-hover:opacity-100" />
        </button>

        <button
          onClick={() => setProductsModalOpen(true)}
          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] transition-all text-left group shadow-2xs cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-[#023047] text-white flex-shrink-0">
            <Layers size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Catalog</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate">All 6 programs</p>
          </div>
          <ArrowRight size={13} className="text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform flex-shrink-0 opacity-70 group-hover:opacity-100" />
        </button>

        <button
          onClick={() => setContactModalOpen(true)}
          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] transition-all text-left group shadow-2xs cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-[#137499] text-white flex-shrink-0">
            <PhoneCall size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Advisor</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate">(888) 882-6117</p>
          </div>
          <ArrowRight size={13} className="text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform flex-shrink-0 opacity-70 group-hover:opacity-100" />
        </button>
      </div>

      {/* Product Selection Cards Grid - Compact & Responsive */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Commercial Financing Programs
          </h2>
          <span className="text-[10.5px] text-[#06C18C] font-semibold">Click to ask AI</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {fundingCategories.map((item) => (
            <button
              key={item.title}
              onClick={() => sendMessage(item.prompt)}
              className="group flex flex-col justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#1BD582] hover:bg-[var(--bg-hover)] hover:shadow-xs transition-all text-left cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                <div className="p-1 rounded-md bg-[var(--bg-primary)] text-[#023047] dark:text-[#1BD582] group-hover:bg-[#1BD582] group-hover:text-[#023047] transition-colors flex-shrink-0">
                  <item.icon size={14} />
                </div>
                <span className="text-[9.5px] font-bold text-[#06C18C] bg-[#1BD582]/10 px-1.5 py-0.5 rounded">
                  {item.amount}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#023047] dark:group-hover:text-[#1BD582] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  <span className="truncate">{item.badge}</span>
                  <span className="text-[#137499] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">Ask →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Fast Inquiries - Compact Pill Grid */}
      <div className="w-full space-y-1.5 pt-0.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
          <HelpCircle size={11} className="text-[#1BD582]" />
          <span>Frequently Asked Questions</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#1BD582] hover:bg-[var(--bg-hover)] text-left text-[11px] text-[var(--text-primary)] transition-all shadow-2xs group cursor-pointer active:scale-[0.99]"
            >
              <Sparkles size={11} className="text-[#1BD582] flex-shrink-0" />
              <span className="flex-1 truncate group-hover:text-[#023047] dark:group-hover:text-[#1BD582] transition-colors">
                {p}
              </span>
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
