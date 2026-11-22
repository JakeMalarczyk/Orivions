'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { TELEGRAM_HANDLE, TELEGRAM_URL } from '@/lib/contact';
import type { ProgramCheck as Result } from '@/lib/solanaProgram';

const VERDICT = {
  'single-key': {
    title: 'A single key can replace this program',
    tone: 'border-danger/40 bg-danger/5',
    text: 'The upgrade authority is an ordinary wallet address. Whoever holds that key can push new code to this program at any time, with no delay and no second signer. If the key leaks, the program can be replaced.',
    ask: [
      'Move the authority to a multisig with signers on different devices.',
      'Add a timelock so users see a change before it runs.',
      'Rehearse one full upgrade through the new setup on devnet.',
    ],
  },
  'program-controlled': {
    title: 'The authority is controlled by another program',
    tone: 'border-blue-light/50 bg-blue-light/5',
    text: 'The authority is a program derived address, not a wallet. This is how multisig vaults and governance programs hold authority. This check cannot tell which one it is, or how many signers it needs, so ask the team.',
    ask: [
      'Which multisig or governance program holds it, and how many signers does it need?',
      'Is there a timelock, and how long is the delay?',
      'Who are the signers, and are they on separate devices?',
    ],
  },
  immutable: {
    title: 'The program cannot be upgraded',
    tone: 'border-ok/40 bg-ok/5',
    text: 'There is no upgrade authority, so the code is fixed. Nobody can replace it, and nobody can fix a bug in it either. That is safe only if the code was reviewed before it was frozen.',
    ask: [
      'Was the final code audited before the authority was removed?',
      'Is there a published verifiable build that matches the deployed code?',
      'What is the plan if a bug is found?',
    ],
  },
} as const;

export default function ProgramCheck() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!address.trim()) return setError('Paste a program address first.');
    setLoading(true);
    try {
      const res = await fetch('/api/program-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
      } else {
        setResult(data);
        trackEvent('calculator_used', { label: `program-check:${data.authorityKind ?? data.status}` });
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const verdict = result?.status === 'ok' || result?.status === 'not-upgradeable' ? VERDICT[result.authorityKind ?? 'immutable'] : null;

  return (
    <div>
      <form onSubmit={submit} className="rounded-xl border border-line bg-white p-2 shadow-[0_20px_50px_-24px_rgb(var(--c-blue-deep)/0.35)]">
        <label htmlFor="program-address" className="sr-only">Solana program address</label>
        <textarea
          id="program-address"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Paste a Solana program address, for example the program ID from your Anchor.toml"
          autoComplete="off"
          spellCheck={false}
          className="block w-full resize-none break-all rounded-xl border-none p-4 font-mono text-sm leading-snug outline-none"
        />
        <div className="flex flex-col gap-3 px-3 pb-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-soft">Reads public mainnet data only. Nothing is stored.</span>
          <button type="submit" disabled={loading} className="whitespace-nowrap rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:py-2.5">
            {loading ? 'Checking…' : 'Check program'}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {result && !verdict && result.message && (
        <p className="mt-6 rounded-2xl border border-line p-5 text-sm text-gray">{result.message}</p>
      )}

      {result && verdict && (
        <div className="mt-6 space-y-4">
          <div className={`rounded-2xl border p-6 ${verdict.tone}`}>
            <h2 className="font-heading text-xl font-semibold">{verdict.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{verdict.text}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="font-semibold">Program</dt>
              <dd className="break-all font-mono text-xs">{result.address}</dd>
              {result.authority && (
                <>
                  <dt className="font-semibold">Upgrade authority</dt>
                  <dd className="break-all font-mono text-xs">{result.authority}</dd>
                </>
              )}
              {result.lastDeployTime && (
                <>
                  <dt className="font-semibold">Last deployed</dt>
                  <dd>{result.lastDeployTime}</dd>
                </>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-line p-6">
            <h3 className="font-semibold">What to ask or do</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
              {verdict.ask.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-ink p-6 text-white">
            <h3 className="font-heading text-lg font-semibold">Want a second pair of eyes on this?</h3>
            <p className="mt-2 text-sm text-white/75">
              Describe your project and we suggest up to three providers we checked by hand for an audit, a review of the upgrade
              setup or the launch. Free for teams.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/smart-match?ref=program-check" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink">
                Get a shortlist →
              </Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                Ask on Telegram {TELEGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
