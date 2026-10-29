'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Turnstile, { TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import { trackEvent } from '@/lib/analytics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Direct message to a provider: /api/lead saves it as a lead (after the captcha) and tells the admin.
// Used in the directory modal and on /providers/<slug>.
export default function ProviderContactForm({ providerId, providerName }: { providerId: string; providerName: string }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });
  const [sendState, setSendState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);

  async function handleSend() {
    setErrorMsg('');
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim()) || !form.message.trim()) {
      setSendState('error');
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setSendState('error');
      setErrorMsg('Please wait for the security check to finish, then try again.');
      return;
    }
    setSendState('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: providerId,
          name: form.name,
          company: form.company,
          email: form.email,
          message: form.message,
          captchaToken,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'failed');
      }
      setSendState('success');
      captcha.current?.reset();
      trackEvent('lead_sent', { label: providerName });
      setForm({ name: '', company: '', email: '', message: '' });
    } catch (err) {
      setSendState('error');
      setErrorMsg(err instanceof Error && err.message !== 'failed' ? err.message : 'Something went wrong. Please try again.');
      captcha.current?.reset();
    }
  }

  const input = 'rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep';

  return (
    <div>
      <h4 className="mb-3.5 text-sm font-semibold">Contact {providerName}</h4>
      <div className="grid grid-cols-2 gap-2.5">
        <input
          placeholder="Your name"
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
          className={input}
        />
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, company: e.target.value })}
          className={input}
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
        className={`mt-2.5 w-full ${input}`}
      />
      <textarea
        placeholder="Briefly describe your project..."
        value={form.message}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, message: e.target.value })}
        rows={3}
        className={`mt-2.5 w-full ${input}`}
      />
      <Turnstile ref={captcha} onToken={setCaptchaToken} action="lead" className="mt-3 flex justify-center" />
      <button
        onClick={handleSend}
        disabled={sendState === 'loading'}
        className="mt-3 w-full rounded-lg bg-ink py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        Send message
      </button>
      {sendState === 'success' && (
        <p className="mt-2.5 rounded-lg bg-ok/10 p-3 text-sm text-ok">
          ✓ Sent: {providerName} will get back to you directly.
        </p>
      )}
      {sendState === 'error' && errorMsg && (
        <p className="mt-2.5 rounded-lg bg-danger/10 p-3 text-sm text-danger">{errorMsg}</p>
      )}
    </div>
  );
}
