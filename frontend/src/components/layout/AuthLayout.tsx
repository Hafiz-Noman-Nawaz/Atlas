import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import ShieldLogo from '../common/ShieldLogo';

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
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="mb-2">
            <ShieldLogo size="lg" showSubtitle={false} />
          </div>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Shield Funding AI Assistant • Commercial Capital Portal
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
