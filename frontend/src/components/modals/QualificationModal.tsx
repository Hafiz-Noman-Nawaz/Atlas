import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, ExternalLink, Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QualificationModal({ isOpen, onClose }: Props) {
  const [revenue, setRevenue] = useState('$25,000 – $50,000');
  const [timeInBusiness, setTimeInBusiness] = useState('1 – 3 Years');
  const [creditRange, setCreditRange] = useState('600 – 679 (Fair)');
  const [fundingAmount, setFundingAmount] = useState('$50,000 – $100,000');
  const [step, setStep] = useState<'form' | 'result'>('form');

  const sendMessage = useChatStore((s) => s.sendMessage);

  if (!isOpen) return null;

  const isEligible = timeInBusiness !== 'Under 4 Months';

  const handleConsultWithAI = () => {
    onClose();
    sendMessage(
      `I checked my qualification details: Monthly Revenue: ${revenue}, Time in Business: ${timeInBusiness}, Credit Range: ${creditRange}, Target Funding: ${fundingAmount}. What financing options and rates do I qualify for?`
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[#023047] text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1BD582]/20 text-[#1BD582]">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="text-heading-sm font-bold text-white">Quick Eligibility & Qualification Check</h3>
                <p className="text-[11px] text-slate-300">Instant pre-qualification without affecting your credit score</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {step === 'form' ? (
              <>
                {/* Field 1: Monthly Revenue */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Average Monthly Gross Revenue
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['$10,000 – $25,000', '$25,000 – $50,000', '$50,000 – $100,000', '$100,000+'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setRevenue(opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                          revenue === opt
                            ? 'border-[#1BD582] bg-emerald-50 dark:bg-emerald-950/20 text-[#023047] dark:text-[#1BD582] font-semibold'
                            : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 2: Time in Business */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Time in Business
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Under 4 Months', '4 – 12 Months', '1 – 3 Years', '3+ Years'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTimeInBusiness(opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                          timeInBusiness === opt
                            ? 'border-[#1BD582] bg-emerald-50 dark:bg-emerald-950/20 text-[#023047] dark:text-[#1BD582] font-semibold'
                            : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 3: Credit Score Tier */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Estimated Credit Score (FICO)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Under 550 (Challenged)', '550 – 620 (Fair)', '620 – 680 (Good)', '680+ (Excellent)'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCreditRange(opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                          creditRange === opt
                            ? 'border-[#1BD582] bg-emerald-50 dark:bg-emerald-950/20 text-[#023047] dark:text-[#1BD582] font-semibold'
                            : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 4: Target Funding */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Target Capital Amount Needed
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['$10k – $35k', '$35k – $75k', '$75k – $150k', '$150k – $500k+'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFundingAmount(opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                          fundingAmount === opt
                            ? 'border-[#1BD582] bg-emerald-50 dark:bg-emerald-950/20 text-[#023047] dark:text-[#1BD582] font-semibold'
                            : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep('result')}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#1BD582] hover:bg-[#15b86f] text-[#023047] font-bold py-3 text-xs tracking-wide shadow-md transition-all"
                >
                  <span>Evaluate Qualification</span>
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              /* Qualification Result View */
              <div className="space-y-4">
                {isEligible ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#1BD582] text-[#023047] mt-0.5">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        Pre-Qualified for Multiple Shield Funding Programs!
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Based on <strong>{revenue}</strong> in monthly sales and <strong>{timeInBusiness}</strong> in business, your company qualifies for rapid commercial capital.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white mt-0.5">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                        Near-Eligibility Review
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Standard programs require at least 4 months in business. However, our advisors can review startup alternative options.
                      </p>
                    </div>
                  </div>
                )}

                {/* Match Summary Box */}
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-2">
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">Recommended Financing Matches:</h5>
                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-light)]">
                      <span>• Merchant Cash Advance (MCA)</span>
                      <span className="font-semibold text-[#06C18C]">24h Funding • Pre-Approved</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-light)]">
                      <span>• Revolving Business Line of Credit</span>
                      <span className="font-semibold text-[#137499]">Eligible</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>• Small Business Term Loan</span>
                      <span className="font-semibold text-slate-500">Subject to Underwriting</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <button
                    onClick={handleConsultWithAI}
                    className="w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#023047] hover:bg-[#0B1E2E] text-white py-2.5 text-xs font-semibold shadow-xs transition-all"
                  >
                    <Sparkles size={13} className="text-[#1BD582]" />
                    <span>Ask AI for Tailored Rate Quote</span>
                  </button>
                  <a
                    href="https://shieldfunding.com/apply/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#1BD582] hover:bg-[#15b86f] text-[#023047] py-2.5 px-4 text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Official Application</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <button
                  onClick={() => setStep('form')}
                  className="w-full text-center text-xs text-[var(--text-tertiary)] hover:underline pt-1"
                >
                  ← Edit qualification inputs
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
