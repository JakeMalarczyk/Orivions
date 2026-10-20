'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Turnstile, { TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import ConciergeForm from '@/components/ConciergeForm';

// Shape returned by /api/smart-match, a public subset of the Company row
// (the server deliberately never exposes fields like referral_code here).
interface MatchProvider {
  id: string;
  name: string;
  category: string;
  description: string | null;
  verified: boolean;
}

interface Match {
  provider: MatchProvider;
  reason: string;
}

const EXAMPLES = [
  { label: 'Smart contract audit', text: 'I need a smart contract auditor for a lending protocol, budget $5k, need it in 2 weeks.' },
  { label: 'Marketing for NFT launch', text: 'Looking for a growth marketing agency to help launch our NFT collection to consumers.' },
  { label: 'Legal / DAO structuring', text: 'Need a legal advisor to help structure our DAO and token launch, based in the EU.' },
];

export default function SmartMatchClient() {
  // Tools such as the audit cost calculator link here with ?need= prefilled.
  const searchParams = useSearchParams();
  const [need, setNeed] = useState(() => (searchParams.get('need') ?? '').slice(0, 1000));
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);
  // Shown when matching finds nothing or fails, or when the visitor asks for a person.
  const [showConcierge, setShowConcierge] = useState(false);

  async function runMatch() {
    setErrorMsg('');
    setMatches(null);
    setShowConcierge(false);
    if (!need.trim()) {
      setErrorMsg('Tell us a bit about what you need first.');
      return;
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setErrorMsg('Checking that you are human, try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      // The server builds the prompt and fetches providers itself; the client
      // sends only the raw project description (audit finding 2.4).
      const res = await fetch('/api/smart-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need: need.trim(), captchaToken }),
      });
      if (res.status === 403) {
        setErrorMsg('We could not confirm you are human. Please try again.');
        return;
      }
      if (res.status === 429) {
        setErrorMsg('Too many requests. Give it a minute and try again.');
        return;
      }
      if (!res.ok) throw new Error('API request failed');
      const data = (await res.json()) as { matches: { provider: Match['provider']; reason: string }[] };

      if (!data.matches?.length) {
        setErrorMsg('No strong automatic match for that yet. Send us the brief below and a person will hand-pick providers for you.');
        setShowConcierge(true);
      } else {
        setMatches(data.matches);
      }
    } catch {
      setErrorMsg('Automatic matching is unavailable right now. Send us the brief below and a person will hand-pick providers for you.');
      setShowConcierge(true);
    } finally {
      setLoading(false);
      captcha.current?.reset();
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-8 pb-20 pt-14 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm text-blue-deep">
        Smart Matching
      </div>
      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        Describe what you need. <span className="text-blue-deep">We&apos;ll find your match.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-gray">
        No browsing categories. Tell us about your project in plain English and AI recommends the
        right verified providers from our directory.
      </p>

      <div className="mt-8 rounded-2xl border border-line p-2 text-left shadow-sm">
        <textarea
          value={need}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNeed(e.target.value)}
          placeholder="e.g. I need someone to audit my Solana lending protocol before mainnet launch. Budget around $5-8k, need it done in 2 weeks."
          rows={4}
          className="w-full resize-none rounded-xl border-none p-4 text-sm outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <span className="text-xs text-gray-soft">Be specific: budget, timeline, and scope help a lot.</span>
          <button
            onClick={runMatch}
            disabled={loading}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Matching…' : 'Find my match'}
          </button>
        </div>
      </div>

      <Turnstile ref={captcha} onToken={setCaptchaToken} action="smart-match" className="mt-3 flex justify-center" />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => setNeed(ex.text)}
            className="rounded-full border border-line px-3.5 py-2 text-xs text-gray hover:border-blue-light hover:text-blue-deep"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {errorMsg && <p className="mt-6 text-sm text-danger">{errorMsg}</p>}

      {matches && (
        <div className="mt-8 space-y-3.5 text-left">
          <p className="text-center text-xs text-gray-soft">
            {matches.length} match{matches.length > 1 ? 'es' : ''} for your project
          </p>
          {matches.map((m, i) => (
            <div
              key={m.provider.id}
              className={`rounded-2xl border p-5 ${i === 0 ? 'border-blue-light/50 bg-blue-light/5' : 'border-line'}`}
            >
              <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">
                {i === 0 ? 'Best match' : `#${i + 1}`}
              </span>
              <div className="mt-2 flex items-start justify-between gap-2">
                <div>
                  <div className="text-base font-semibold">{m.provider.name}</div>
                  <div className="text-xs font-semibold text-blue-deep">{m.provider.category}</div>
                </div>
                {m.provider.verified && (
                  <span className="rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-bold text-ok">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="mt-3 rounded-lg bg-bg-soft p-3 text-sm text-gray">
                <b className="text-ink">Why this match:</b> {m.reason}
              </div>
              <Link
                href={`/providers?open=${m.provider.id}`}
                className="mt-3 inline-block rounded-lg border border-line px-4 py-2 text-xs font-semibold hover:border-blue-light"
              >
                View full profile →
              </Link>
            </div>
          ))}
        </div>
      )}

      {showConcierge ? (
        <div className="mt-8">
          <ConciergeForm need={need.trim()} source="smart-match" />
        </div>
      ) : (
        <p className="mt-8 text-sm text-gray">
          Prefer a person to pick for you?{' '}
          <button onClick={() => setShowConcierge(true)} className="font-semibold text-blue-deep">
            Get a hand-picked shortlist
          </button>
        </p>
      )}

      <p className="mt-8 text-xs text-gray-soft">
        Matches are AI-generated suggestions based on provider profiles. Always review a
        provider&apos;s portfolio before hiring.
      </p>
    </div>
  );
}
