'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import Turnstile, { TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';

// Newsletter signup. /api/newsletter checks the captcha, rate-limits by IP and stores
// the consent with the row; this form only does a basic shape check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'client' | 'provider'>('client');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) return setErrorMsg('Enter a valid email address.');
    if (!consent) return setErrorMsg('Please tick the consent box.');
    if (TURNSTILE_ENABLED && !captchaToken) return setErrorMsg('Checking that you are human, try again in a moment.');

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, role, consent, source: window.location.pathname, captchaToken }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('idle');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      captcha.current?.reset();
    }
  }

  if (status === 'success') {
    return (
      <p className="rounded-2xl border border-line p-5 text-[15px] font-medium text-ok">
        Thanks. Check your inbox: you may get a confirmation email to click once.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold">I am</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" checked={role === 'client'} onChange={() => setRole('client')} />
            hiring providers (a project team)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" checked={role === 'provider'} onChange={() => setRole('provider')} />
            a provider (auditor, developer, agency)
          </label>
        </div>
      </fieldset>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          aria-label="Email address"
          className="flex-1 rounded-lg border border-ink/25 bg-white px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      <label className="flex items-start gap-2 text-[13px] leading-snug text-gray">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>
          I agree to receive the Orivions newsletter by email. I can unsubscribe at any time. We use your email only
          for this newsletter and never sell it. See the{' '}
          <Link href="/privacy" className="text-blue-deep">Privacy Policy</Link>.
        </span>
      </label>
      <Turnstile ref={captcha} onToken={setCaptchaToken} action="newsletter" className="flex" />
      {errorMsg ? <p className="text-sm font-medium text-danger">{errorMsg}</p> : null}
    </form>
  );
}
