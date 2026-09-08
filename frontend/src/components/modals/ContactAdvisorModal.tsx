import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Clock, MapPin, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactAdvisorModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[#023047] text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1BD582]/20 text-[#1BD582]">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="text-heading-sm font-bold text-white">Speak to a Senior Funding Advisor</h3>
                <p className="text-[11px] text-slate-300">Direct phone desk & live underwriting consultation</p>
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
            {/* Direct Call Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#023047] to-[#0B1E2E] text-white space-y-2 border border-[#1BD582]/30 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1BD582]">
                  Toll-Free Phone Desk
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-[#1BD582]/20 text-[#1BD582] px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1BD582] animate-pulse" /> Live Now
                </span>
              </div>
              <a
                href="tel:8888826117"
                className="block text-2xl font-extrabold text-white hover:text-[#1BD582] transition-colors"
              >
                (888) 882-6117
              </a>
              <p className="text-xs text-slate-300">
                Connect directly with our commercial underwriting team to discuss customized financing amounts up to $5,000,000.
              </p>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-semibold text-[11px]">
                  <Clock size={13} className="text-[#06C18C]" /> Operational Hours
                </div>
                <p className="font-medium text-[var(--text-primary)]">Monday – Friday</p>
                <p className="text-[var(--text-secondary)]">9:00 AM – 7:00 PM EST</p>
              </div>

              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-semibold text-[11px]">
                  <Mail size={13} className="text-[#06C18C]" /> Email Inquiry
                </div>
                <a
                  href="mailto:info@shieldfunding.com"
                  className="font-medium text-[#137499] hover:underline truncate block"
                >
                  info@shieldfunding.com
                </a>
                <p className="text-[var(--text-secondary)]">24h response time</p>
              </div>
            </div>

            {/* Office Locations */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-semibold text-[11px]">
                <MapPin size={13} className="text-[#06C18C]" /> National Office Locations
              </div>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                <li>• <strong>Admin HQ:</strong> 2 Sherri Ln, Spring Valley, NY 10977</li>
                <li>• <strong>Sales Division:</strong> 5 Paragon Dr, Montvale, NJ 07645</li>
                <li>• <strong>West Coast:</strong> 8807 W. Pico Blvd, Los Angeles, CA 90035</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="tel:8888826117"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1BD582] hover:bg-[#15b86f] text-[#023047] font-bold py-2.5 text-xs transition-all shadow-xs"
              >
                <Phone size={14} />
                <span>Call (888) 882-6117</span>
              </a>
              <a
                href="https://shieldfunding.com/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold py-2.5 px-4 text-xs transition-all"
              >
                <span>Online Form</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
