'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

// Basic client-side shape check only — this is a UX nicety, not a security
// boundary. The real validation that matters happens server-side via Supabase's
// column constraints and Row Level Security, which cannot be bypassed by
// tampering with client-side JS the way a client-only check can be.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setErrorMsg('Enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase.from('waitlist').insert({ email: trimmed });
      if (error) throw error;

      const utmProps: Record<string, string> = {};
      (['utm_source', 'utm_medium', 'utm_campaign'] as const).forEach((k) => {
        const v = searchParams.get(k);
        if (v) utmProps[k.replace('utm_', '')] = v;
      });
      window.plausible?.('Waitlist Signup', { props: utmProps });

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-bg-soft p-10 text-center">
      <h2 className="font-heading text-2xl font-semibold">Not ready to browse yet?</h2>
      <p className="mt-2 text-sm text-gray">
        Leave your email and we&apos;ll send you the highlights — new verified providers, new
        categories, no spam.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="flex-1 rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-blue-light"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending…' : 'Notify me'}
        </button>
      </form>
      {status === 'success' && (
        <p className="mt-3 text-sm font-medium text-ok">You&apos;re on the list — we&apos;ll be in touch. ✓</p>
      )}
      {status === 'error' && <p className="mt-3 text-sm font-medium text-danger">{errorMsg}</p>}
    </div>
  );
}
