import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';

export default function RenameDialog() {
  const renameDialogId = useUiStore((s) => s.renameDialogId);
  const setRenameDialogId = useUiStore((s) => s.setRenameDialogId);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const conversations = useChatStore((s) => s.conversations);

  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (renameDialogId) {
      const conv = conversations.find((c) => c.id === renameDialogId);
      setTitle(conv?.title || '');
    }
  }, [renameDialogId, conversations]);

  async function handleSave() {
    if (!renameDialogId || !title.trim()) return;
    setIsSaving(true);
    try {
      await renameConversation(renameDialogId, title.trim());
      toast.success('Conversation renamed');
      setRenameDialogId(null);
    } catch {
      toast.error('Failed to rename conversation');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {renameDialogId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => !isSaving && setRenameDialogId(null)}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[var(--shadow-lg)]"
            >
              <h3 className="text-heading-sm text-[var(--text-primary)]">Rename conversation</h3>
              <div className="mt-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Conversation title"
                  autoFocus
                  className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-accent"
                  disabled={isSaving}
                  maxLength={255}
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setRenameDialogId(null)}
                  disabled={isSaving}
                  className="focus-ring rounded-lg border border-[var(--border)] px-3.5 py-2 text-body-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="focus-ring flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-body-sm font-medium text-white hover:bg-accent-light transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
