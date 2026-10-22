'use client';

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { supabase, type Lead, type LeadStatus } from '@/lib/supabase';

// One inbox for every inbound request: concierge requests (a team asked us for a
// shortlist) and leads (a team contacted a specific provider). The admin opens a
// request, replies by email, moves it through its statuses and keeps internal
// notes. Notes and status changes live in admin_lead_events (migration 11), which
// only admins can read.

export type ConciergeStatus = 'new' | 'in_progress' | 'matched' | 'closed';

export interface ConciergeRequest {
  id: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  project_description: string | null;
  budget_range: string | null;
  timeline: string | null;
  category: string | null;
  chain: string | null;
  repo_url: string | null;
  status: ConciergeStatus;
  created_at: string;
}

export type ProviderLead = Lead & { providerName: string };

export interface LeadEvent {
  id: string;
  source: Source;
  record_id: string;
  kind: 'note' | 'status';
  body: string;
  created_at: string;
}

type Source = 'concierge' | 'lead';

const STATUSES: Record<Source, string[]> = {
  concierge: ['new', 'in_progress', 'matched', 'closed'],
  lead: ['new', 'contacted', 'won', 'lost'],
};
const OPEN = new Set(['new', 'in_progress', 'contacted']);

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-warn/15 text-warn',
  in_progress: 'bg-blue-light/15 text-blue-deep',
  contacted: 'bg-blue-light/15 text-blue-deep',
  matched: 'bg-ok/10 text-ok',
  won: 'bg-ok/10 text-ok',
  closed: 'bg-line text-gray',
  lost: 'bg-line text-gray',
};

interface Item {
  source: Source;
  id: string;
  name: string;
  company: string;
  email: string;
  message: string;
  details: [string, string][];
  status: string;
  created_at: string;
}

function label(status: string) {
  return status.replace('_', ' ');
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function daysAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d === 0 ? 'today' : d === 1 ? '1 day ago' : `${d} days ago`;
}

export default function LeadInbox({
  concierge,
  leads,
  events,
  setConcierge,
  setLeads,
  setEvents,
  onChanged,
}: {
  concierge: ConciergeRequest[];
  leads: ProviderLead[];
  events: LeadEvent[] | null;
  setConcierge: (fn: (rows: ConciergeRequest[]) => ConciergeRequest[]) => void;
  setLeads: (fn: (rows: ProviderLead[]) => ProviderLead[]) => void;
  setEvents: (fn: (rows: LeadEvent[] | null) => LeadEvent[] | null) => void;
  onChanged: () => void;
}) {
  const [show, setShow] = useState<'open' | 'all'>('open');
  const [source, setSource] = useState<'all' | Source>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const items: Item[] = useMemo(() => {
    const fromConcierge: Item[] = concierge.map((c) => ({
      source: 'concierge',
      id: c.id,
      name: c.client_name,
      company: c.client_company ?? '',
      email: c.client_email,
      message: c.project_description ?? '',
      details: (
        [
          ['Type', 'Shortlist request'],
          ['Category', c.category ?? ''],
          ['Budget', c.budget_range ?? ''],
          ['Timeline', c.timeline ?? ''],
          ['Chain', c.chain ?? ''],
          ['Repo', c.repo_url ?? ''],
        ] as [string, string][]
      ).filter(([, v]) => v),
      status: c.status,
      created_at: c.created_at,
    }));
    const fromLeads: Item[] = leads.map((l) => ({
      source: 'lead',
      id: l.id,
      name: l.client_name,
      company: l.client_company ?? '',
      email: l.client_email,
      message: l.message,
      details: [
        ['Type', 'Contact request to a provider'],
        ['Provider', l.providerName],
      ],
      status: l.status,
      created_at: l.created_at,
    }));
    return [...fromConcierge, ...fromLeads].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [concierge, leads]);

  const visible = items.filter((i) => (show === 'all' || OPEN.has(i.status)) && (source === 'all' || i.source === source));
  const openCount = items.filter((i) => OPEN.has(i.status)).length;

  function historyOf(item: Item) {
    return (events ?? []).filter((e) => e.source === item.source && e.record_id === item.id);
  }

  async function addEvent(item: Item, kind: LeadEvent['kind'], body: string) {
    if (events === null) return;
    const { data, error: err } = await supabase
      .from('admin_lead_events')
      .insert({ source: item.source, record_id: item.id, kind, body })
      .select('id, source, record_id, kind, body, created_at')
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    setEvents((rows) => [...(rows ?? []), data as LeadEvent]);
  }

  async function changeStatus(item: Item, status: string) {
    setError('');
    const table = item.source === 'concierge' ? 'concierge_requests' : 'leads';
    const { error: err } = await supabase.from(table).update({ status }).eq('id', item.id);
    if (err) {
      setError(err.message);
      return;
    }
    if (item.source === 'concierge') {
      setConcierge((rows) => rows.map((r) => (r.id === item.id ? { ...r, status: status as ConciergeStatus } : r)));
    } else {
      setLeads((rows) => rows.map((r) => (r.id === item.id ? { ...r, status: status as LeadStatus } : r)));
    }
    await addEvent(item, 'status', `${label(item.status)} → ${label(status)}`);
    onChanged();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
        <div>
          <h3 className="font-semibold">Leads</h3>
          <p className="mt-0.5 text-xs text-gray-soft">
            Shortlist requests and contact requests to providers. {openCount} open.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Segmented
            value={show}
            onChange={(v) => setShow(v as 'open' | 'all')}
            options={[
              ['open', 'Open'],
              ['all', 'All'],
            ]}
          />
          <Segmented
            value={source}
            onChange={(v) => setSource(v as 'all' | Source)}
            options={[
              ['all', 'All types'],
              ['concierge', 'Shortlist requests'],
              ['lead', 'Provider contacts'],
            ]}
          />
        </div>
      </div>

      {error && <div className="m-5 mb-0 rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</div>}
      {events === null && (
        <div className="m-5 mb-0 rounded-xl bg-warn/10 p-3 text-sm text-warn">
          Notes and history need migration 11 (admin_lead_events). Status changes work without it.
        </div>
      )}

      {!visible.length ? (
        <div className="p-10 text-center text-sm text-gray-soft">
          {items.length ? 'Nothing open. Switch to "All" to see handled leads.' : 'No leads yet.'}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((item) => (
            <LeadRow
              key={`${item.source}:${item.id}`}
              item={item}
              open={openId === `${item.source}:${item.id}`}
              onToggle={() => setOpenId((cur) => (cur === `${item.source}:${item.id}` ? null : `${item.source}:${item.id}`))}
              history={historyOf(item)}
              notesEnabled={events !== null}
              onStatus={(s) => changeStatus(item, s)}
              onNote={(text) => addEvent(item, 'note', text)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadRow({
  item,
  open,
  onToggle,
  history,
  notesEnabled,
  onStatus,
  onNote,
}: {
  item: Item;
  open: boolean;
  onToggle: () => void;
  history: LeadEvent[];
  notesEnabled: boolean;
  onStatus: (status: string) => void;
  onNote: (text: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const firstName = item.name.split(' ')[0] || item.name;
  const mailto = `mailto:${item.email}?subject=${encodeURIComponent('Your request on Orivions')}&body=${encodeURIComponent(
    `Hi ${firstName},\n\nThanks for reaching out on Orivions.\n\n`
  )}`;
  const lastNote = [...history].reverse().find((e) => e.kind === 'note');

  async function saveNote() {
    const text = note.trim();
    if (!text) return;
    setSaving(true);
    await onNote(text);
    setNote('');
    setSaving(false);
  }

  return (
    <li>
      <button onClick={onToggle} className="flex w-full items-start gap-4 p-5 text-left hover:bg-bg-soft">
        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[item.status] ?? ''}`}>
          {label(item.status)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            {item.name}
            {item.company ? <span className="font-normal text-gray"> · {item.company}</span> : null}
          </span>
          <span className="mt-0.5 block truncate text-sm text-gray">{item.message || '-'}</span>
          {lastNote && !open && <span className="mt-1 block truncate text-xs text-gray-soft">Note: {lastNote.body}</span>}
        </span>
        <span className="shrink-0 text-right text-xs text-gray-soft">
          <span className="block">{item.source === 'concierge' ? 'Shortlist' : 'Provider contact'}</span>
          <span className="block">{daysAgo(item.created_at)}</span>
        </span>
      </button>

      {open && (
        <div className="grid gap-6 border-t border-line bg-bg-soft/60 p-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-soft">Message</div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#27272E]">{item.message || '-'}</p>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-gray-soft">Email</dt>
              <dd className="break-all">{item.email}</dd>
              {item.details.map(([k, v]) => (
                <Detail key={k} k={k} v={v} />
              ))}
              <dt className="text-gray-soft">Received</dt>
              <dd>{formatDateTime(item.created_at)}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={mailto} className="rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white">
                Reply by email
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.email).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  });
                }}
                className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold"
              >
                {copied ? 'Copied' : 'Copy email'}
              </button>
              <select
                value={item.status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onStatus(e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold"
              >
                {STATUSES[item.source].map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-soft">Notes and history</div>
            {notesEnabled ? (
              <>
                <textarea
                  value={note}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                  placeholder="Internal note, e.g. sent 3 auditors, follow up Monday"
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-blue-deep"
                />
                <button
                  onClick={saveNote}
                  disabled={saving || !note.trim()}
                  className="mt-2 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Add note
                </button>
              </>
            ) : null}
            <ul className="mt-4 space-y-2.5">
              {!history.length && <li className="text-xs text-gray-soft">No notes yet.</li>}
              {[...history].reverse().map((e) => (
                <li key={e.id} className="text-sm">
                  <span className="text-xs text-gray-soft">{formatDateTime(e.created_at)}</span>
                  <div className={e.kind === 'status' ? 'text-xs font-semibold uppercase text-gray' : 'whitespace-pre-wrap'}>
                    {e.kind === 'status' ? `Status: ${e.body}` : e.body}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  const isUrl = /^https?:\/\//.test(v);
  return (
    <>
      <dt className="text-gray-soft">{k}</dt>
      <dd className="break-all">
        {isUrl ? (
          <a href={v} target="_blank" rel="noreferrer" className="text-blue-deep">
            {v}
          </a>
        ) : (
          v
        )}
      </dd>
    </>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, ReactNode][] }) {
  return (
    <div className="flex rounded-full border border-line bg-white p-0.5">
      {options.map(([v, text]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1 font-semibold ${value === v ? 'bg-ink text-white' : 'text-gray hover:text-ink'}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
