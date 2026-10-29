'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Turnstile, { TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import { trackEvent } from '@/lib/analytics';

// "Get a hand-picked shortlist": a person at Orivions reads the brief and
// replies by email with suitable verified providers. Posts to /api/concierge.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUDGETS = ['', 'Under $5k', '$5k-$20k', '$20k-$50k', '$50k-$150k', '$150k+'];
const TIMELINES = ['', 'ASAP', 'Within a month', '1-3 months', 'Just exploring'];

interface Props {
  need: string;
  source: string;
  title?: string;
  text?: string;
}

export default function ConciergeForm({ need: initialNeed, source, title, text }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [need, setNeed] = useState(initialNeed);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (name.trim().length < 2) return fail('Enter your name.');
    if (!EMAIL_RE.test(email.trim())) return fail('Enter a valid email address.');
    if (need.trim().length < 10) return fail('Tell us a little more about the project.');
    if (TURNSTILE_ENABLED && !captchaToken) return fail('Checking that you are human, try again in a moment.');

    setStatus('loading');
    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, need, budget, timeline, source, captchaToken }),
      });
      if (res.status === 429) return fail('Too many requests. Try again later.');
      if (!res.ok) throw new Error('Concierge request failed');
      window.plausible?.('Concierge Request', { props: { source } });
      trackEvent('concierge_submit', { label: source });
      setStatus('success');
    } catch {
      fail('Something went wrong. Please try again.');
    } finally {
      captcha.current?.reset();
    }
  }

  function fail(message: string) {
    setStatus('error');
    setErrorMsg(message);
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-ok/30 bg-ok/5 p-6 text-left">
        <div className="font-heading text-lg font-semibold">Request received ✓</div>
        <p className="mt-1 text-sm text-gray">
          A person at Orivions will read your brief and email you a shortlist of verified providers,
          usually within two business days. Free, no obligation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-line p-6 text-left">
      <div className="font-heading text-lg font-semibold">{title ?? 'Get a hand-picked shortlist'}</div>
      <p className="mt-1 text-sm text-gray">
        {text ??
          'Tell us what you need and a person at Orivions will email you up to three verified providers that fit. Free for teams.'}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <textarea value={need} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNeed(e.target.value)} placeholder="What do you need? Scope, stage, anything that matters." rows={4} className="cf-input resize-none sm:col-span-2" />
        <input value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="cf-input" />
        <input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="cf-input" />
        <input value={company} onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)} placeholder="Project or company (optional)" autoComplete="organization" className="cf-input sm:col-span-2" />
        <select value={budget} onChange={(e: ChangeEvent<HTMLSelectElement>) => setBudget(e.target.value)} className="cf-input bg-white" aria-label="Budget">
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{b || 'Budget (optional)'}</option>
          ))}
        </select>
        <select value={timeline} onChange={(e: ChangeEvent<HTMLSelectElement>) => setTimeline(e.target.value)} className="cf-input bg-white" aria-label="Timeline">
          {TIMELINES.map((t) => (
            <option key={t} value={t}>{t || 'Timeline (optional)'}</option>
          ))}
        </select>
      </div>
      <Turnstile ref={captcha} onToken={setCaptchaToken} action="concierge" className="mt-3" />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send my brief'}
      </button>
      {status === 'error' && <p className="mt-2 text-sm font-medium text-danger">{errorMsg}</p>}
      <style jsx>{`
        .cf-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #eaeaee;
          padding: 0.7rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
          font-family: inherit;
        }
        .cf-input:focus {
          border-color: #1d4ed8;
        }
      `}</style>
    </form>
  );
}
