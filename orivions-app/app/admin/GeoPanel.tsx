'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { COUNTRY_PATHS, MAP_VIEWBOX } from '@/lib/worldMap';
import { Empty, Panel, StatCard, th } from './ui';

// World map of where visitors, clickers, new accounts and requests come from.
// Data: admin_geo() in supabase/migrations/13_admin_geo.sql. The country is the
// visitor's IP country as reported by Vercel; no IP address is stored.

interface Row {
  country: string;
  viewers: number;
  views: number;
  clickers: number;
  clients: number;
  providers: number;
  requests: number;
}
interface Data {
  days: number;
  rows: Row[];
  events_since: string | null;
}

type Metric = 'viewers' | 'clickers' | 'clients' | 'providers' | 'requests';

const METRICS: { id: Metric; label: string; hint: string }[] = [
  { id: 'viewers', label: 'Viewers', hint: 'People who viewed a page (unique per day).' },
  { id: 'clickers', label: 'Clickers', hint: 'People who clicked a tracked call to action.' },
  { id: 'clients', label: 'Clients', hint: 'Client accounts created.' },
  { id: 'providers', label: 'Providers', hint: 'Provider accounts created.' },
  { id: 'requests', label: 'Requests', hint: 'Shortlist requests, waitlist, Smart Match runs and messages to providers.' },
];

const names = typeof Intl !== 'undefined' && 'DisplayNames' in Intl ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
const nameOf = (code: string) => (code === '??' ? 'Unknown' : (names?.of(code) ?? code));

export default function GeoPanel() {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState<Metric>('viewers');
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [hover, setHover] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: res } = await supabase.rpc('admin_geo', { p_days: days });
    setData((res as Data | null) ?? null);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const byCode = useMemo(() => new Map((data?.rows ?? []).map((r) => [r.country, r])), [data]);
  const max = Math.max(1, ...(data?.rows ?? []).filter((r) => r.country !== '??').map((r) => r[metric]));

  if (data === undefined) return <Empty>Loading…</Empty>;
  if (data === null) {
    return (
      <Panel title="World map" subtitle="Where people come from.">
        <Empty>Not available yet. Apply supabase/migrations/13_admin_geo.sql in the Supabase SQL editor.</Empty>
      </Panel>
    );
  }

  const total = (m: Metric) => data.rows.reduce((n, r) => n + r[m], 0);
  const countriesWith = (m: Metric) => data.rows.filter((r) => r[m] > 0 && r.country !== '??').length;
  const shade = (v: number) => {
    if (!v) return '#EEF0F4';
    const t = Math.sqrt(v / max);
    return `rgb(${Math.round(214 - t * 150)}, ${Math.round(228 - t * 120)}, ${Math.round(252 - t * 40)})`;
  };
  const active = METRICS.find((m) => m.id === metric)!;
  const hovered = hover ? byCode.get(hover) : null;
  const table = [...data.rows].sort((a, b) => b[metric] - a[metric] || b.viewers - a.viewers);
  const since = data.events_since ? new Date(data.events_since).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold ${days === d ? 'bg-ink text-white' : 'border border-line bg-white text-gray'}`}
          >
            {d === 365 ? '1 year' : `${d} days`}
          </button>
        ))}
        <span className="ml-2 text-xs text-gray-soft">
          Country comes from the visitor&apos;s IP; the IP itself is never stored.
          {since ? ` Accounts, clicks and requests are located from ${since}; page views from the first day of tracking.` : ''}
        </span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {METRICS.map((m) => (
          <button key={m.id} onClick={() => setMetric(m.id)} className="text-left">
            <div className={`rounded-2xl ring-2 ${metric === m.id ? 'ring-blue-deep' : 'ring-transparent'}`}>
              <StatCard label={m.label} value={total(m.id)} sub={`${countriesWith(m.id)} countries`} />
            </div>
          </button>
        ))}
      </div>

      <Panel title={`Map: ${active.label.toLowerCase()}`} subtitle={`${active.hint} Darker means more. Hover a country for the details.`}>
        <div className="relative p-4">
          <svg viewBox={MAP_VIEWBOX} className="h-auto w-full" role="img" aria-label={`World map of ${active.label.toLowerCase()} by country`}>
            {COUNTRY_PATHS.map(([code, d]) => (
              <path
                key={code}
                d={d}
                fill={shade(byCode.get(code)?.[metric] ?? 0)}
                stroke="#fff"
                strokeWidth={0.6}
                onMouseEnter={() => setHover(code)}
                onMouseLeave={() => setHover((h) => (h === code ? null : h))}
                className="transition-colors hover:brightness-90"
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute left-6 top-6 min-w-[170px] rounded-xl bg-ink px-3.5 py-2.5 text-xs text-white shadow-lg">
            {hover ? (
              <>
                <div className="font-semibold">{nameOf(hover)}</div>
                <div className="mt-1 space-y-0.5 text-white/80">
                  <div>Viewers: {hovered?.viewers ?? 0}</div>
                  <div>Clickers: {hovered?.clickers ?? 0}</div>
                  <div>Clients: {hovered?.clients ?? 0}</div>
                  <div>Providers: {hovered?.providers ?? 0}</div>
                  <div>Requests: {hovered?.requests ?? 0}</div>
                </div>
              </>
            ) : (
              <div className="text-white/80">Hover a country</div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-soft">
            <span>0</span>
            <div className="h-2 w-40 rounded-full" style={{ background: `linear-gradient(to right, ${shade(1)}, ${shade(max)})` }} />
            <span>{max}</span>
          </div>
        </div>
      </Panel>

      <Panel title="By country" subtitle={`Sorted by ${active.label.toLowerCase()}. Pick a metric above to change the sort.`}>
        {!table.length ? (
          <Empty>No data in this period yet.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className={th}>Country</th>
                <th className={th}>Viewers</th>
                <th className={th}>Views</th>
                <th className={th}>Clickers</th>
                <th className={th}>Clients</th>
                <th className={th}>Providers</th>
                <th className={th}>Requests</th>
              </tr>
            </thead>
            <tbody>
              {table.slice(0, 40).map((r) => (
                <tr key={r.country} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5 font-semibold">{nameOf(r.country)}</td>
                  <td className="px-5 py-2.5 tabular-nums">{r.viewers}</td>
                  <td className="px-5 py-2.5 tabular-nums text-gray">{r.views}</td>
                  <td className="px-5 py-2.5 tabular-nums">{r.clickers}</td>
                  <td className="px-5 py-2.5 tabular-nums">{r.clients}</td>
                  <td className="px-5 py-2.5 tabular-nums">{r.providers}</td>
                  <td className="px-5 py-2.5 tabular-nums">{r.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
