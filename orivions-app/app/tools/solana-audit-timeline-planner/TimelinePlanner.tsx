'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Choice, Field } from '@/components/CalculatorControls';
import { trackEvent } from '@/lib/analytics';
import { COMPLEXITY, FRAMEWORK, type AuditInput } from '@/lib/auditEstimate';
import { formatDate, planTimeline } from '@/lib/auditTimeline';

const DEFAULTS: AuditInput = {
  lines: 1500,
  programs: 1,
  complexity: 'standard',
  framework: 'anchor',
  integrations: 'none',
  fixReview: true,
  rush: false,
};

const VERDICT = {
  comfortable: { title: 'You have room', text: 'Contact auditors by the date below and the slow case still fits before launch.', tone: 'border-ok/40 bg-ok/5' },
  tight: { title: 'Tight', text: 'Only the fast case fits. Contact auditors now and have the code frozen before the first call.', tone: 'border-warn/50 bg-warn/5' },
  late: { title: 'Not realistic as planned', text: 'Even the fast case ends after your launch date. Move the launch, cut the scope in audit, or plan a limited first release.', tone: 'border-danger/40 bg-danger/5' },
} as const;

const unit = (d: number) => (d < 7 ? `${d} days` : `${Math.round((d / 7) * 10) / 10} wk`);
const span = (d: [number, number]) => `${unit(d[0])} to ${unit(d[1])}`;

function parseDate(v: string): Date | null {
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimelinePlanner() {
  const [input, setInput] = useState<AuditInput>(DEFAULTS);
  const [launch, setLaunch] = useState('');
  const [tracked, setTracked] = useState(false);

  const plan = useMemo(() => {
    const l = parseDate(launch);
    if (!l) return null;
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    return planTimeline(input, l, today);
  }, [input, launch]);

  function set<K extends keyof AuditInput>(key: K, value: AuditInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }
  function onLaunch(v: string) {
    setLaunch(v);
    if (!tracked && v) {
      trackEvent('calculator_used', { label: 'audit-timeline' });
      setTracked(true);
    }
  }

  const verdict = plan ? VERDICT[plan.status] : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5 rounded-2xl border border-line p-6">
        <Field label="Planned mainnet launch date">
          <input
            type="date"
            value={launch}
            onChange={(e) => onLaunch(e.target.value)}
            aria-label="Planned mainnet launch date"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
          />
        </Field>
        <Field label="Lines of Rust in scope" hint="Program code only, excluding tests and generated code.">
          <input
            type="number"
            min={0}
            max={50000}
            value={input.lines}
            onChange={(e) => set('lines', Math.min(50000, Math.max(0, Number(e.target.value) || 0)))}
            aria-label="Lines of Rust in scope"
            className="w-32 rounded-lg border border-line px-3 py-2.5 text-sm tabular-nums"
          />
        </Field>
        <Field label="Number of programs">
          <input
            type="number"
            min={1}
            max={20}
            value={input.programs}
            onChange={(e) => set('programs', Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            aria-label="Number of programs"
            className="w-24 rounded-lg border border-line px-3 py-2.5 text-sm tabular-nums"
          />
        </Field>
        <Field label="What kind of protocol?">
          <div className="grid gap-2 sm:grid-cols-2">
            {COMPLEXITY.map((c) => (
              <Choice key={c.id} active={input.complexity === c.id} onClick={() => set('complexity', c.id)}>
                <span className="font-semibold">{c.label}</span>
                <span className="block text-xs text-gray-soft">{c.examples}</span>
              </Choice>
            ))}
          </div>
        </Field>
        <Field label="Framework">
          <div className="grid grid-cols-2 gap-2">
            {FRAMEWORK.map((f) => (
              <Choice key={f.id} active={input.framework === f.id} onClick={() => set('framework', f.id)}>
                <span className="font-semibold">{f.label}</span>
              </Choice>
            ))}
          </div>
        </Field>
        <Check checked={input.fixReview} onChange={(v) => set('fixReview', v)}>
          Include a fix review (auditors re-check your fixes)
        </Check>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-ink p-6 text-white" aria-live="polite">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-light">Your plan</div>
          {!plan ? (
            <p className="mt-3 text-sm text-white/75">Pick your launch date to see when you need to contact auditors.</p>
          ) : (
            <>
              <div className="mt-2 font-heading text-2xl font-semibold">Contact auditors by {formatDate(plan.contactBy[0])}</div>
              <p className="mt-1 text-sm text-white/70">
                Latest date for the fast case: {formatDate(plan.contactBy[1])}. Total {Math.round(plan.totalDays[0] / 7)} to {Math.round(plan.totalDays[1] / 7)} weeks.
              </p>
              <div className={`mt-4 rounded-xl border p-4 text-ink ${verdict!.tone} bg-white`}>
                <div className="font-semibold">{verdict!.title}</div>
                <p className="mt-1 text-sm text-gray">{verdict!.text}</p>
              </div>
              <ol className="mt-5 space-y-2 text-sm">
                {plan.phases.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 border-b border-white/10 pb-2">
                    <span>{p.label}</span>
                    <span className="whitespace-nowrap tabular-nums text-white/70">
                      {span(p.days)}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <p className="mt-5 text-xs leading-relaxed text-white/60">A planning range, not a booking. Real calendars depend on the firm.</p>
          <Link
            href="/solana-audit-quotes?ref=audit-timeline#request"
            data-cta="audit-quotes-timeline"
            className="mt-5 block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Get up to 3 audit quotes in 72 hours →
          </Link>
        </div>
      </div>
    </div>
  );
}
