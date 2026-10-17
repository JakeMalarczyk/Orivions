'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabase';

export default function ProposalGeneratorClient() {
  const [brief, setBrief] = useState('');
  const [services, setServices] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate() {
    setErrorMsg('');
    if (!brief.trim() || !services.trim()) {
      setErrorMsg('Please fill in both the client brief and your services.');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      // The endpoint requires a logged-in session and builds the prompt
      // server-side, we send only the structured inputs (audit finding 2.4).
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setErrorMsg('Please log in to use the proposal generator.');
        return;
      }

      const res = await fetch('/api/ai-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ brief: brief.trim(), services: services.trim(), tone: tone.trim() }),
      });
      if (res.status === 401) {
        setErrorMsg('Session expired. Please log in again.');
        return;
      }
      if (res.status === 429) {
        setErrorMsg('Too many requests. Give it a minute and try again.');
        return;
      }
      if (!res.ok) throw new Error('API request failed');
      const data = (await res.json()) as { proposal: string };
      setOutput(data.proposal);
    } catch {
      setErrorMsg('Something went wrong generating the draft. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-8 pb-20 pt-8">
      <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <Link href="/provider-dashboard" className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="font-heading text-base font-semibold">ORIVIONS</span>
          <span className="ml-1 border-l border-line pl-2.5 text-xs text-gray-soft">
            AI Proposal Generator
          </span>
          <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-bold text-warn">AI TOOLS</span>
        </Link>
        <Link href="/provider-dashboard" className="text-sm text-gray-soft hover:text-ink">
          ← Back to dashboard
        </Link>
      </div>

      <h1 className="font-heading text-2xl font-semibold">Draft a proposal in seconds.</h1>
      <p className="mt-1.5 max-w-md text-sm text-gray">
        Paste the client&apos;s brief, add context about your services, and get a first-draft
        proposal you can refine and send.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-line p-6">
          <h3 className="mb-3.5 text-sm font-semibold">1. The brief</h3>
          <Field label="What did the client ask for?">
            <textarea
              value={brief}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBrief(e.target.value)}
              placeholder="e.g. Need a smart contract audit for a lending protocol before mainnet launch. Budget around $5-8k, timeline 2 weeks."
              rows={4}
              className="textarea"
            />
          </Field>
          <Field label="Your services (used to personalize the draft)">
            <textarea
              value={services}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setServices(e.target.value)}
              placeholder="e.g. Smart contract audits ($1.5k-$8k), 48h turnaround, past clients include..."
              rows={4}
              className="textarea"
            />
          </Field>
          <Field label="Tone (optional)">
            <input
              type="text"
              value={tone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTone(e.target.value)}
              placeholder="e.g. professional but direct, no fluff"
              className="input"
            />
          </Field>
          <button
            onClick={generate}
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Generating…' : 'Generate proposal draft'}
          </button>
          {errorMsg && <p className="mt-2.5 rounded-lg bg-danger/10 p-3 text-xs text-danger">{errorMsg}</p>}
        </div>

        <div className="rounded-2xl border border-line p-6">
          <h3 className="mb-3.5 text-sm font-semibold">2. Draft</h3>
          {output ? (
            <>
              <div className="min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed">{output}</div>
              <div className="mt-4 flex items-center gap-2.5">
                <button
                  onClick={copyToClipboard}
                  className="rounded-lg border border-line px-4 py-2 text-xs font-semibold hover:border-blue-light"
                >
                  Copy to clipboard
                </button>
                {copied && <span className="text-xs font-medium text-ok">✓ Copied</span>}
              </div>
            </>
          ) : (
            <p className="py-16 text-center text-sm text-gray-soft">
              Your draft will appear here once generated.
            </p>
          )}
        </div>
      </div>

      <style jsx global>{`
        .textarea,
        .input {
          width: 100%;
          border-radius: 0.6rem;
          border: 1px solid #eaeaee;
          padding: 0.65rem 0.8rem;
          font-size: 0.85rem;
          outline: none;
          font-family: inherit;
        }
        .textarea:focus,
        .input:focus {
          border-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1.5 block text-xs font-semibold text-gray">{label}</span>
      {children}
    </label>
  );
}
