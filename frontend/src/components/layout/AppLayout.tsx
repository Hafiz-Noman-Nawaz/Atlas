import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { AnimatePresence, motion } from 'framer-motion';
import SettingsPanel from '../settings/SettingsPanel';
import DeleteDialog from '../sidebar/DeleteDialog';
import RenameDialog from '../sidebar/RenameDialog';

export default function AppLayout() {
  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <div
        className={`hidden flex-shrink-0 transition-[width] duration-200 ease-in-out md:block ${
          sidebarOpen ? 'w-[280px]' : 'w-0'
        }`}
      >
        {sidebarOpen && <Sidebar />}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>

      {/* Settings panel */}
      <SettingsPanel />

      {/* Dialogs */}
      <DeleteDialog />
      <RenameDialog />
    </div>
  );
}
