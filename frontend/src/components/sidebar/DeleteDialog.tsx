import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';

export default function DeleteDialog() {
  const deleteDialogId = useUiStore((s) => s.deleteDialogId);
  const setDeleteDialogId = useUiStore((s) => s.setDeleteDialogId);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteDialogId) return;
    setIsDeleting(true);
    try {
      await deleteConversation(deleteDialogId);
      toast.success('Conversation deleted');
      setDeleteDialogId(null);
    } catch {
      toast.error('Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AnimatePresence>
      {deleteDialogId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => !isDeleting && setDeleteDialogId(null)}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[var(--shadow-lg)]"
            >
              <h3 className="text-heading-sm text-[var(--text-primary)]">Delete conversation</h3>
              <p className="mt-2 text-body-sm text-[var(--text-secondary)]">
                This will permanently delete this conversation and all its messages. This action cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteDialogId(null)}
                  disabled={isDeleting}
                  className="focus-ring rounded-lg border border-[var(--border)] px-3.5 py-2 text-body-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="focus-ring flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-body-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting && <Loader2 size={14} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
