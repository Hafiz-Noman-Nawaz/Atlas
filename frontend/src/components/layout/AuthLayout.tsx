import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-secondary)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[430px]"
      >
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mb-2.5 flex items-center justify-center gap-2.5">
            <img src="/logo.png" alt="ZeoAtlas" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-cyan-500/20" />
            <h1 className="text-heading-md font-bold text-[var(--text-primary)]">ZeoAtlas</h1>
          </div>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Intelligent ML & Programming Assistant
          </p>
        </div>

        {/* Content container */}
        {CLERK_PUBLISHABLE_KEY ? (
          <div className="flex justify-center">
            <Outlet />
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-xl">
            <Outlet />
          </div>
        )}
      </motion.div>
    </div>
  );
}
