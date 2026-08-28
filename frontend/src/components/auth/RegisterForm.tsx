import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { setToken, fetchUser } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password criteria
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCriteriaCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isStrong = hasMinLength && (passedCriteriaCount >= 4);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (passedCriteriaCount < 3) {
      setError('Please choose a stronger password (include uppercase, numbers, or symbols).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      setToken(res.access_token);
      await fetchUser();
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Unable to create account. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h2 className="text-heading-sm font-bold text-[var(--text-primary)]">Create account</h2>
        <p className="mt-1 text-body-sm text-[var(--text-secondary)]">
          Get started with ZeoAtlas in a few seconds.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-body-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-caption text-[var(--text-secondary)]">
            Name
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-accent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-caption text-[var(--text-secondary)]">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-accent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-caption text-[var(--text-secondary)]">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 pr-10 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-accent"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] p-2.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)]">
                <span>Strength</span>
                <span className={isStrong ? 'text-emerald-400 font-bold' : passedCriteriaCount >= 3 ? 'text-amber-400 font-medium' : 'text-red-400'}>
                  {isStrong ? 'Strong' : passedCriteriaCount >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/40">
                <div
                  className={`h-full transition-all duration-300 ${
                    isStrong ? 'bg-emerald-500 w-full' : passedCriteriaCount >= 3 ? 'bg-amber-500 w-3/4' : 'bg-red-500 w-1/3'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-[var(--text-tertiary)]">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : ''}`}>
                  {hasMinLength ? <Check size={11} /> : <X size={11} />} 8+ Characters
                </span>
                <span className={`flex items-center gap-1 ${hasUpper && hasLower ? 'text-emerald-400' : ''}`}>
                  {hasUpper && hasLower ? <Check size={11} /> : <X size={11} />} Upper & Lowercase
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : ''}`}>
                  {hasNumber ? <Check size={11} /> : <X size={11} />} Number (0-9)
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : ''}`}>
                  {hasSpecial ? <Check size={11} /> : <X size={11} />} Symbol (!@#$)
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm" className="mb-1.5 block text-caption text-[var(--text-secondary)]">
            Confirm password
          </label>
          <input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:border-accent"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-body font-medium text-white transition-colors hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/20"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </button>

      <p className="text-center text-body-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-light transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
