'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { COUNTRY_PATHS, MAP_VIEWBOX } from '@/lib/worldMap';
import { GLOBAL_SOURCES, MARKETS, SCRAPE_RULES, type MailRule, type Market, type MarketTier } from '@/lib/scrapeMarkets';
import { Empty, Panel, StatCard, input, th } from './ui';

// Interactive plan of where we collect web3 companies. The map is coloured by how many companies
// the CRM holds per country (crm_companies.country), by priority or by the cold-email rule.
// Zoom with the wheel or the buttons, drag to pan, click a country for its companies, the plan
// (lib/scrapeMarkets.ts) and the email rule. The email rule is a first guide, not legal advice.

type Colour = 'companies' | 'tier' | 'mail';
type SideFilter = 'all' | 'client' | 'provider';

interface Row {
  id: number;
  name: string;
  side: 'provider' | 'client' | 'supply' | 'ecosystem';
  category: string | null;
  country: string | null;
  stage: string;
}

const W = 960;
const H = 500;
const TIER_COLOR: Record<MarketTier, string> = { 1: '#1E3A8A', 2: '#5B84E8', 3: '#B9CBF5' };
const TIER_LABEL: Record<MarketTier, string> = { 1: 'Priority 1', 2: 'Priority 2', 3: 'Priority 3' };
const MAIL_COLOR: Record<MailRule, string> = { ok: '#3FA877', check: '#E8B84A', consent: '#D9645A' };
const MAIL_LABEL: Record<MailRule, string> = { ok: 'Cold email workable', check: 'Check first', consent: 'Consent likely required' };
const EMPTY = '#EEF0F4';
const STAGE_ORDER = ['new', 'contacted', 'replied', 'meeting', 'verification', 'active', 'declined'];
const STAGE_LABEL: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  replied: 'Replied',
  meeting: 'Meeting',
  verification: 'Verification',
  active: 'Active',
  declined: 'Declined',
};

const PLAN = new Map(MARKETS.map((m) => [m.code, m]));
const MAP_CODES = new Set(COUNTRY_PATHS.map(([c]) => c));

// Older rows hold Polish country names; new rows hold ISO codes.
const LEGACY: Record<string, string> = {
  polska: 'PL',
  usa: 'US',
  'zagranica (usa)': 'US',
  'wielka brytania': 'GB',
  zea: 'AE',
  szwajcaria: 'CH',
  niemcy: 'DE',
  kanada: 'CA',
  'hong kong': 'HK',
  francja: 'FR',
  australia: 'AU',
  'zagranica (indie)': 'IN',
  serbia: 'RS',
  chorwacja: 'HR',
  'bułgaria': 'BG',
};

function toCode(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  return LEGACY[t.toLowerCase()] ?? null;
}

const names = typeof Intl !== 'undefined' && 'DisplayNames' in Intl ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
const nameOf = (code: string) => PLAN.get(code)?.name ?? (names?.of(code) ?? code);

function badge(rule: MailRule): string {
  if (rule === 'ok') return 'bg-ok/15 text-ok';
  if (rule === 'consent') return 'bg-danger/10 text-danger';
  return 'bg-warn/20 text-ink';
}

interface Stat {
  total: number;
  client: number;
  provider: number;
  contacted: number;
  replied: number;
  active: number;
}

export default function MarketsPanel() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [colour, setColour] = useState<Colour>('companies');
  const [side, setSide] = useState<SideFilter>('all');
  const [tier, setTier] = useState<MarketTier | 'all'>('all');
  const [selected, setSelected] = useState<string | null>('US');
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; w: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, w: W, h: H });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: 'name' | 'tier' | 'total' | 'client' | 'provider' | 'contacted' | 'replied'; dir: 1 | -1 }>({ key: 'total', dir: -1 });
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('crm_companies').select('id, name, side, category, country, stage').limit(5000);
    if (err) setError(err.message);
    setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const scoped = useMemo(() => (rows ?? []).filter((r) => (side === 'all' ? r.side === 'client' || r.side === 'provider' : r.side === side)), [rows, side]);

  const byCountry = useMemo(() => {
    const m = new Map<string, Stat>();
    for (const r of scoped) {
      const c = toCode(r.country);
      if (!c) continue;
      const s = m.get(c) ?? { total: 0, client: 0, provider: 0, contacted: 0, replied: 0, active: 0 };
      s.total++;
      if (r.side === 'client') s.client++;
      if (r.side === 'provider') s.provider++;
      if (r.stage !== 'new') s.contacted++;
      if (['replied', 'meeting', 'verification', 'active'].includes(r.stage)) s.replied++;
      if (r.stage === 'active') s.active++;
      m.set(c, s);
    }
    return m;
  }, [scoped]);

  const located = useMemo(() => [...byCountry.values()].reduce((n, s) => n + s.total, 0), [byCountry]);
  const max = useMemo(() => Math.max(1, ...[...byCountry.values()].map((s) => s.total)), [byCountry]);
  const gaps = useMemo(() => MARKETS.filter((m) => m.tier <= 2 && (byCountry.get(m.code)?.total ?? 0) < 5).length, [byCountry]);

  const fill = (code: string): string => {
    const plan = PLAN.get(code);
    if (tier !== 'all' && plan?.tier !== tier) return EMPTY;
    if (colour === 'companies') {
      const n = byCountry.get(code)?.total ?? 0;
      if (!n) return plan ? '#DCE3F4' : EMPTY;
      const t = Math.sqrt(n / max);
      return `rgb(${Math.round(200 - t * 170)}, ${Math.round(216 - t * 160)}, ${Math.round(250 - t * 90)})`;
    }
    if (!plan) return EMPTY;
    return colour === 'tier' ? TIER_COLOR[plan.tier] : MAIL_COLOR[plan.mail];
  };

  // Zoom keeps the point under the cursor fixed.
  const zoomAt = useCallback((factor: number, fx = 0.5, fy = 0.5) => {
    setView((v) => {
      const w = Math.min(W, Math.max(W / 12, v.w * factor));
      const h = (w / W) * H;
      const x = Math.min(W - w, Math.max(0, v.x + (v.w - w) * fx));
      const y = Math.min(H - h, Math.max(0, v.y + (v.h - h) * fy));
      return { x, y, w, h };
    });
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY > 0 ? 1.18 : 1 / 1.18, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  function focusCountry(code: string) {
    setSelected(code);
    const el = wrap.current?.querySelector<SVGPathElement>(`[data-c="${code}"]`);
    if (!el) return;
    const b = el.getBBox();
    const w = Math.min(W, Math.max(W / 8, b.width * 3.2));
    const h = (w / W) * H;
    setView({
      x: Math.min(W - w, Math.max(0, b.x + b.width / 2 - w / 2)),
      y: Math.min(H - h, Math.max(0, b.y + b.height / 2 - h / 2)),
      w,
      h,
    });
  }

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [...MAP_CODES]
      .map((c) => ({ code: c, name: nameOf(c) }))
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
      .slice(0, 6);
  }, [query]);

  const focus = hover ?? selected;
  const focusPlan: Market | undefined = focus ? PLAN.get(focus) : undefined;
  const focusStat = focus ? byCountry.get(focus) : undefined;
  const list = useMemo(
    () => (selected ? scoped.filter((r) => toCode(r.country) === selected).sort((a, b) => STAGE_ORDER.indexOf(b.stage) - STAGE_ORDER.indexOf(a.stage) || a.name.localeCompare(b.name)) : []),
    [scoped, selected],
  );
  const selPlan = selected ? PLAN.get(selected) : undefined;
  const selStat = selected ? byCountry.get(selected) : undefined;
  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of list) c[r.stage] = (c[r.stage] ?? 0) + 1;
    return c;
  }, [list]);

  const table = useMemo(() => {
    const codes = new Set<string>([...MARKETS.map((m) => m.code), ...byCountry.keys()]);
    const out = [...codes]
      .filter((c) => tier === 'all' || PLAN.get(c)?.tier === tier)
      .map((c) => ({ code: c, name: nameOf(c), tier: PLAN.get(c)?.tier ?? 4, stat: byCountry.get(c) ?? { total: 0, client: 0, provider: 0, contacted: 0, replied: 0, active: 0 } }));
    const val = (r: (typeof out)[number]) => (sort.key === 'name' ? r.name : sort.key === 'tier' ? r.tier : r.stat[sort.key]);
    return out.sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const d = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
      return d * sort.dir || a.name.localeCompare(b.name);
    });
  }, [byCountry, tier, sort]);

  function sortBy(key: typeof sort.key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'name' || key === 'tier' ? 1 : -1 }));
  }
  const arrow = (key: string) => (sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '');

  const zoomed = view.w < W - 1;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Companies with a country" value={rows ? located : '…'} sub={rows ? `of ${scoped.length} in the CRM` : undefined} />
        <StatCard label="Countries with companies" value={byCountry.size} sub={`${MARKETS.length} in the plan`} />
        <StatCard label="Plan gaps" value={gaps} highlight={gaps > 0} sub="Priority 1-2 countries with under 5 companies" />
        <StatCard label="Cold email workable" value={MARKETS.filter((m) => m.mail === 'ok').length} sub={`${MARKETS.filter((m) => m.mail === 'consent').length} need consent`} />
      </div>

      {error && <div className="rounded-lg border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <Seg value={side} onChange={setSide} options={[['all', 'All companies'], ['client', 'Clients'], ['provider', 'Providers']]} />
        <span className="mx-1 h-5 w-px bg-line" />
        <Seg value={String(tier)} onChange={(v) => setTier(v === 'all' ? 'all' : (Number(v) as MarketTier))} options={[['all', 'All priorities'], ['1', 'P1'], ['2', 'P2'], ['3', 'P3']]} />
        <span className="mx-1 h-5 w-px bg-line" />
        <Seg value={colour} onChange={setColour} options={[['companies', 'Colour: companies'], ['tier', 'Colour: priority'], ['mail', 'Colour: email rule']]} dark />
        <div className="relative ml-auto">
          <input className={`${input} w-52`} placeholder="Find a country" value={query} onChange={(e) => setQuery(e.target.value)} />
          {suggestions.length > 0 && (
            <ul className="absolute right-0 z-10 mt-1 w-52 overflow-hidden rounded-lg border border-line bg-white text-sm shadow-lg">
              {suggestions.map((s) => (
                <li key={s.code}>
                  <button
                    className="block w-full px-3 py-2 text-left hover:bg-bg-soft"
                    onClick={() => {
                      focusCountry(s.code);
                      setQuery('');
                    }}
                  >
                    {s.name} <span className="text-xs text-gray-soft">{s.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Panel title="Where we collect" subtitle="Scroll to zoom, drag to move, click a country. Countries in the plan with no companies yet are pale blue.">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_340px]">
          <div>
            <div ref={wrap} className="relative overflow-hidden rounded-xl bg-bg-soft/60" style={{ cursor: zoomed ? 'grab' : 'default' }}>
              <svg
                viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
                className="block h-auto w-full select-none"
                role="img"
                aria-label="World map of the collection plan"
                onPointerDown={(e) => {
                  drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
                }}
                onPointerMove={(e) => {
                  const r = wrap.current?.getBoundingClientRect();
                  if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width });
                  const d = drag.current;
                  if (!d || !r) return;
                  const dx = e.clientX - d.x;
                  const dy = e.clientY - d.y;
                  if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
                  if (d.moved && zoomed) {
                    setView((v) => ({
                      ...v,
                      x: Math.min(W - v.w, Math.max(0, d.vx - (dx / r.width) * v.w)),
                      y: Math.min(H - v.h, Math.max(0, d.vy - (dy / r.height) * v.h)),
                    }));
                  }
                }}
                onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
                onPointerLeave={() => {
                  drag.current = null;
                  setHover(null);
                  setTip(null);
                }}
              >
                {COUNTRY_PATHS.map(([code, d]) => (
                  <path
                    key={code}
                    data-c={code}
                    d={d}
                    fill={fill(code)}
                    stroke={selected === code ? '#0B1B4D' : '#fff'}
                    strokeWidth={(selected === code ? 1.8 : 0.6) * (view.w / W)}
                    vectorEffect="non-scaling-stroke"
                    onPointerEnter={() => setHover(code)}
                    onPointerLeave={() => setHover((h) => (h === code ? null : h))}
                    onClick={() => {
                      if (!drag.current?.moved) setSelected(code);
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-75"
                  />
                ))}
              </svg>

              <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-line bg-white text-sm shadow">
                <button className="px-3 py-1.5 hover:bg-bg-soft" onClick={() => zoomAt(1 / 1.5)} aria-label="Zoom in">+</button>
                <button className="border-t border-line px-3 py-1.5 hover:bg-bg-soft" onClick={() => zoomAt(1.5)} aria-label="Zoom out">-</button>
                <button className="border-t border-line px-3 py-1.5 text-xs hover:bg-bg-soft" onClick={() => setView({ x: 0, y: 0, w: W, h: H })}>Reset</button>
              </div>

              {hover && tip && (
                <div
                  className="pointer-events-none absolute z-10 min-w-[150px] rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg"
                  style={{ left: tip.x + 14 > tip.w - 170 ? tip.x - 164 : tip.x + 14, top: tip.y + 14 }}
                >
                  <div className="font-semibold">{nameOf(hover)}</div>
                  <div className="mt-0.5 text-white/80">
                    {focusStat ? `${focusStat.total} companies (${focusStat.client} clients, ${focusStat.provider} providers)` : 'No companies yet'}
                  </div>
                  {focusPlan ? <div className="text-white/70">{TIER_LABEL[focusPlan.tier]} · {MAIL_LABEL[focusPlan.mail]}</div> : <div className="text-white/50">Not in the plan</div>}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-soft">
              {colour === 'companies' && (
                <span className="flex items-center gap-2">
                  0
                  <i className="inline-block h-2 w-32 rounded-full" style={{ background: 'linear-gradient(to right, rgb(200,216,250), rgb(30,56,160))' }} />
                  {max}
                  <i className="ml-3 inline-block h-3 w-3 rounded-sm" style={{ background: '#DCE3F4' }} /> in plan, none yet
                </span>
              )}
              {colour === 'tier' &&
                ([1, 2, 3] as const).map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <i className="inline-block h-3 w-3 rounded-sm" style={{ background: TIER_COLOR[t] }} />
                    {TIER_LABEL[t]}
                  </span>
                ))}
              {colour === 'mail' &&
                (['ok', 'check', 'consent'] as const).map((r) => (
                  <span key={r} className="flex items-center gap-1.5">
                    <i className="inline-block h-3 w-3 rounded-sm" style={{ background: MAIL_COLOR[r] }} />
                    {MAIL_LABEL[r]}
                  </span>
                ))}
            </div>
          </div>

          <div className="rounded-xl border border-line p-4 text-sm">
            {selected ? (
              <div className="space-y-3">
                <div>
                  <div className="font-heading text-lg font-semibold">{nameOf(selected)}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    {selPlan ? (
                      <>
                        <span className="rounded-full bg-bg-soft px-2.5 py-1 font-semibold">{TIER_LABEL[selPlan.tier]}</span>
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${badge(selPlan.mail)}`}>{MAIL_LABEL[selPlan.mail]}</span>
                      </>
                    ) : (
                      <span className="rounded-full bg-bg-soft px-2.5 py-1 font-semibold">Not in the plan</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <Mini label="Companies" value={selStat?.total ?? 0} />
                  <Mini label="Contacted" value={selStat?.contacted ?? 0} />
                  <Mini label="Replied+" value={selStat?.replied ?? 0} />
                </div>
                {list.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {STAGE_ORDER.filter((s) => stageCounts[s]).map((s) => (
                      <span key={s} className="rounded-full bg-bg-soft px-2 py-0.5">
                        {STAGE_LABEL[s]} {stageCounts[s]}
                      </span>
                    ))}
                  </div>
                )}

                {selPlan && (
                  <>
                    <Field label="Hubs" value={selPlan.hubs} />
                    <Field label="Who is there" value={selPlan.focus} />
                    <Field label="Where to look" value={selPlan.sources} />
                    <Field label="Cold email" value={selPlan.mailNote} />
                  </>
                )}

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">Companies ({list.length})</div>
                  {list.length === 0 ? (
                    <div className="mt-1 text-gray-soft">None yet. Collect here next if the country is a priority.</div>
                  ) : (
                    <ul className="mt-1 max-h-56 divide-y divide-line overflow-y-auto">
                      {list.slice(0, 60).map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2 py-1.5">
                          <span className="truncate">
                            {r.name}
                            <span className="ml-1.5 text-xs text-gray-soft">{r.side === 'client' ? 'client' : 'provider'}</span>
                          </span>
                          <span className="shrink-0 rounded-full bg-bg-soft px-2 py-0.5 text-[11px]">{STAGE_LABEL[r.stage] ?? r.stage}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-soft">Click a country on the map.</div>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="All countries" subtitle="Click a header to sort and a row to open the country on the map.">
        {rows === null ? (
          <Empty>Loading…</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <Th onClick={() => sortBy('name')}>{`Country${arrow('name')}`}</Th>
                <Th onClick={() => sortBy('tier')}>{`Priority${arrow('tier')}`}</Th>
                <Th onClick={() => sortBy('total')}>{`Companies${arrow('total')}`}</Th>
                <Th onClick={() => sortBy('client')}>{`Clients${arrow('client')}`}</Th>
                <Th onClick={() => sortBy('provider')}>{`Providers${arrow('provider')}`}</Th>
                <Th onClick={() => sortBy('contacted')}>{`Contacted${arrow('contacted')}`}</Th>
                <Th onClick={() => sortBy('replied')}>{`Replied+${arrow('replied')}`}</Th>
                <th className={th}>Cold email</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => {
                const plan = PLAN.get(r.code);
                return (
                  <tr
                    key={r.code}
                    onClick={() => {
                      focusCountry(r.code);
                      wrap.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`cursor-pointer border-b border-line last:border-0 ${selected === r.code ? 'bg-blue-light/10' : 'hover:bg-bg-soft/60'}`}
                  >
                    <td className="px-5 py-2.5 font-semibold">{r.name}</td>
                    <td className="px-5 py-2.5 tabular-nums">{plan ? plan.tier : '-'}</td>
                    <td className="px-5 py-2.5 tabular-nums">{r.stat.total}</td>
                    <td className="px-5 py-2.5 tabular-nums text-gray">{r.stat.client}</td>
                    <td className="px-5 py-2.5 tabular-nums text-gray">{r.stat.provider}</td>
                    <td className="px-5 py-2.5 tabular-nums">{r.stat.contacted}</td>
                    <td className="px-5 py-2.5 tabular-nums">{r.stat.replied}</td>
                    <td className="px-5 py-2.5">
                      {plan ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(plan.mail)}`}>{MAIL_LABEL[plan.mail]}</span> : <span className="text-xs text-gray-soft">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Sources for every country" subtitle="Used first, before any local register.">
          <ul className="list-disc space-y-1.5 p-5 pl-9 text-sm">
            {GLOBAL_SOURCES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Collection rules" subtitle="Apply to every country. Email rules are not legal advice.">
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

function Th({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <th className={`${th} cursor-pointer select-none hover:text-ink`} onClick={onClick}>
      {children}
    </th>
  );
}

function Seg<T extends string>({ value, onChange, options, dark }: { value: T; onChange: (v: T) => void; options: [string, string][]; dark?: boolean }) {
  return (
    <div className="flex gap-1">
      {options.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id as T)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${value === id ? (dark ? 'bg-blue-deep text-white' : 'bg-ink text-white') : 'border border-line bg-white text-gray hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-bg-soft px-2 py-2">
      <div className="font-heading text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-gray-soft">{label}</div>
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
