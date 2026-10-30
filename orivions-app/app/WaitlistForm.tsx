'use client';

import { useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Turnstile, { TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import { trackEvent } from '@/lib/analytics';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

// Basic client-side shape check only; this is a UX nicety, not a security
// boundary. /api/waitlist validates the email again, checks the captcha and
// rate-limits by IP before writing to Supabase.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setErrorMsg('Checking that you are human, try again in a moment.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, captchaToken }),
      });
      if (!res.ok) throw new Error('Waitlist request failed');

      const utmProps: Record<string, string> = {};
      (['utm_source', 'utm_medium', 'utm_campaign'] as const).forEach((k) => {
        const v = searchParams.get(k);
        if (v) utmProps[k.replace('utm_', '')] = v;
      });
      window.plausible?.('Waitlist Signup', { props: utmProps });
      trackEvent('waitlist_signup');

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      captcha.current?.reset();
    }
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <h2 className="font-heading text-3xl font-medium">Not ready yet?</h2>
      <p className="mt-2 text-sm text-gray">
        Leave your email for new verified providers. No spam.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="flex-1 rounded-lg border border-ink/25 bg-white px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending…' : 'Notify me'}
        </button>
      </form>
      <Turnstile ref={captcha} onToken={setCaptchaToken} action="waitlist" className="mt-3 flex justify-center" />
      {status === 'success' && (
        <p className="mt-3 text-sm font-medium text-ok">You&apos;re on the list. We&apos;ll be in touch. ✓</p>
      )}
      {status === 'error' && <p className="mt-3 text-sm font-medium text-danger">{errorMsg}</p>}
    </div>
  );
}
