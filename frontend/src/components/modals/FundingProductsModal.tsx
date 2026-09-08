import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, ExternalLink, DollarSign, Clock, Shield } from 'lucide-react';
import { SHIELD_PRODUCTS, ShieldProduct } from '../../services/shieldMockService';
import { useChatStore } from '../../stores/chatStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundingProductsModal({ isOpen, onClose }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<ShieldProduct>(SHIELD_PRODUCTS[0] || ({} as ShieldProduct));
  const sendMessage = useChatStore((s) => s.sendMessage);

  if (!isOpen) return null;

  const handleAskAboutProduct = (product: ShieldProduct) => {
    onClose();
    sendMessage(`Can you explain more about the ${product.name} and the requirements to qualify?`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[#023047] text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1BD582]/20 text-[#1BD582] border border-[#1BD582]/30">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-heading-sm font-bold text-white">Shield Funding Commercial Products</h3>
                <p className="text-xs text-slate-300">Compare financing structures, capital limits, and speeds to funding</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Layout */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
            {/* Product Selector Sidebar (Left 5 Cols) */}
            <div className="md:col-span-5 border-r border-[var(--border)] p-3 space-y-2 bg-[var(--bg-secondary)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-2 pt-1 pb-0.5">
                Select Financing Product
              </p>
              {SHIELD_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'border-[#1BD582] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                        : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        {prod.name}
                      </span>
                      <span className="text-[10px] font-bold text-[#06C18C] bg-[#1BD582]/10 px-2 py-0.5 rounded-md">
                        {prod.amountRange}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] line-clamp-1">
                      {prod.badge} • {prod.speed}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Product Detail Panel (Right 7 Cols) */}
            <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#06C18C] bg-[#1BD582]/15 px-2.5 py-0.5 rounded-full">
                      {selectedProduct.badge}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">
                      Funded in {selectedProduct.speed}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mt-1.5">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold flex items-center gap-1">
                      <DollarSign size={12} className="text-[#06C18C]" /> Maximum Funding
                    </span>
                    <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{selectedProduct.amountRange}</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold flex items-center gap-1">
                      <Clock size={12} className="text-[#06C18C]" /> Terms & Repayment
                    </span>
                    <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{selectedProduct.termRange}</p>
                  </div>
                </div>

                {/* Key Highlights */}
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)] mb-2">Program Features & Advantages</h5>
                  <div className="space-y-1.5">
                    {selectedProduct.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 size={14} className="text-[#1BD582] flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-light)] text-xs">
                  <strong className="text-[var(--text-primary)]">Ideal Candidates: </strong>
                  <span className="text-[var(--text-secondary)]">{selectedProduct.bestFor}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => handleAskAboutProduct(selectedProduct)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#023047] hover:bg-[#0B1E2E] text-white py-2.5 px-3 text-xs font-semibold transition-all shadow-xs"
                >
                  <span>Ask AI Assistant About This</span>
                  <ArrowRight size={13} />
                </button>
                <a
                  href={selectedProduct.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1BD582] hover:bg-[#15b86f] text-[#023047] py-2.5 px-4 text-xs font-bold transition-all shadow-xs"
                >
                  <span>Apply Online</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
