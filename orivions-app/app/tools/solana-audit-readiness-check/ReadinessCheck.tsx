'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { READINESS_GROUPS, READINESS_ITEMS } from '@/lib/auditReadiness';

type Answer = 'yes' | 'partly' | 'no';

const OPTIONS: { id: Answer; label: string }[] = [
  { id: 'yes', label: 'Done' },
  { id: 'partly', label: 'Partly' },
  { id: 'no', label: 'Not yet' },
];

const POINTS: Record<Answer, number> = { yes: 1, partly: 0.5, no: 0 };

const BANDS = [
  { min: 85, title: 'Ready to book', text: 'You can ask auditors for quotes now. Send every firm the same brief so the numbers compare.' },
  { min: 60, title: 'Almost ready', text: 'Ask for quotes now and close the open items before the start date. Auditors will price the gaps in.' },
  { min: 0, title: 'Not ready yet', text: 'Fix the items below first. Booking now means paying auditors to wait for code, docs or tests.' },
];

const strip = (t: string) => t.replace(/\.$/, '');

export default function ReadinessCheck() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [tracked, setTracked] = useState(false);

  const answered = Object.keys(answers).length;
  const total = READINESS_ITEMS.length;
  const done = answered === total;
  const score = Math.round((READINESS_ITEMS.reduce((n, i) => n + (answers[i.title] ? POINTS[answers[i.title]!] : 0), 0) / total) * 100);
  const band = BANDS.find((b) => score >= b.min)!;
  const gaps = READINESS_ITEMS.filter((i) => answers[i.title] && answers[i.title] !== 'yes');

  function answer(title: string, value: Answer) {
    const next = { ...answers, [title]: value };
    setAnswers(next);
    if (!tracked && Object.keys(next).length === total) {
      trackEvent('calculator_used', { label: 'audit-readiness' });
      setTracked(true);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {READINESS_GROUPS.map((g) => (
          <fieldset key={g.title}>
            <legend className="font-heading text-lg font-semibold">{g.title}</legend>
            <div className="mt-3 space-y-3">
              {g.items.map(([title, why]) => (
                <div key={title} className="rounded-2xl border border-line p-4">
                  <div className="font-semibold">{strip(title)}</div>
                  <p className="mt-1 text-sm text-gray">{why}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={strip(title)}>
                    {OPTIONS.map((o) => {
                      const active = answers[title] === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => answer(title, o.id)}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition sm:py-2 ${
                            active ? 'border-blue-deep bg-blue-deep text-white' : 'border-line text-ink hover:border-blue-light'
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-ink p-6 text-white" aria-live="polite">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-light">Your readiness</div>
          {answered === 0 ? (
            <p className="mt-3 text-sm text-white/75">Answer the twelve items to see your score and what to fix before the audit.</p>
          ) : (
            <>
              <div className="mt-2 font-heading text-4xl font-semibold tabular-nums">{score}%</div>
              <p className="mt-1 text-sm text-white/70">
                {done ? 'All twelve items answered.' : `${answered} of ${total} answered.`}
              </p>
              {done && (
                <div className="mt-4 rounded-xl bg-white p-4 text-ink">
                  <div className="font-semibold">{band.title}</div>
                  <p className="mt-1 text-sm text-gray">{band.text}</p>
                </div>
              )}
              {gaps.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-bold uppercase tracking-wide text-white/60">Fix before the start date</div>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {gaps.map((g) => (
                      <li key={g.title} className="flex gap-2">
                        <span className={answers[g.title] === 'no' ? 'text-danger' : 'text-warn'}>●</span>
                        <span>{strip(g.title)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          <Link
            href="/solana-audit-quotes?ref=audit-readiness#request"
            data-cta="audit-quotes-readiness"
            className="mt-6 block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Get up to 3 audit quotes in 72 hours →
          </Link>
          <p className="mt-3 text-center text-xs text-white/60">Free for teams. Nothing you enter here leaves your browser.</p>
        </div>
      </div>
    </div>
  );
}
