'use client';

import { useState, type ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Direct message to a provider: saved as a lead and forwarded to the admin.
// Used in the directory modal and on /providers/<slug>.
export default function ProviderContactForm({ providerId, providerName }: { providerId: string; providerName: string }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });
  const [sendState, setSendState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSend() {
    setErrorMsg('');
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim()) || !form.message.trim()) {
      setSendState('error');
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }
    setSendState('loading');
    try {
      const { error } = await supabase.from('leads').insert({
        company_id: providerId,
        client_name: form.name.trim(),
        client_company: form.company.trim(),
        client_email: form.email.trim(),
        message: form.message.trim(),
        status: 'new',
      });
      if (error) throw error;
      // Best-effort admin ping; never blocks the client.
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead', companyId: providerId }),
      }).catch(() => {});
      setSendState('success');
      setForm({ name: '', company: '', email: '', message: '' });
    } catch {
      setSendState('error');
      setErrorMsg('Something went wrong. Please try again.');
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
