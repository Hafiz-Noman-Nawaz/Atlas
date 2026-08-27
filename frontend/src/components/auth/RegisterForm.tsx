import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
        <h2 className="text-heading-sm text-[var(--text-primary)]">Create account</h2>
        <p className="mt-1 text-body-sm text-[var(--text-secondary)]">
          Get started with Atlas in a few seconds.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-body-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
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
              placeholder="At least 8 characters"
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
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-body font-medium text-white transition-colors hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
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
