'use client';

import { useRef, useState, type FormEvent, type ReactNode, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Turnstile, { TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import { supabase } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type AccountType = 'client' | 'provider';
type Mode = 'login' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>('login');
  const [accountType, setAccountType] = useState<AccountType>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);

  function validate(): string | null {
    if (mode === 'signup' && fullName.trim().length < 2) return 'Enter your full name.';
    if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (mode === 'signup' && password !== confirmPassword) return "Passwords don't match.";
    if (TURNSTILE_ENABLED && !captchaToken) return 'Checking that you are human, try again in a moment.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setStatus('error');
      setMessage(validationError);
      return;
    }

    setStatus('loading');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim(), account_type: accountType }, captchaToken: captchaToken || undefined },
        });
        if (error) throw error;
        setStatus('success');
        setMessage('Account created. Check your email to confirm, then log in.');
        setTimeout(() => setMode('login'), 1600);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
          options: { captchaToken: captchaToken || undefined },
        });
        if (error) throw error;
        setStatus('success');
        setMessage('Logged in, redirecting to your dashboard…');
        const userType = data.user?.user_metadata?.account_type as AccountType | undefined;
        // Only same-site paths ("/admin"), never "//evil.com" or absolute URLs.
        const redirectTo = searchParams.get('redirectTo');
        const safeRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : null;
        setTimeout(() => {
          router.push(safeRedirect ?? (userType === 'provider' ? '/provider-dashboard' : '/client-dashboard'));
        }, 500);
      }
    } catch {
      setStatus('error');
      // Deliberately generic: revealing "no account with that email" vs "wrong
      // password" lets an attacker enumerate which emails have accounts.
      // Supabase Auth also rate-limits repeated attempts server-side.
      setMessage('Something went wrong. Check your details and try again.');
    } finally {
      // Captcha tokens are single-use: get a fresh one for the next attempt.
      captcha.current?.reset();
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-center bg-ink px-16 py-20 text-white md:flex">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-heading text-lg font-semibold">ORIVIONS</span>
        </div>
        <h1 className="mt-10 font-heading text-3xl font-semibold leading-tight">
          The <span className="text-blue-light">business infrastructure layer</span> for the Solana ecosystem.
        </h1>
        <p className="mt-4 max-w-sm text-white/70">Discover, verify, and hire trusted partners across the entire Solana ecosystem, or get found by the clients who need you.</p>
        <div className="mt-12 flex gap-8 text-sm">
          <div>
            <div className="font-heading text-2xl font-semibold">1,200+</div>
            <div className="text-white/60">Verified providers</div>
          </div>
          <div>
            <div className="font-heading text-2xl font-semibold">340+</div>
            <div className="text-white/60">Categories</div>
          </div>
          <div>
            <div className="font-heading text-2xl font-semibold">Beta</div>
            <div className="text-white/60">Now onboarding</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h2 className="font-heading text-2xl font-semibold">
            {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
          </h2>
          <p className="mt-1 text-sm text-gray">
            {mode === 'login' ? 'Log in to your Orivions account.' : accountType === 'client' ? 'Join Orivions as a client.' : 'Join Orivions as a provider.'}
          </p>

          <div className="mt-6 flex rounded-xl bg-bg-soft p-1">
            <button
              onClick={() => setAccountType('client')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                accountType === 'client' ? 'bg-white shadow-sm' : 'text-gray-soft'
              }`}
            >
              I&apos;m a client
            </button>
            <button
              onClick={() => setAccountType('provider')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                accountType === 'provider' ? 'bg-white shadow-sm' : 'text-gray-soft'
              }`}
            >
              I&apos;m a provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {mode === 'signup' && (
              <Field label="Full name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="input"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                autoComplete="email"
                className="input"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="input"
              />
            </Field>
            {mode === 'signup' && (
              <Field label="Confirm password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="input"
                />
              </Field>
            )}

            <Turnstile ref={captcha} onToken={setCaptchaToken} action={mode} />

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {mode === 'login' ? 'Log in' : 'Create account'}
            </button>

            {status === 'success' && <p className="text-sm font-medium text-ok">✓ {message}</p>}
            {status === 'error' && <p className="text-sm font-medium text-danger">⚠ {message}</p>}
          </form>

          <div className="mt-6 text-center text-sm text-gray">
            {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-semibold text-blue-deep"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>

          <Link href="/" className="mt-8 block text-center text-xs text-gray-soft">
            ← Back to Orivions
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #eaeaee;
          padding: 0.7rem 0.9rem;
          font-size: 0.9rem;
          outline: none;
        }
        .input:focus {
          border-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray">{label}</span>
      {children}
    </label>
  );
}
