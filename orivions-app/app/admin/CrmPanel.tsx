'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Empty, Panel, StatCard, btn, input, th } from './ui';

// Outreach CRM. Data: crm_companies and crm_notes (supabase/migrations/16_admin_crm.sql),
// readable and writable only by admins through RLS.

type Stage = 'new' | 'contacted' | 'replied' | 'meeting' | 'verification' | 'active' | 'declined';
type Side = 'provider' | 'client' | 'supply' | 'ecosystem';
type NoteKind = 'note' | 'reply' | 'email' | 'dm' | 'call' | 'stage';

interface Company {
  id: number;
  name: string;
  side: Side;
  category: string | null;
  country: string | null;
  contact: string | null;
  confidence: string | null;
  source: string | null;
  stage: Stage;
  next_step: string | null;
  due: string | null;
  owner: string;
  breakpoint: 'to_invite' | 'invited' | 'confirmed' | 'paused' | null;
  meeting_at: string | null;
  updated_at: string;
}

interface Note {
  id: number;
  company_id: number;
  kind: NoteKind;
  body: string;
  created_at: string;
}

const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: 'new', label: 'New', hint: 'On the list, no contact yet' },
  { id: 'contacted', label: 'Contacted', hint: 'Message sent, no reply' },
  { id: 'replied', label: 'Replied', hint: 'They answered, we owe a response' },
  { id: 'meeting', label: 'Meeting', hint: 'Call or meeting planned or held' },
  { id: 'verification', label: 'Verification', hint: 'Signing up, being checked' },
  { id: 'active', label: 'Active', hint: 'Founding or verified provider' },
  { id: 'declined', label: 'Declined', hint: 'Not interested or bounced' },
];

type Tab = 'client' | 'provider' | 'other';

// Clients (teams that buy services) and providers (firms that sell them) are worked
// differently, so each gets its own tab, funnel and stage wording.
const TABS: { id: Tab; label: string; sides: Side[]; addSide: Side; hint: string }[] = [
  { id: 'client', label: 'Clients', sides: ['client'], addSide: 'client', hint: 'Teams that need an auditor, lawyer, developer or marketer' },
  { id: 'provider', label: 'Providers', sides: ['provider'], addSide: 'provider', hint: 'Firms that sell those services' },
  { id: 'other', label: 'Other', sides: ['supply', 'ecosystem'], addSide: 'ecosystem', hint: 'Supply prospects and ecosystem partners' },
];

const STAGE_TEXT: Record<Tab, Partial<Record<Stage, { label: string; hint: string }>>> = {
  client: {
    verification: { label: 'Brief / matching', hint: 'They sent a brief, we are matching providers' },
    active: { label: 'Using Orivions', hint: 'Got a shortlist or started an engagement' },
  },
  provider: {
    verification: { label: 'Verification', hint: 'Signing up, being checked' },
    active: { label: 'Verified provider', hint: 'Founding or verified provider' },
  },
  other: {},
};

const BREAKPOINT_LABEL: Record<string, string> = {
  to_invite: 'To invite',
  invited: 'Invited',
  confirmed: 'Confirmed',
  paused: 'Paused',
};

const NOTE_KINDS: NoteKind[] = ['note', 'reply', 'email', 'dm', 'call'];

const PAGE = 60;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDay(iso: string | null): string {
  if (!iso) return '-';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function stageClass(stage: Stage): string {
  switch (stage) {
    case 'active':
      return 'bg-ok/15 text-ok';
    case 'verification':
    case 'meeting':
      return 'bg-blue-deep/10 text-blue-deep';
    case 'replied':
      return 'bg-warn/20 text-ink';
    case 'declined':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-bg-soft text-gray';
  }
}

export default function CrmPanel() {
  const [rows, setRows] = useState<Company[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<Stage | 'all' | 'action'>('action');
  const [tab, setTab] = useState<Tab>('client');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('crm_companies')
      .select('id, name, side, category, country, contact, confidence, source, stage, next_step, due, owner, breakpoint, meeting_at, updated_at')
      .order('name', { ascending: true })
      .limit(2000);
    if (err) setError(err.message);
    else setError('');
    setRows((data ?? []) as Company[]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const tabDef = TABS.find((t) => t.id === tab) ?? TABS[0]!;
  const scoped = useMemo(() => rows.filter((r) => tabDef.sides.includes(r.side)), [rows, tabDef]);
  const tabCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of TABS) c[t.id] = rows.filter((r) => t.sides.includes(r.side)).length;
    return c;
  }, [rows]);
  const stages = useMemo(
    () => STAGES.map((s) => ({ ...s, ...(STAGE_TEXT[tab][s.id] ?? {}) })),
    [tab],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of scoped) c[r.stage] = (c[r.stage] ?? 0) + 1;
    return c;
  }, [scoped]);

  // "Needs action": someone replied, a meeting or verification is open, or a follow-up date has come.
  const needsAction = useCallback(
    (r: Company) =>
      ['replied', 'meeting', 'verification'].includes(r.stage) || (r.stage === 'contacted' && !!r.due && r.due <= today()),
    [],
  );

  const actionCount = useMemo(() => scoped.filter(needsAction).length, [scoped, needsAction]);
  const overdue = useMemo(() => scoped.filter((r) => r.due && r.due < today() && !['active', 'declined'].includes(r.stage)).length, [scoped]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scoped.filter((r) => {
      if (stage === 'action' ? !needsAction(r) : stage !== 'all' && r.stage !== stage) return false;
      if (!q) return true;
      return [r.name, r.category, r.contact, r.next_step, r.country].some((v) => v?.toLowerCase().includes(q));
    });
    // Soonest due date first; rows without a date go last.
    return list.sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.name.localeCompare(b.name));
  }, [scoped, stage, query, needsAction]);

  async function patch(id: number, changes: Partial<Company>, note?: string) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    const { error: err } = await supabase.from('crm_companies').update(changes).eq('id', id);
    if (err) {
      setRows(prev);
      setError(err.message);
      return;
    }
    if (note) await supabase.from('crm_notes').insert({ company_id: id, kind: 'stage', body: note });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={tabDef.label} value={scoped.length} sub={tabDef.hint} />
        <StatCard label="Need action" value={actionCount} highlight={actionCount > 0} sub="Replies, meetings, follow-ups due" />
        <StatCard label="Overdue" value={overdue} highlight={overdue > 0} sub="Due date in the past" />
        <StatCard label={stages.find((x) => x.id === 'active')?.label ?? 'Active'} value={counts.active ?? 0} sub={stages.find((x) => x.id === 'active')?.hint} />
      </div>

      <div className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setStage('action');
              setLimit(PAGE);
              setOpenId(null);
            }}
            className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-semibold ${tab === t.id ? 'border-blue-deep text-ink' : 'border-transparent text-gray hover:text-ink'}`}
          >
            {t.label} <span className="text-xs font-normal text-gray-soft">({tabCounts[t.id] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStage('action')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${stage === 'action' ? 'bg-warn text-ink' : 'border border-line bg-white text-gray hover:text-ink'}`}
        >
          Needs action ({actionCount})
        </button>
        {stages.map((s) => (
          <button
            key={s.id}
            title={s.hint}
            onClick={() => {
              setStage(s.id);
              setLimit(PAGE);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${stage === s.id ? 'bg-ink text-white' : 'border border-line bg-white text-gray hover:text-ink'}`}
          >
            {s.label} ({counts[s.id] ?? 0})
          </button>
        ))}
        <button
          onClick={() => setStage('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${stage === 'all' ? 'bg-ink text-white' : 'border border-line bg-white text-gray hover:text-ink'}`}
        >
          All ({scoped.length})
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className={`${input} w-64`}
          placeholder="Search name, contact, next step"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
        />
        <button className={`${btn} ml-auto`} onClick={() => setAdding((v) => !v)}>
          {adding ? 'Close' : 'Add company'}
        </button>
      </div>

      {error && <div className="rounded-lg border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</div>}

      {adding && (
        <AddForm
          defaultSide={tabDef.addSide}
          onDone={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      <Panel
        title="Pipeline"
        subtitle="Soonest due date first. Change the stage, next step or date inline; open a row for contact details and notes."
      >
        {!loaded ? (
          <Empty>Loading…</Empty>
        ) : !filtered.length ? (
          <Empty>Nothing here.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className={th}>Company</th>
                <th className={th}>Stage</th>
                <th className={th}>Next step</th>
                <th className={th}>Due</th>
                <th className={th}>Breakpoint</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map((r) => (
                <CompanyRow
                  key={r.id}
                  row={r}
                  stages={stages}
                  open={openId === r.id}
                  onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                  onPatch={patch}
                />
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > limit && (
          <div className="border-t border-line p-4 text-center">
            <button className={btn} onClick={() => setLimit((n) => n + PAGE)}>
              Show more ({filtered.length - limit} left)
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

function CompanyRow({
  row,
  stages,
  open,
  onToggle,
  onPatch,
}: {
  row: Company;
  stages: { id: Stage; label: string }[];
  open: boolean;
  onToggle: () => void;
  onPatch: (id: number, changes: Partial<Company>, note?: string) => Promise<void>;
}) {
  const [step, setStep] = useState(row.next_step ?? '');
  const late = !!row.due && row.due < today() && !['active', 'declined'].includes(row.stage);

  return (
    <>
      <tr className="border-b border-line align-top last:border-0">
        <td className="px-5 py-3">
          <button onClick={onToggle} className="text-left font-semibold hover:text-blue-deep">
            {row.name}
          </button>
          <div className="text-xs text-gray-soft">
            {row.side}
            {row.category ? ` · ${row.category}` : ''}
          </div>
        </td>
        <td className="px-5 py-3">
          <select
            value={row.stage}
            onChange={(e) => {
              const next = e.target.value as Stage;
              onPatch(row.id, { stage: next }, `Stage: ${row.stage} to ${next}`);
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold outline-none ${stageClass(row.stage)}`}
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </td>
        <td className="px-5 py-3">
          <input
            key={row.next_step ?? ''}
            className={`${input} w-full min-w-56`}
            defaultValue={step}
            placeholder="Next step"
            onChange={(e) => setStep(e.target.value)}
            onBlur={(e) => e.target.value !== (row.next_step ?? '') && onPatch(row.id, { next_step: e.target.value.trim() || null })}
          />
        </td>
        <td className="px-5 py-3">
          <input
            type="date"
            value={row.due ?? ''}
            onChange={(e) => onPatch(row.id, { due: e.target.value || null })}
            className={`${input} ${late ? 'border-danger text-danger' : ''}`}
          />
        </td>
        <td className="px-5 py-3 text-xs">
          {row.breakpoint ? BREAKPOINT_LABEL[row.breakpoint] : <span className="text-gray-soft">-</span>}
          {row.meeting_at && <div className="text-gray-soft">{row.meeting_at}</div>}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-line bg-bg-soft/60">
          <td colSpan={5} className="px-5 py-4">
            <Detail row={row} onPatch={onPatch} />
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ row, onPatch }: { row: Company; onPatch: (id: number, changes: Partial<Company>) => Promise<void> }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<NoteKind>('note');
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState(row.contact ?? '');

  const loadNotes = useCallback(async () => {
    const { data } = await supabase
      .from('crm_notes')
      .select('id, company_id, kind, body, created_at')
      .eq('company_id', row.id)
      .order('created_at', { ascending: false });
    setNotes((data ?? []) as Note[]);
  }, [row.id]);

  useEffect(() => {
    const t = setTimeout(loadNotes, 0);
    return () => clearTimeout(t);
  }, [loadNotes]);

  async function addNote() {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    await supabase.from('crm_notes').insert({ company_id: row.id, kind, body: text });
    setBody('');
    setBusy(false);
    loadNotes();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">Contact</div>
          <textarea
            className={`${input} mt-1 w-full`}
            rows={2}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            onBlur={() => contact !== (row.contact ?? '') && onPatch(row.id, { contact: contact.trim() || null })}
          />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt className="text-gray-soft">Country</dt>
          <dd>{row.country || '-'}</dd>
          <dt className="text-gray-soft">Confidence</dt>
          <dd>{row.confidence || '-'}</dd>
          <dt className="text-gray-soft">Source</dt>
          <dd>{row.source || '-'}</dd>
          <dt className="text-gray-soft">Owner</dt>
          <dd>{row.owner}</dd>
          <dt className="text-gray-soft">Updated</dt>
          <dd>{formatDay(row.updated_at.slice(0, 10))}</dd>
        </dl>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-gray-soft">Breakpoint:</span>
          {(['to_invite', 'invited', 'confirmed', 'paused'] as const).map((b) => (
            <button
              key={b}
              onClick={() => onPatch(row.id, { breakpoint: row.breakpoint === b ? null : b })}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.breakpoint === b ? 'bg-ink text-white' : 'border border-line bg-white text-gray'}`}
            >
              {BREAKPOINT_LABEL[b]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">Notes</div>
        <div className="mt-2 flex gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value as NoteKind)} className={input}>
            {NOTE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            className={`${input} flex-1`}
            placeholder="What happened?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
          />
          <button className={btn} disabled={busy || !body.trim()} onClick={addNote}>
            Add
          </button>
        </div>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {notes === null ? (
            <li className="text-xs text-gray-soft">Loading…</li>
          ) : !notes.length ? (
            <li className="text-xs text-gray-soft">No notes yet.</li>
          ) : (
            notes.map((n) => (
              <li key={n.id} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
                <div className="flex justify-between text-[11px] text-gray-soft">
                  <span className="font-semibold uppercase">{n.kind}</span>
                  <span>{new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap">{n.body}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function AddForm({ onDone, defaultSide }: { onDone: () => void; defaultSide: Side }) {
  const [name, setName] = useState('');
  const [side, setSide] = useState<Side>(defaultSide);
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('crm_companies').insert({
      name: name.trim(),
      side,
      category: category.trim() || null,
      contact: contact.trim() || null,
      source: 'manual',
    });
    setBusy(false);
    if (error) setErr(error.code === '23505' ? 'This company already exists on that side.' : error.message);
    else onDone();
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-5">
      <label className="text-xs font-semibold text-gray-soft">
        Name
        <input className={`${input} mt-1 block w-56`} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="text-xs font-semibold text-gray-soft">
        Side
        <select className={`${input} mt-1 block`} value={side} onChange={(e) => setSide(e.target.value as Side)}>
          <option value="provider">Provider</option>
          <option value="client">Client</option>
          <option value="supply">Supply</option>
          <option value="ecosystem">Ecosystem</option>
        </select>
      </label>
      <label className="text-xs font-semibold text-gray-soft">
        Category
        <input className={`${input} mt-1 block w-44`} value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <label className="text-xs font-semibold text-gray-soft">
        Contact
        <input className={`${input} mt-1 block w-64`} value={contact} onChange={(e) => setContact(e.target.value)} />
      </label>
      <button className={btn} disabled={busy || !name.trim()} onClick={save}>
        Save
      </button>
      {err && <span className="text-xs text-danger">{err}</span>}
    </div>
  );
}
