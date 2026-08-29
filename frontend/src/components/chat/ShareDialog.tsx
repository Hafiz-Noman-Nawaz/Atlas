import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Globe, ExternalLink, MessageCircle, Loader2, Send } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { chatApi } from '../../services/chatApi';
import toast from 'react-hot-toast';

export default function ShareDialog() {
  const { shareDialogOpen, shareDialogConversationId, setShareDialogOpen } = useUiStore();
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareTitle, setShareTitle] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (shareDialogOpen && shareDialogConversationId) {
      generateShare();
    } else {
      setShareUrl('');
      setShareTitle('');
      setCopied(false);
    }
  }, [shareDialogOpen, shareDialogConversationId]);

  async function generateShare() {
    if (!shareDialogConversationId) return;
    setIsLoading(true);
    try {
      const res = await chatApi.createShareLink(shareDialogConversationId);
      const fullUrl = `${window.location.origin}${res.share_url}`;
      setShareUrl(fullUrl);
      setShareTitle(res.title || 'ZeoAtlas Conversation');
    } catch {
      toast.error('Failed to generate public share link');
      setShareDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this conversation with ZeoAtlas AI: "${shareTitle}"`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this AI conversation on ZeoAtlas: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      {shareDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShareDialogOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Share Conversation</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Public read-only link</p>
                </div>
              </div>

              <button
                onClick={() => setShareDialogOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 size={24} className="animate-spin text-teal-400" />
                <p className="text-xs text-slate-400">Creating public snapshot link...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Anyone with this link will be able to view a read-only snapshot of this chat. Your private account details remain secure.
                </p>

                {/* Link Box */}
                <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 pr-2">
                  <Globe size={16} className="text-teal-400 ml-1.5 flex-shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-[var(--text-primary)] focus:outline-none select-all truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={13} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Social Share Buttons */}
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Share to Socials
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg)] p-2.5 text-xs font-medium text-slate-300 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-400 transition-all"
                    >
                      <span className="font-bold text-sky-400">𝕏</span>
                      <span>Twitter</span>
                    </button>

                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg)] p-2.5 text-xs font-medium text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 transition-all"
                    >
                      <Send size={13} className="text-blue-400" />
                      <span>LinkedIn</span>
                    </button>

                    <button
                      onClick={shareOnWhatsApp}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg)] p-2.5 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                    >
                      <MessageCircle size={14} className="text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <span>Preview shared page</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
