'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  COMPLEXITY,
  FRAMEWORK,
  INTEGRATIONS,
  estimateAudit,
  formatUsd,
  type AuditInput,
} from '@/lib/auditEstimate';

const DEFAULTS: AuditInput = {
  lines: 1500,
  programs: 1,
  complexity: 'standard',
  framework: 'anchor',
  integrations: 'none',
  fixReview: true,
  rush: false,
};

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export default function AuditCalculator() {
  const [input, setInput] = useState<AuditInput>(DEFAULTS);
  const [tracked, setTracked] = useState(false);
  const result = useMemo(() => estimateAudit(input), [input]);

  function set<K extends keyof AuditInput>(key: K, value: AuditInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
    if (!tracked) {
      window.plausible?.('Audit Calculator Used');
      setTracked(true);
    }
  }

  const matchNeed = `Audit of ${input.programs} Solana program${input.programs > 1 ? 's' : ''} (${input.framework === 'native' ? 'native Rust' : 'Anchor'}), about ${input.lines.toLocaleString('en-US')} lines, ${COMPLEXITY.find((c) => c.id === input.complexity)?.label} complexity.`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5 rounded-2xl border border-line p-6">
        <Field label="Lines of Rust in scope" hint="Program code only, excluding tests and generated code.">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={input.lines}
              onChange={(e) => set('lines', Number(e.target.value))}
              className="w-full accent-blue-deep"
              aria-label="Lines of Rust in scope"
            />
            <input
              type="number"
              min={0}
              max={50000}
              value={input.lines}
              onChange={(e) => set('lines', Math.min(50000, Math.max(0, Number(e.target.value) || 0)))}
              className="w-24 rounded-lg border border-line px-2 py-1.5 text-right text-sm tabular-nums"
              aria-label="Lines of Rust (number)"
            />
          </div>
        </Field>

        <Field label="Number of programs">
          <input
            type="number"
            min={1}
            max={20}
            value={input.programs}
            onChange={(e) => set('programs', Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            className="w-24 rounded-lg border border-line px-2 py-1.5 text-sm tabular-nums"
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

        <Field label="External protocol integrations">
          <div className="grid gap-2 sm:grid-cols-3">
            {INTEGRATIONS.map((i) => (
              <Choice key={i.id} active={input.integrations === i.id} onClick={() => set('integrations', i.id)}>
                <span className="text-sm font-semibold">{i.label}</span>
              </Choice>
            ))}
          </div>
        </Field>

        <div className="space-y-2">
          <Check checked={input.fixReview} onChange={(v) => set('fixReview', v)}>
            Include a fix review (auditors re-check your fixes)
          </Check>
          <Check checked={input.rush} onChange={(v) => set('rush', v)}>
            Rush: the audit must start within two weeks
          </Check>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-ink p-6 text-white" aria-live="polite">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-light">Indicative estimate</div>
          <div className="mt-2 font-heading text-3xl font-semibold tabular-nums">
            {formatUsd(result.costLow)} to {formatUsd(result.costHigh)}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-white/60">Engineer-days</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{result.engineerDays}</dd>
            </div>
            <div>
              <dt className="text-white/60">Calendar time</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {result.weeks[0]} to {result.weeks[1]} weeks
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-white/60">
            A planning range, not a quote. Real quotes depend on the auditor, your code quality, tests
            and documentation. See the methodology below.
          </p>
          <Link
            href={`/smart-match?need=${encodeURIComponent(matchNeed)}`}
            className="mt-5 block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Get quotes from verified auditors →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-soft">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
        active ? 'border-blue-deep bg-blue-deep/5 ring-1 ring-blue-deep' : 'border-line hover:border-gray-soft'
      }`}
    >
      {children}
    </button>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-blue-deep" />
      {children}
    </label>
  );
}
