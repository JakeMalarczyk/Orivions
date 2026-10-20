'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Choice, Field } from '@/components/CalculatorControls';
import { formatUsd } from '@/lib/auditEstimate';
import {
  BACKEND,
  EXTRAS,
  FRONTEND,
  INTEGRATIONS,
  PROGRAM_TYPES,
  TEAMS,
  estimateDapp,
  type DappInput,
  type ExtraId,
} from '@/lib/dappEstimate';

const DEFAULTS: DappInput = {
  programType: 'standard',
  programs: 1,
  integrations: 'none',
  frontend: 'production',
  backend: 'none',
  extras: [],
  team: 'agency',
};

function shareOnX(text: string, path: string): string {
  const url = `https://orivions.com${path}?ref=x-share`;
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export default function DappCalculator() {
  const [input, setInput] = useState<DappInput>(DEFAULTS);
  const [tracked, setTracked] = useState(false);
  const result = useMemo(() => estimateDapp(input), [input]);
  const hasProgram = input.programType !== 'none';

  function set<K extends keyof DappInput>(key: K, value: DappInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
    if (!tracked) {
      window.plausible?.('Dapp Calculator Used');
      setTracked(true);
    }
  }

  function toggleExtra(id: ExtraId, on: boolean) {
    set('extras', on ? [...input.extras, id] : input.extras.filter((e) => e !== id));
  }

  const program = PROGRAM_TYPES.find((p) => p.id === input.programType);
  const frontend = FRONTEND.find((f) => f.id === input.frontend);
  const matchNeed = [
    'Looking for a Solana development team to build',
    hasProgram ? `${input.programs} ${program?.label} program${input.programs > 1 ? 's' : ''} (${program?.examples})` : 'a dApp on existing protocols',
    frontend && frontend.id !== 'none' ? `with a ${frontend.label.toLowerCase()} frontend` : '',
    input.extras.length ? `plus ${input.extras.map((e) => EXTRAS[e].label.toLowerCase()).join(', ')}` : '',
    `. Budget around ${formatUsd(result.costLow)} to ${formatUsd(result.costHigh)}.`,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(' .', '.');

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5 rounded-2xl border border-line p-6">
        <Field label="On-chain programs">
          <div className="grid gap-2 sm:grid-cols-2">
            {PROGRAM_TYPES.map((p) => (
              <Choice key={p.id} active={input.programType === p.id} onClick={() => set('programType', p.id)}>
                <span className="font-semibold">{p.label}</span>
                <span className="block text-xs text-gray-soft">{p.examples}</span>
              </Choice>
            ))}
          </div>
        </Field>

        {hasProgram && (
          <>
            <Field label="Number of programs">
              <input
                type="number"
                min={1}
                max={10}
                value={input.programs}
                onChange={(e) => set('programs', Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-line px-2 py-1.5 text-sm tabular-nums"
              />
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
          </>
        )}

        <Field label="Frontend">
          <div className="grid gap-2 sm:grid-cols-2">
            {FRONTEND.map((f) => (
              <Choice key={f.id} active={input.frontend === f.id} onClick={() => set('frontend', f.id)}>
                <span className="font-semibold">{f.label}</span>
                <span className="block text-xs text-gray-soft">{f.examples}</span>
              </Choice>
            ))}
          </div>
        </Field>

        <Field label="Backend and indexing">
          <div className="grid gap-2 sm:grid-cols-3">
            {BACKEND.map((b) => (
              <Choice key={b.id} active={input.backend === b.id} onClick={() => set('backend', b.id)}>
                <span className="font-semibold">{b.label}</span>
                <span className="block text-xs text-gray-soft">{b.examples}</span>
              </Choice>
            ))}
          </div>
        </Field>

        <Field label="Extras">
          <div className="space-y-2">
            {(Object.keys(EXTRAS) as ExtraId[]).map((id) => (
              <Check key={id} checked={input.extras.includes(id)} onChange={(v) => toggleExtra(id, v)}>
                {EXTRAS[id].label}
              </Check>
            ))}
          </div>
        </Field>

        <Field label="Who builds it?">
          <div className="grid grid-cols-2 gap-2">
            {TEAMS.map((t) => (
              <Choice key={t.id} active={input.team === t.id} onClick={() => set('team', t.id)}>
                <span className="font-semibold">{t.label}</span>
                <span className="block text-xs text-gray-soft">
                  {formatUsd(t.rateLow)} to {formatUsd(t.rateHigh)} per day
                </span>
              </Choice>
            ))}
          </div>
        </Field>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-ink p-6 text-white" aria-live="polite">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-light">Indicative build cost</div>
          <div className="mt-2 font-heading text-3xl font-semibold tabular-nums">
            {formatUsd(result.costLow)} to {formatUsd(result.costHigh)}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-white/60">Developer-days</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{result.devDays}</dd>
            </div>
            <div>
              <dt className="text-white/60">Calendar time</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {result.weeks[0]} to {result.weeks[1]} weeks
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-white/60">Maintenance after launch</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {formatUsd(result.maintenance[0])} to {formatUsd(result.maintenance[1])} per year
              </dd>
            </div>
          </dl>
          {result.needsAudit && (
            <p className="mt-5 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white/80">
              Not included: an independent audit, which any program holding user funds needs.{' '}
              <Link href="/tools/solana-audit-cost-calculator" className="font-semibold text-blue-light">
                Estimate the audit →
              </Link>
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-white/60">
            A planning range, not a quote. A short paid discovery phase turns it into a reliable one.
          </p>
          <Link
            href={`/smart-match?need=${encodeURIComponent(matchNeed)}`}
            className="mt-5 block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Get quotes from verified teams →
          </Link>
          <a
            href={shareOnX(
              `Building on Solana? My dApp estimate: ${formatUsd(result.costLow)} to ${formatUsd(result.costHigh)}, ${result.weeks[0]} to ${result.weeks[1]} weeks. Free calculator by @Orivions:`,
              '/tools/solana-dapp-cost-calculator',
            )}
            target="_blank"
            rel="noopener"
            onClick={() => window.plausible?.('Calculator Shared', { props: { tool: 'dapp' } })}
            className="mt-3 block text-center text-xs font-semibold text-white/70 hover:text-white"
          >
            Share this estimate on X ↗
          </a>
        </div>
      </div>
    </div>
  );
}
