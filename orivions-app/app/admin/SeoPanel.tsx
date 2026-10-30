'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { btn, Empty, input, Panel, pct, StatCard, th } from './ui';

// SEO and GEO sheet. Tables are admin-only (RLS via public.is_admin(), see
// supabase/migrations/12_seo_tracking.sql); the site audit runs on the server at
// /api/seo-audit and is stored in seo_audits so results can be compared over time.

type Area = 'technical' | 'onpage' | 'content' | 'authority' | 'geo';
type TaskStatus = 'todo' | 'doing' | 'done' | 'skip';

interface Task {
  id: number;
  area: Area;
  title: string;
  detail: string | null;
  priority: number;
  status: TaskStatus;
  notes: string | null;
}
interface Metric {
  id: number;
  day: string;
  channel: 'google' | 'bing' | 'other';
  impressions: number | null;
  clicks: number | null;
  avg_position: number | null;
  indexed_pages: number | null;
}
interface GeoCheck {
  id: number;
  checked_on: string;
  engine: string;
  prompt: string;
  cited: boolean;
  mentioned: boolean;
  note: string | null;
}
interface Listing {
  id: number;
  name: string;
  url: string | null;
  kind: string;
  status: 'todo' | 'submitted' | 'live' | 'rejected';
  note: string | null;
}
interface Issue {
  sev: 'error' | 'warning';
  code: string;
  msg: string;
}
interface AuditPage {
  path: string;
  status: number;
  title: string;
  titleLen: number;
  descLen: number;
  h1: number;
  words: number;
  schema: string[];
  issues: Issue[];
}
interface AuditResult {
  ranAt: string;
  pages: AuditPage[];
  site: { name: string; ok: boolean; detail: string }[];
  errors: number;
  warnings: number;
}

const AREAS: { id: Area; label: string }[] = [
  { id: 'technical', label: 'Technical SEO' },
  { id: 'onpage', label: 'On-page SEO' },
  { id: 'content', label: 'Content' },
  { id: 'authority', label: 'Authority and backlinks' },
  { id: 'geo', label: 'GEO (AI answer engines)' },
];
const ENGINES = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
  { id: 'google_ai', label: 'Google AI' },
  { id: 'copilot', label: 'Copilot' },
];
const GEO_PROMPTS = [
  'How much does a Solana smart contract audit cost?',
  'How long does a Solana audit take?',
  'Best Solana smart contract auditors',
  'How do I find a trusted Solana development company?',
  'Solana Anchor program security checklist',
  'How much does it cost to build a Solana dApp?',
  'What is a PDA in Solana?',
  'Solana marketing agencies for a token launch',
  'Is there a marketplace for Solana service providers?',
  'Orivions Solana',
];
const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-bg-soft text-gray',
  doing: 'bg-warn/15 text-warn',
  done: 'bg-ok/15 text-ok',
  skip: 'bg-bg-soft text-gray-soft',
};
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function SeoPanel() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [geo, setGeo] = useState<GeoCheck[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    const [t, m, g, l, a] = await Promise.all([
      supabase.from('seo_tasks').select('id, area, title, detail, priority, status, notes').order('priority').order('id'),
      supabase.from('seo_metrics').select('id, day, channel, impressions, clicks, avg_position, indexed_pages').order('day', { ascending: false }).limit(60),
      supabase.from('geo_checks').select('id, checked_on, engine, prompt, cited, mentioned, note').order('checked_on', { ascending: false }).order('id', { ascending: false }).limit(300),
      supabase.from('seo_listings').select('id, name, url, kind, status, note').order('id'),
      supabase.from('seo_audits').select('ran_at, result').order('ran_at', { ascending: false }).limit(1),
    ]);
    if (t.error) {
      setTasks(null);
      setError('The SEO sheet is not available yet. Apply supabase/migrations/12_seo_tracking.sql in the Supabase SQL editor.');
      return;
    }
    setError('');
    setTasks((t.data ?? []) as Task[]);
    setMetrics((m.data ?? []) as Metric[]);
    setGeo((g.data ?? []) as GeoCheck[]);
    setListings((l.data ?? []) as Listing[]);
    const last = a.data?.[0];
    setAudit(last ? ({ ...(last.result as AuditResult), ranAt: last.ran_at as string }) : null);
  }, []);

  // Deferred one tick so the fetch result is never set synchronously inside the effect.
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (error) {
    return (
      <Panel title="SEO & GEO" subtitle="Checklist, site audit, search results, AI citations, listings.">
        <Empty>{error}</Empty>
      </Panel>
    );
  }
  if (!tasks) return <Empty>Loading…</Empty>;

  const done = tasks.filter((t) => t.status === 'done').length;
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'skip').length;
  const cutoff = new Date(now - 30 * 86400000).toISOString().slice(0, 10);
  const recentGeo = geo.filter((c) => c.checked_on >= cutoff);
  const cited = recentGeo.filter((c) => c.cited).length;
  const latestGoogle = metrics.find((m) => m.channel === 'google');

  return (
    <div className="space-y-5">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Checklist" value={pct(done, tasks.length)} sub={`${done} of ${tasks.length} done, ${open} open`} />
        <StatCard
          label="Site audit"
          value={audit ? `${audit.errors} errors` : 'not run'}
          sub={audit ? `${audit.warnings} warnings, ${audit.pages.length} pages` : 'run it below'}
          highlight={!!audit && audit.errors > 0}
        />
        <StatCard label="Google clicks" value={latestGoogle?.clicks ?? '-'} sub={latestGoogle ? `week of ${fmt(latestGoogle.day)}` : 'log weekly below'} />
        <StatCard label="Indexed pages" value={latestGoogle?.indexed_pages ?? '-'} sub="Google, latest entry" />
        <StatCard label="AI citation rate" value={recentGeo.length ? pct(cited, recentGeo.length) : '-'} sub={`${cited} of ${recentGeo.length} checks, 30 days`} />
      </div>

      <AuditPanel audit={audit} onSaved={load} />
      <ChecklistPanel tasks={tasks} setTasks={setTasks} />
      <MetricsPanel metrics={metrics} onSaved={load} />
      <GeoPanel checks={geo} onSaved={load} />
      <ListingsPanel listings={listings} setListings={setListings} onSaved={load} />
    </div>
  );
}

function AuditPanel({ audit, onSaved }: { audit: AuditResult | null; onSaved: () => void }) {
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setMsg('Crawling the live sitemap, this takes about 30 seconds…');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch('/api/seo-audit', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = (await res.json()) as AuditResult;
      const { error } = await supabase.from('seo_audits').insert({
        pages: result.pages.length,
        errors: result.errors,
        warnings: result.warnings,
        result,
      });
      setMsg(error ? `Audit finished but could not be saved: ${error.message}` : '');
      onSaved();
    } catch (e) {
      setMsg(`Audit failed: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setRunning(false);
    }
  }

  const withIssues = (audit?.pages ?? []).filter((p) => p.issues.length).sort((a, b) => b.issues.length - a.issues.length);
  const byCode = new Map<string, number>();
  audit?.pages.forEach((p) => p.issues.forEach((i) => byCode.set(i.code, (byCode.get(i.code) ?? 0) + 1)));

  return (
    <Panel
      title="Site audit"
      subtitle={audit ? `Last run ${new Date(audit.ranAt).toLocaleString('en-US')}. Crawls every URL in the sitemap.` : 'Crawls every URL in the sitemap and checks titles, descriptions, h1, canonical, schema, content length, links and site-level files.'}
      action={
        <button className={btn} onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run audit'}
        </button>
      }
    >
      {msg && <div className="border-b border-line px-5 py-3 text-sm text-gray">{msg}</div>}
      {!audit ? (
        <Empty>No audit saved yet.</Empty>
      ) : (
        <div className="space-y-5 p-5">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-soft">Site-level checks</h4>
            <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {audit.site.map((c) => (
                <li key={c.name} className="flex justify-between gap-3">
                  <span>
                    <span className={c.ok ? 'text-ok' : 'text-danger'}>{c.ok ? '✓' : '✕'}</span> {c.name}
                  </span>
                  <span className="truncate text-xs text-gray-soft">{c.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          {byCode.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {[...byCode.entries()].sort((a, b) => b[1] - a[1]).map(([code, n]) => (
                <span key={code} className="rounded-full bg-bg-soft px-3 py-1 text-xs font-semibold text-gray">
                  {code} · {n}
                </span>
              ))}
            </div>
          )}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-soft">
              Pages with issues ({withIssues.length} of {audit.pages.length})
            </h4>
            {!withIssues.length ? (
              <div className="text-sm text-ok">Every page passes all checks.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                    <th className="py-2 pr-3 font-semibold">Page</th>
                    <th className="py-2 pr-3 font-semibold">Title</th>
                    <th className="py-2 pr-3 font-semibold">Desc.</th>
                    <th className="py-2 pr-3 font-semibold">Words</th>
                    <th className="py-2 font-semibold">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {withIssues.map((p) => (
                    <tr key={p.path} className="cursor-pointer border-b border-line align-top last:border-0" onClick={() => setOpen(open === p.path ? null : p.path)}>
                      <td className="max-w-[260px] truncate py-2 pr-3 font-semibold">{p.path}</td>
                      <td className="py-2 pr-3 tabular-nums">{p.titleLen}</td>
                      <td className="py-2 pr-3 tabular-nums">{p.descLen}</td>
                      <td className="py-2 pr-3 tabular-nums">{p.words}</td>
                      <td className="py-2">
                        {open === p.path ? (
                          <ul className="space-y-1">
                            {p.issues.map((i) => (
                              <li key={i.code + i.msg} className={i.sev === 'error' ? 'text-danger' : 'text-gray'}>
                                {i.msg}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray">
                            {p.issues.filter((i) => i.sev === 'error').length > 0 && (
                              <b className="text-danger">{p.issues.filter((i) => i.sev === 'error').length} errors </b>
                            )}
                            {p.issues.filter((i) => i.sev === 'warning').length} warnings
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function ChecklistPanel({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  async function patch(id: number, p: Partial<Task>) {
    const { error } = await supabase.from('seo_tasks').update({ ...p, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) setTasks(tasks.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }

  return (
    <Panel title="Checklist" subtitle="Priority 1 = do first. Change the status as work lands; notes save when you leave the field.">
      {AREAS.map((area) => {
        const list = tasks.filter((t) => t.area === area.id);
        if (!list.length) return null;
        const done = list.filter((t) => t.status === 'done').length;
        return (
          <div key={area.id} className="border-b border-line last:border-0">
            <div className="flex items-center justify-between bg-bg-soft px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-soft">
              <span>{area.label}</span>
              <span>
                {done}/{list.length}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {list.map((t) => (
                <li key={t.id} className="grid gap-2 px-5 py-3 text-sm md:grid-cols-[1fr_auto]">
                  <div>
                    <div className={`font-semibold ${t.status === 'done' || t.status === 'skip' ? 'text-gray-soft line-through' : ''}`}>
                      <span className="mr-2 rounded bg-bg-soft px-1.5 py-0.5 text-[10px] font-bold text-gray-soft">P{t.priority}</span>
                      {t.title}
                    </div>
                    {t.detail && <div className="mt-0.5 text-xs text-gray-soft">{t.detail}</div>}
                    <input
                      className="mt-1.5 w-full rounded border border-transparent px-1 py-0.5 text-xs outline-none hover:border-line focus:border-blue-deep"
                      placeholder="Add a note"
                      defaultValue={t.notes ?? ''}
                      onBlur={(e) => e.target.value !== (t.notes ?? '') && patch(t.id, { notes: e.target.value })}
                    />
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => patch(t.id, { status: e.target.value as TaskStatus })}
                    className={`h-8 self-start rounded-full border-0 px-3 text-xs font-semibold ${STATUS_STYLE[t.status]}`}
                  >
                    <option value="todo">To do</option>
                    <option value="doing">In progress</option>
                    <option value="done">Done</option>
                    <option value="skip">Skip</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </Panel>
  );
}

function MetricsPanel({ metrics, onSaved }: { metrics: Metric[]; onSaved: () => void }) {
  const [form, setForm] = useState({ day: today(), channel: 'google', impressions: '', clicks: '', position: '', indexed: '' });
  const num = (v: string) => (v.trim() === '' ? null : Number(v));

  async function submit(e: FormEvent) {
    e.preventDefault();
    await supabase.from('seo_metrics').upsert(
      {
        day: form.day,
        channel: form.channel,
        impressions: num(form.impressions),
        clicks: num(form.clicks),
        avg_position: num(form.position),
        indexed_pages: num(form.indexed),
      },
      { onConflict: 'day,channel' },
    );
    setForm({ ...form, impressions: '', clicks: '', position: '', indexed: '' });
    onSaved();
  }

  const google = metrics.filter((m) => m.channel === 'google').slice(0, 12).reverse();
  const maxClicks = Math.max(1, ...google.map((m) => m.clicks ?? 0));

  return (
    <Panel
      title="Search results log"
      subtitle="Once a week, copy the last 7 days from Search Console (Performance) and Bing Webmaster. Same day and channel overwrites."
    >
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2 border-b border-line p-5 text-xs text-gray-soft">
        <label>
          Week ending
          <input type="date" className={`${input} mt-1 block`} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} />
        </label>
        <label>
          Channel
          <select className={`${input} mt-1 block`} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            <option value="other">Other</option>
          </select>
        </label>
        {([
          ['impressions', 'Impressions'],
          ['clicks', 'Clicks'],
          ['position', 'Avg position'],
          ['indexed', 'Indexed pages'],
        ] as const).map(([k, label]) => (
          <label key={k}>
            {label}
            <input
              inputMode="decimal"
              className={`${input} mt-1 block w-28`}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </label>
        ))}
        <button className={btn}>Save</button>
      </form>
      {!metrics.length ? (
        <Empty>No entries yet.</Empty>
      ) : (
        <>
          {google.length > 1 && (
            <div className="flex h-24 items-end gap-2 px-5 pt-5">
              {google.map((m) => (
                <div key={m.id} className="group relative flex h-full flex-1 items-end" title={`${fmt(m.day)}: ${m.clicks ?? 0} clicks`}>
                  <div className="w-full rounded-t bg-blue-deep" style={{ height: `${Math.max(3, ((m.clicks ?? 0) / maxClicks) * 100)}%` }} />
                </div>
              ))}
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className={th}>Week ending</th>
                <th className={th}>Channel</th>
                <th className={th}>Impressions</th>
                <th className={th}>Clicks</th>
                <th className={th}>CTR</th>
                <th className={th}>Avg position</th>
                <th className={th}>Indexed</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5">{fmt(m.day)}</td>
                  <td className="px-5 py-2.5 capitalize">{m.channel}</td>
                  <td className="px-5 py-2.5 tabular-nums">{m.impressions ?? '-'}</td>
                  <td className="px-5 py-2.5 tabular-nums">{m.clicks ?? '-'}</td>
                  <td className="px-5 py-2.5 tabular-nums">{m.impressions ? pct(m.clicks ?? 0, m.impressions) : '-'}</td>
                  <td className="px-5 py-2.5 tabular-nums">{m.avg_position ?? '-'}</td>
                  <td className="px-5 py-2.5 tabular-nums">{m.indexed_pages ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Panel>
  );
}

function GeoPanel({ checks, onSaved }: { checks: GeoCheck[]; onSaved: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [engine, setEngine] = useState('chatgpt');
  const [cited, setCited] = useState(false);
  const [mentioned, setMentioned] = useState(false);
  const [note, setNote] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    await supabase.from('geo_checks').insert({ prompt: prompt.trim(), engine, cited, mentioned: mentioned || cited, note: note.trim() || null });
    setCited(false);
    setMentioned(false);
    setNote('');
    onSaved();
  }

  // Latest result per prompt and engine.
  const latest = new Map<string, GeoCheck>();
  for (const c of checks) if (!latest.has(`${c.prompt}|${c.engine}`)) latest.set(`${c.prompt}|${c.engine}`, c);
  const prompts = [...new Set([...GEO_PROMPTS, ...checks.map((c) => c.prompt)])];

  return (
    <Panel
      title="GEO tracker: do AI engines cite Orivions?"
      subtitle="Once a week, ask each engine the prompts below in a fresh chat and log whether orivions.com was cited (linked as a source) or only mentioned. The grid shows the latest result."
    >
      <div className="overflow-x-auto p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
              <th className="py-2 pr-3 font-semibold">Prompt</th>
              {ENGINES.map((e) => (
                <th key={e.id} className="px-2 py-2 text-center font-semibold">
                  {e.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prompts.map((p) => (
              <tr key={p} className="border-b border-line last:border-0">
                <td className="py-2 pr-3">
                  <button className="text-left hover:text-blue-deep" onClick={() => setPrompt(p)} title="Use this prompt in the form below">
                    {p}
                  </button>
                </td>
                {ENGINES.map((e) => {
                  const c = latest.get(`${p}|${e.id}`);
                  return (
                    <td key={e.id} className="px-2 py-2 text-center" title={c ? `${c.checked_on}${c.note ? `: ${c.note}` : ''}` : 'not checked'}>
                      {!c ? <span className="text-gray-soft">-</span> : c.cited ? <span className="font-bold text-ok">cited</span> : c.mentioned ? <span className="text-warn">mentioned</span> : <span className="text-gray-soft">no</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2 border-t border-line p-5 text-xs text-gray-soft">
        <label className="min-w-[240px] flex-1">
          Prompt
          <input className={`${input} mt-1 block w-full`} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Click a prompt above or type your own" />
        </label>
        <label>
          Engine
          <select className={`${input} mt-1 block`} value={engine} onChange={(e) => setEngine(e.target.value)}>
            {ENGINES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 pb-2.5">
          <input type="checkbox" checked={cited} onChange={(e) => setCited(e.target.checked)} /> Cited as source
        </label>
        <label className="flex items-center gap-1.5 pb-2.5">
          <input type="checkbox" checked={mentioned} onChange={(e) => setMentioned(e.target.checked)} /> Mentioned
        </label>
        <label className="min-w-[160px] flex-1">
          Note (who was cited instead?)
          <input className={`${input} mt-1 block w-full`} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button className={btn}>Log result</button>
      </form>
    </Panel>
  );
}

function ListingsPanel({ listings, setListings, onSaved }: { listings: Listing[]; setListings: (l: Listing[]) => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  async function setStatus(id: number, status: Listing['status']) {
    const { error } = await supabase.from('seo_listings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) setListings(listings.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from('seo_listings').insert({ name: name.trim(), url: url.trim() || null });
    setName('');
    setUrl('');
    onSaved();
  }

  return (
    <Panel title="Listings and backlinks" subtitle="Directories, profiles and mentions that point to orivions.com. Live listings feed GEO as well as SEO.">
      <ul className="divide-y divide-line text-sm">
        {listings.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <div className="font-semibold">
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-deep">
                    {l.name}
                  </a>
                ) : (
                  l.name
                )}
                <span className="ml-2 text-xs font-normal text-gray-soft">{l.kind}</span>
              </div>
              {l.note && <div className="text-xs text-gray-soft">{l.note}</div>}
            </div>
            <select
              value={l.status}
              onChange={(e) => setStatus(l.id, e.target.value as Listing['status'])}
              className="h-8 rounded-full border border-line bg-white px-3 text-xs font-semibold"
            >
              <option value="todo">To do</option>
              <option value="submitted">Submitted</option>
              <option value="live">Live</option>
              <option value="rejected">Rejected</option>
            </select>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex flex-wrap items-end gap-2 border-t border-line p-5 text-xs text-gray-soft">
        <label className="min-w-[200px] flex-1">
          Name
          <input className={`${input} mt-1 block w-full`} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="min-w-[200px] flex-1">
          URL
          <input className={`${input} mt-1 block w-full`} value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <button className={btn}>Add listing</button>
      </form>
    </Panel>
  );
}
