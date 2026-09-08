import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, ArrowRight, DollarSign, Calendar, TrendingUp, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyForCalculation?: (summaryText: string) => void;
}

type ProductKey = 'mca' | 'loc' | 'term';

interface ProductConfig {
  name: string;
  badge: string;
  defaultTerm: number;
  minTerm: number;
  maxTerm: number;
  factorRateMin: number;
  factorRateMax: number;
  remittanceType: 'daily' | 'weekly' | 'monthly';
  description: string;
}

const PRODUCTS: Record<ProductKey, ProductConfig> = {
  mca: {
    name: 'Merchant Cash Advance',
    badge: '⚡ Fastest (24-48 hrs)',
    defaultTerm: 6,
    minTerm: 3,
    maxTerm: 18,
    factorRateMin: 1.15,
    factorRateMax: 1.35,
    remittanceType: 'daily',
    description: 'Flexible remittances that flex naturally with your daily credit card receipts or bank deposits.',
  },
  loc: {
    name: 'Business Line of Credit',
    badge: '🔄 Revolving Capital',
    defaultTerm: 12,
    minTerm: 6,
    maxTerm: 24,
    factorRateMin: 1.08,
    factorRateMax: 1.22,
    remittanceType: 'weekly',
    description: 'Draw only what you need, pay interest only on borrowed funds, and re-draw as you repay.',
  },
  term: {
    name: 'Commercial Term Loan',
    badge: '📊 Predictable Fixed',
    defaultTerm: 12,
    minTerm: 6,
    maxTerm: 36,
    factorRateMin: 1.12,
    factorRateMax: 1.28,
    remittanceType: 'monthly',
    description: 'Standard fixed payments spread over a predictable duration for long-term investments.',
  },
};

export default function FundingCalculatorModal({ isOpen, onClose, onApplyForCalculation }: Props) {
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [requestedAmount, setRequestedAmount] = useState<number>(50000);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(35000);
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>('mca');
  const [termMonths, setTermMonths] = useState<number>(6);

  const product = PRODUCTS[selectedProduct];

  // Calculation estimates
  const estimates = useMemo(() => {
    // Factor rate scales with revenue/loan ratio
    const ratio = requestedAmount / Math.max(monthlyRevenue, 10000);
    const midFactor = (product.factorRateMin + product.factorRateMax) / 2;
    const factorRate = Math.min(
      product.factorRateMax,
      Math.max(product.factorRateMin, Number((midFactor + (ratio > 2 ? 0.05 : -0.03)).toFixed(2)))
    );

    const totalPayback = Math.round(requestedAmount * factorRate);
    const totalCostOfCapital = totalPayback - requestedAmount;

    // Payments
    const businessDaysPerMonth = 21;
    const weeksPerMonth = 4.33;

    const totalDays = termMonths * businessDaysPerMonth;
    const totalWeeks = Math.round(termMonths * weeksPerMonth);

    const dailyPayment = Math.round(totalPayback / Math.max(totalDays, 1));
    const weeklyPayment = Math.round(totalPayback / Math.max(totalWeeks, 1));
    const monthlyPayment = Math.round(totalPayback / Math.max(termMonths, 1));

    // Approval likelihood
    let approvalRating: 'Excellent' | 'Strong' | 'Fair' = 'Strong';
    let approvalColor = 'text-emerald-500';
    if (monthlyRevenue >= requestedAmount * 0.8 && monthlyRevenue >= 20000) {
      approvalRating = 'Excellent';
      approvalColor = 'text-emerald-400';
    } else if (monthlyRevenue < 15000 || ratio > 2.5) {
      approvalRating = 'Fair';
      approvalColor = 'text-amber-400';
    }

    return {
      factorRate,
      totalPayback,
      totalCostOfCapital,
      dailyPayment,
      weeklyPayment,
      monthlyPayment,
      approvalRating,
      approvalColor,
    };
  }, [requestedAmount, monthlyRevenue, selectedProduct, termMonths, product]);

  const handleDiscussInChat = () => {
    const text = `I calculated funding options in the calculator: Requested $${requestedAmount.toLocaleString()} via ${product.name} over ${termMonths} months (Monthly Revenue: $${monthlyRevenue.toLocaleString()}). What documentation do I need to get approved for this?`;
    onClose();
    if (onApplyForCalculation) {
      onApplyForCalculation(text);
    } else {
      sendMessage(text);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg)] via-[#2B7A9D]/10 to-[var(--bg)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2B7A9D]/15 border border-[#2B7A9D]/30 flex items-center justify-center text-[#2B7A9D]">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  Shield Funding Business Loan Estimator
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-semibold">
                    Live Rates
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Estimate factor rates, remittances, and monthly cash flow impacts instantly.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Product Selector Pills */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Select Funding Solution
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(PRODUCTS) as ProductKey[]).map((key) => {
                  const p = PRODUCTS[key];
                  const isSelected = selectedProduct === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedProduct(key);
                        setTermMonths(p.defaultTerm);
                      }}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#2B7A9D]/15 border-[#2B7A9D] text-[var(--text-primary)] ring-1 ring-[#2B7A9D]/50 shadow-xs'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{p.name}</div>
                      <div className="text-[10px] mt-1 text-[#2B7A9D] dark:text-[#38bdf8] font-medium">{p.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Requested Capital Slider */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
                    <DollarSign size={13} className="text-[#2B7A9D]" /> Desired Funding Amount
                  </span>
                  <span className="text-base font-extrabold text-[var(--text-primary)]">
                    ${requestedAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full accent-[#2B7A9D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>$5,000</span>
                  <span>$250,000</span>
                  <span>$500,000+</span>
                </div>
              </div>

              {/* Monthly Revenue Slider */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
                    <TrendingUp size={13} className="text-emerald-500" /> Monthly Gross Sales
                  </span>
                  <span className="text-base font-extrabold text-[var(--text-primary)]">
                    ${monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="250000"
                  step="5000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>$10,000/mo min</span>
                  <span>$100,000</span>
                  <span>$250,000+</span>
                </div>
              </div>
            </div>

            {/* Term Duration Slider */}
            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
                  <Calendar size={13} className="text-[#2B7A9D]" /> Estimated Duration
                </span>
                <span className="text-base font-extrabold text-[var(--text-primary)]">
                  {termMonths} Months
                </span>
              </div>
              <input
                type="range"
                min={product.minTerm}
                max={product.maxTerm}
                step="1"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full accent-[#2B7A9D] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                <span>{product.minTerm} Months</span>
                <span>{Math.round((product.minTerm + product.maxTerm) / 2)} Months</span>
                <span>{product.maxTerm} Months</span>
              </div>
            </div>

            {/* Live Calculation Results Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1824] to-[#122839] border border-[#2B7A9D]/30 text-white space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                    Estimated Remittance
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                    {product.remittanceType === 'daily' && `$${estimates.dailyPayment.toLocaleString()} / day`}
                    {product.remittanceType === 'weekly' && `$${estimates.weeklyPayment.toLocaleString()} / wk`}
                    {product.remittanceType === 'monthly' && `$${estimates.monthlyPayment.toLocaleString()} / mo`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {product.remittanceType === 'daily'
                      ? 'Mon–Fri business days only (adjusts with sales)'
                      : product.remittanceType === 'weekly'
                      ? 'Weekly electronic auto-remittance'
                      : 'Fixed monthly commercial payment'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Approval Odds
                  </div>
                  <div className={`text-base font-bold flex items-center justify-end gap-1 ${estimates.approvalColor}`}>
                    <CheckCircle2 size={16} />
                    {estimates.approvalRating}
                  </div>
                  <div className="text-[10px] text-slate-400">Soft pull only</div>
                </div>
              </div>

              {/* Key Figures Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400">Total Payback</div>
                  <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                    ${estimates.totalPayback.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400">Est. Factor / Cost</div>
                  <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                    {estimates.factorRate}x
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400">Funding Speed</div>
                  <div className="text-sm sm:text-base font-bold text-sky-400 mt-0.5">
                    Same Day
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleDiscussInChat}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className="text-[#2B7A9D]" />
              Ask AI Advisor About This Quote
            </button>

            <a
              href="https://shieldfunding.com/apply/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#023047] via-[#125c7e] to-[#2B7A9D] hover:from-[#033d5a] hover:to-[#358eb5] text-white text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <ShieldCheck size={16} />
              <span>Apply Online at Shield Funding</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
