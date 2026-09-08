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
    badge: 'Zero Balance Sheet Debt',
    amount: '$20k – $1.5M',
    prompt: 'How does invoice factoring work for B2B businesses with unpaid invoices?',
  },
  {
    icon: Landmark,
    title: 'SBA 7(a) & Express Loans',
    badge: 'Lowest Long-Term APR',
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
    <div className="flex flex-1 flex-col items-center justify-start px-3 py-6 sm:px-6 sm:py-8 overflow-y-auto max-w-4xl mx-auto w-full">
      {/* Brand Hero Crest */}
      <div className="flex flex-col items-center text-center space-y-3">
        <ShieldLogo size="xl" showText={false} />

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1BD582]/10 border border-[#1BD582]/25 text-[#06C18C] text-[11px] font-bold tracking-wide uppercase">
            <ShieldCheck size={13} />
            <span>Official Shield Funding AI Advisor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            How can we fund your business growth today?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Get instant guidance on commercial loans, merchant cash advances, qualification criteria, and same-day funding programs.
          </p>
        </div>

        {/* Trust Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-[11px] text-[var(--text-secondary)] font-medium">
          <span className="flex items-center gap-1 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-2xs">
            ⭐ <strong>4.9 / 5</strong> on Trustpilot
          </span>
          <span className="flex items-center gap-1 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-2xs">
            🛡️ <strong>20 Years</strong> Experience
          </span>
          <span className="flex items-center gap-1 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-2xs">
            ⚡ <strong>24h</strong> Direct Funding
          </span>
          <span className="flex items-center gap-1 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-2xs">
            🔒 <strong>Bank-Grade</strong> 256-Bit Security
          </span>
        </div>
      </div>

      {/* Interactive Quick Tools Action Bar */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
        <button
          onClick={() => setQualModalOpen(true)}
          className="flex items-center justify-between p-3 rounded-xl border border-[#1BD582]/40 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 hover:bg-emerald-500/15 transition-all text-left group shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#1BD582] text-[#023047] font-bold flex-shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">Check Eligibility</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">Instant pre-qualification</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-[#06C18C] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>

        <button
          onClick={() => setCalcModalOpen(true)}
          className="flex items-center justify-between p-3 rounded-xl border border-[#2B7A9D]/40 bg-[#2B7A9D]/10 hover:bg-[#2B7A9D]/15 transition-all text-left group shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#2B7A9D] text-white flex-shrink-0">
              <Calculator size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">Loan Calculator</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">Estimate payments & rates</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-[#2B7A9D] dark:text-[#38bdf8] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>

        <button
          onClick={() => setProductsModalOpen(true)}
          className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all text-left group shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#023047] text-white flex-shrink-0">
              <Layers size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">Products Catalog</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">Compare all 6 programs</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>

        <button
          onClick={() => setContactModalOpen(true)}
          className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all text-left group shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#137499] text-white flex-shrink-0">
              <PhoneCall size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">Speak to Advisor</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">(888) 882-6117 Toll-Free</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>
      </div>

      {/* Product Selection Cards Grid */}
      <div className="mt-6 w-full">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Explore Commercial Financing Programs
          </h2>
          <span className="text-[11px] text-[#06C18C] font-semibold">Click any option to ask AI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {fundingCategories.map((item) => (
            <button
              key={item.title}
              onClick={() => sendMessage(item.prompt)}
              className="group flex flex-col justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#1BD582] hover:bg-[var(--bg-hover)] hover:shadow-md transition-all text-left"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#023047] dark:text-[#1BD582] group-hover:bg-[#1BD582] group-hover:text-[#023047] transition-colors">
                    <item.icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#06C18C] bg-[#1BD582]/10 px-2 py-0.5 rounded-md">
                    {item.amount}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#023047] dark:group-hover:text-[#1BD582] transition-colors">
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-light)] text-[10px] text-[var(--text-tertiary)]">
                <span>{item.badge}</span>
                <span className="text-[#137499] group-hover:translate-x-0.5 transition-transform">Ask →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Fast Inquiries */}
      <div className="mt-6 w-full space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Frequently Asked Funding Questions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(p)}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[#1BD582] hover:bg-[var(--bg-hover)] text-left text-xs text-[var(--text-primary)] transition-all shadow-2xs group"
            >
              <Sparkles size={13} className="text-[#1BD582] flex-shrink-0" />
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
