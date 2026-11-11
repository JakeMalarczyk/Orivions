'use client';

import { useMemo, useState } from 'react';
import { COUNTRY_PATHS, MAP_VIEWBOX } from '@/lib/worldMap';
import { GLOBAL_SOURCES, MARKETS, SCRAPE_RULES, type MailRule, type Market, type MarketTier } from '@/lib/scrapeMarkets';
import { Panel, StatCard, th } from './ui';

// Plan of where we collect web3 companies, by country: how relevant the market is, the hubs,
// the public sources to use and how safe cold B2B email is there. Planning data only (lib/scrapeMarkets.ts),
// no company or contact data. The mail rule is a first guide, not legal advice.

type View = 'tier' | 'mail';

const TIER_COLOR: Record<MarketTier, string> = { 1: '#1E3A8A', 2: '#5B84E8', 3: '#B9CBF5' };
const TIER_LABEL: Record<MarketTier, string> = { 1: 'Priority 1', 2: 'Priority 2', 3: 'Priority 3' };
const MAIL_COLOR: Record<MailRule, string> = { ok: '#3FA877', check: '#E8B84A', consent: '#D9645A' };
const MAIL_LABEL: Record<MailRule, string> = { ok: 'Cold email workable', check: 'Check first', consent: 'Consent likely required' };
const EMPTY = '#EEF0F4';

const BY_CODE = new Map(MARKETS.map((m) => [m.code, m]));

function badge(rule: MailRule): string {
  if (rule === 'ok') return 'bg-ok/15 text-ok';
  if (rule === 'consent') return 'bg-danger/10 text-danger';
  return 'bg-warn/20 text-ink';
}

export default function MarketsPanel() {
  const [view, setView] = useState<View>('tier');
  const [tier, setTier] = useState<MarketTier | 'all'>('all');
  const [selected, setSelected] = useState<string | null>('US');
  const [hover, setHover] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { t1: 0, t2: 0, t3: 0, ok: 0, check: 0, consent: 0 };
    for (const m of MARKETS) {
      if (m.tier === 1) c.t1++;
      else if (m.tier === 2) c.t2++;
      else c.t3++;
      c[m.mail]++;
    }
    return c;
  }, []);

  const fill = (code: string): string => {
    const m = BY_CODE.get(code);
    if (!m) return EMPTY;
    if (tier !== 'all' && m.tier !== tier) return EMPTY;
    return view === 'tier' ? TIER_COLOR[m.tier] : MAIL_COLOR[m.mail];
  };

  const shown: Market[] = MARKETS.filter((m) => tier === 'all' || m.tier === tier);
  const focus = BY_CODE.get(hover ?? selected ?? '') ?? null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Countries" value={MARKETS.length} sub="In the collection plan" />
        <StatCard label="Priority 1" value={counts.t1} sub="Start here" />
        <StatCard label="Cold email workable" value={counts.ok} sub={`${counts.check} to check, ${counts.consent} need consent`} />
        <StatCard label="Status" value="Plan" sub="Nothing collected by country yet" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 1, 2, 3] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${tier === t ? 'bg-ink text-white' : 'border border-line bg-white text-gray hover:text-ink'}`}
          >
            {t === 'all' ? 'All countries' : TIER_LABEL[t]}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-line" />
        {(['tier', 'mail'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${view === v ? 'bg-blue-deep text-white' : 'border border-line bg-white text-gray'}`}
          >
            {v === 'tier' ? 'Colour by priority' : 'Colour by email rule'}
          </button>
        ))}
      </div>

      <Panel
        title="Where we collect"
        subtitle="Click a country for the hubs, sources and email rule. Grey means not in the plan yet."
      >
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
          <div>
            <svg viewBox={MAP_VIEWBOX} className="h-auto w-full" role="img" aria-label="World map of countries in the collection plan">
              {COUNTRY_PATHS.map(([code, d]) => (
                <path
                  key={code}
                  d={d}
                  fill={fill(code)}
                  stroke="#fff"
                  strokeWidth={selected === code ? 1.6 : 0.6}
                  onMouseEnter={() => BY_CODE.has(code) && setHover(code)}
                  onMouseLeave={() => setHover((h) => (h === code ? null : h))}
                  onClick={() => BY_CODE.has(code) && setSelected(code)}
                  className={BY_CODE.has(code) ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}
                />
              ))}
            </svg>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-soft">
              {view === 'tier'
                ? ([1, 2, 3] as const).map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <i className="inline-block h-3 w-3 rounded-sm" style={{ background: TIER_COLOR[t] }} />
                      {TIER_LABEL[t]}
                    </span>
                  ))
                : (['ok', 'check', 'consent'] as const).map((r) => (
                    <span key={r} className="flex items-center gap-1.5">
                      <i className="inline-block h-3 w-3 rounded-sm" style={{ background: MAIL_COLOR[r] }} />
                      {MAIL_LABEL[r]}
                    </span>
                  ))}
            </div>
          </div>

          <div className="rounded-xl border border-line p-4 text-sm">
            {focus ? (
              <div className="space-y-3">
                <div>
                  <div className="font-heading text-lg font-semibold">{focus.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-bg-soft px-2.5 py-1 font-semibold">{TIER_LABEL[focus.tier]}</span>
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${badge(focus.mail)}`}>{MAIL_LABEL[focus.mail]}</span>
                  </div>
                </div>
                <Field label="Hubs" value={focus.hubs} />
                <Field label="Who is there" value={focus.focus} />
                <Field label="Where to look" value={focus.sources} />
                <Field label="Cold email" value={focus.mailNote} />
                <Field label="Language" value={focus.lang === 'pl+en' ? 'Polish or English' : 'English'} />
              </div>
            ) : (
              <div className="text-gray-soft">Click a country on the map.</div>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="All countries" subtitle="Priority first. The email rule is a first guide, not legal advice: confirm with a lawyer before large batches.">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
              <th className={th}>Country</th>
              <th className={th}>Priority</th>
              <th className={th}>Hubs</th>
              <th className={th}>Cold email</th>
              <th className={th}>Where to look</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr
                key={m.code}
                onClick={() => setSelected(m.code)}
                className={`cursor-pointer border-b border-line align-top last:border-0 ${selected === m.code ? 'bg-blue-light/10' : ''}`}
              >
                <td className="px-5 py-2.5 font-semibold">{m.name}</td>
                <td className="px-5 py-2.5 tabular-nums">{m.tier}</td>
                <td className="px-5 py-2.5 text-gray">{m.hubs}</td>
                <td className="px-5 py-2.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(m.mail)}`}>{MAIL_LABEL[m.mail]}</span>
                </td>
                <td className="max-w-md px-5 py-2.5 text-xs text-gray">{m.sources}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Sources for every country" subtitle="Used first, before any local register.">
          <ul className="list-disc space-y-1.5 p-5 pl-9 text-sm">
            {GLOBAL_SOURCES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Collection rules" subtitle="Apply to every country.">
          <ul className="list-disc space-y-1.5 p-5 pl-9 text-sm">
            {SCRAPE_RULES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">{label}</div>
      <div className="mt-0.5 leading-relaxed">{value}</div>
    </div>
  );
}
