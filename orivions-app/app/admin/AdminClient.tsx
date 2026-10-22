'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase, type Company, type Lead } from '@/lib/supabase';

// Admin panel. Access is enforced in the database, not here: every query below
// only returns data if public.is_admin() is true for the signed-in user
// (supabase/migrations/08_admin.sql). This page just hides the UI from others.

type Tab = 'overview' | 'traffic' | 'providers' | 'concierge' | 'leads' | 'signups';

interface Stats {
  providers: number;
  providers_verified: number;
  verification_requested: number;
  clients: number;
  services: number;
  leads: number;
  leads_new: number;
  concierge_open: number;
  waitlist: number;
  newsletter: number;
}

interface Counts {
  visitors: number;
  views: number;
}

interface Traffic {
  live: number;
  today: Counts;
  last7: Counts;
  last30: Counts;
  total: Counts;
  daily: ({ day: string } & Counts)[];
  pages: ({ path: string } & Counts)[];
  sources: { source: string; visitors: number }[];
  countries: { country: string; visitors: number }[];
}

type ProviderRow = Pick<
  Company,
  'id' | 'slug' | 'name' | 'category' | 'website' | 'verified' | 'featured' | 'founding_provider' | 'verification_requested' | 'created_at'
>;

type ConciergeStatus = 'new' | 'in_progress' | 'matched' | 'closed';
const CONCIERGE_STATUSES: ConciergeStatus[] = ['new', 'in_progress', 'matched', 'closed'];

interface ConciergeRequest {
  id: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  project_description: string | null;
  budget_range: string | null;
  timeline: string | null;
  category: string | null;
  status: ConciergeStatus;
  created_at: string;
}

interface Signup {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'providers', label: 'Providers' },
  { id: 'concierge', label: 'Concierge' },
  { id: 'leads', label: 'Leads' },
  { id: 'signups', label: 'Signups' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminClient() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'denied' | 'ready'>('loading');
  const [email, setEmail] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [concierge, setConcierge] = useState<ConciergeRequest[]>([]);
  const [leads, setLeads] = useState<(Lead & { providerName: string })[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    const [statsRes, trafficRes, providersRes, conciergeRes, leadsRes, waitlistRes, newsletterRes] = await Promise.all([
      supabase.rpc('admin_stats'),
      supabase.rpc('admin_traffic'),
      supabase
        .from('companies')
        .select('id, slug, name, category, website, verified, featured, founding_provider, verification_requested, created_at')
        .eq('account_type', 'provider')
        .order('created_at', { ascending: false }),
      supabase.from('concierge_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('waitlist').select('id, email, created_at').order('created_at', { ascending: false }),
      supabase.from('newsletter_subscribers').select('id, email, role, source, created_at').eq('status', 'active').order('created_at', { ascending: false }),
    ]);

    setStats((statsRes.data as Stats | null) ?? null);
    setTraffic((trafficRes.data as Traffic | null) ?? null);

    const providerRows = (providersRes.data ?? []) as ProviderRow[];
    // Pending verification requests first, then newest.
    providerRows.sort((a, b) => Number(b.verification_requested && !b.verified) - Number(a.verification_requested && !a.verified));
    setProviders(providerRows);

    setConcierge((conciergeRes.data ?? []) as ConciergeRequest[]);

    const nameById = new Map(providerRows.map((p) => [p.id, p.name]));
    setLeads(((leadsRes.data ?? []) as Lead[]).map((l) => ({ ...l, providerName: nameById.get(l.company_id) ?? '-' })));

    const waitlist = ((waitlistRes.data ?? []) as { id: string; email: string; created_at: string }[]).map((w) => ({
      ...w,
      source: 'waitlist',
    }));
    const newsletter = ((newsletterRes.data ?? []) as { id: string; email: string; role: string; source: string | null; created_at: string }[]).map(
      (n) => ({ id: n.id, email: n.email, created_at: n.created_at, source: `newsletter (${n.role}${n.source ? `, ${n.source}` : ''})` })
    );
    setSignups([...waitlist, ...newsletter].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        router.push('/login?redirectTo=/admin');
        return;
      }
      setEmail(user.email ?? '');
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (cancelled) return;
      if (isAdmin !== true) {
        setState('denied');
        return;
      }
      await loadAll();
      if (!cancelled) setState('ready');
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [router, loadAll]);

  async function updateProvider(id: string, patch: Partial<ProviderRow>) {
    setError('');
    const update = patch.verified === true ? { ...patch, verification_requested: false } : patch;
    const { error: err } = await supabase.from('companies').update(update).eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setProviders((rows) => rows.map((r) => (r.id === id ? { ...r, ...update } : r)));
    // A newly verified provider gets a public profile page: tell search engines now.
    const slug = providers.find((r) => r.id === id)?.slug;
    if (patch.verified === true && slug) fetch(`/api/indexnow?provider=${slug}`).catch(() => {});
    const { data } = await supabase.rpc('admin_stats');
    if (data) setStats(data as Stats);
  }

  async function updateConcierge(id: string, status: ConciergeStatus) {
    setError('');
    const { error: err } = await supabase.from('concierge_requests').update({ status }).eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setConcierge((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  function exportSignups() {
    const csv = ['email,source,created_at', ...signups.map((s) => `${s.email},"${s.source}",${s.created_at}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `orivions-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (state === 'loading') {
    return <div className="flex h-screen items-center justify-center text-gray-soft">Loading…</div>;
  }

  if (state === 'denied') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="font-heading text-2xl font-semibold">Not authorized</h1>
        <p className="max-w-md text-sm text-gray">
          {email ? (
            <>
              <b>{email}</b> is not an Orivions admin.
            </>
          ) : (
            'This account is not an Orivions admin.'
          )}
        </p>
        <Link href="/" className="text-sm text-blue-deep">
          Back to orivions.com →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="font-heading text-base font-semibold">ORIVIONS</span>
            <span className="ml-1 border-l border-line pl-2.5 text-xs text-gray-soft">Admin</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="text-gray-soft">{email}</span>
            <button onClick={() => loadAll()} className="text-gray-soft hover:text-ink">
              Refresh
            </button>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                tab === t.id ? 'bg-ink text-white' : 'border border-line bg-white text-gray hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</div>}

        {tab === 'overview' && stats && (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {traffic && (
              <>
                <StatCard label="Visitors today" value={traffic.today.visitors} />
                <StatCard label="Visitors, 7 days" value={traffic.last7.visitors} />
              </>
            )}
            <StatCard label="Providers" value={stats.providers} />
            <StatCard label="Verified" value={stats.providers_verified} />
            <StatCard label="Awaiting verification" value={stats.verification_requested} highlight={stats.verification_requested > 0} />
            <StatCard label="Clients" value={stats.clients} />
            <StatCard label="Services listed" value={stats.services} />
            <StatCard label="Leads" value={stats.leads} />
            <StatCard label="New leads" value={stats.leads_new} />
            <StatCard label="Open concierge" value={stats.concierge_open} highlight={stats.concierge_open > 0} />
            <StatCard label="Waitlist" value={stats.waitlist} />
            <StatCard label="Newsletter" value={stats.newsletter} />
          </div>
        )}

        {tab === 'traffic' && (
          <TrafficPanel traffic={traffic} />
        )}

        {tab === 'providers' && (
          <Panel title="Providers" subtitle="Pending verification requests are listed first. Verifying clears the request.">
            {!providers.length ? (
              <Empty>No providers yet.</Empty>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                    <th className="px-5 py-3 font-semibold">Company</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Verified</th>
                    <th className="px-5 py-3 font-semibold">Founding</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5 text-sm">
                        <div className="font-semibold">{p.name}</div>
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noreferrer" className="text-xs text-blue-deep">
                            {p.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        {p.verification_requested && !p.verified && (
                          <span className="ml-2 rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warn">
                            requested
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray">{p.category}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-soft">{formatDate(p.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Toggle on={p.verified} onChange={(v) => updateProvider(p.id, { verified: v })} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Toggle on={p.founding_provider} onChange={(v) => updateProvider(p.id, { founding_provider: v })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        )}

        {tab === 'concierge' && (
          <Panel title="Concierge requests" subtitle="Teams that asked for a hand-picked shortlist.">
            {!concierge.length ? (
              <Empty>No concierge requests yet.</Empty>
            ) : (
              <div className="divide-y divide-line">
                {concierge.map((c) => (
                  <div key={c.id} className="flex flex-col gap-2 p-5 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <div className="text-sm font-semibold">
                        {c.client_name}
                        {c.client_company ? ` · ${c.client_company}` : ''}{' '}
                        <a href={`mailto:${c.client_email}`} className="font-normal text-blue-deep">
                          {c.client_email}
                        </a>
                      </div>
                      <p className="mt-1 text-sm text-gray">{c.project_description || '-'}</p>
                      <div className="mt-1 text-xs text-gray-soft">
                        {[c.category, c.budget_range, c.timeline].filter(Boolean).join(' · ')} · {formatDate(c.created_at)}
                      </div>
                    </div>
                    <select
                      value={c.status}
                      onChange={(e) => updateConcierge(c.id, e.target.value as ConciergeStatus)}
                      className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm"
                    >
                      {CONCIERGE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {tab === 'leads' && (
          <Panel title="Leads" subtitle="Contact requests sent to providers (latest 200). Providers manage their own status.">
            {!leads.length ? (
              <Empty>No leads yet.</Empty>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                    <th className="px-5 py-3 font-semibold">From</th>
                    <th className="px-5 py-3 font-semibold">To provider</th>
                    <th className="px-5 py-3 font-semibold">Message</th>
                    <th className="px-5 py-3 font-semibold">Sent</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5 text-sm">
                        <div className="font-semibold">{l.client_name}</div>
                        <div className="text-xs text-gray-soft">{l.client_email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">{l.providerName}</td>
                      <td className="max-w-xs truncate px-5 py-3.5 text-sm text-gray">{l.message}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-soft">{formatDate(l.created_at)}</td>
                      <td className="px-5 py-3.5 text-xs font-bold uppercase text-gray">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        )}

        {tab === 'signups' && (
          <Panel
            title="Signups"
            subtitle="Waitlist and active newsletter subscribers."
            action={
              signups.length ? (
                <button onClick={exportSignups} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                  Export CSV
                </button>
              ) : null
            }
          >
            {!signups.length ? (
              <Empty>No signups yet.</Empty>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Source</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={`${s.source}-${s.id}`} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5 text-sm">{s.email}</td>
                      <td className="px-5 py-3.5 text-sm text-gray">{s.source}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-soft">{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

function TrafficPanel({ traffic }: { traffic: Traffic | null }) {
  if (!traffic) {
    return (
      <Panel title="Traffic" subtitle="Visits counted on orivions.com.">
        <Empty>Traffic stats are not available yet (migration 09 not applied?).</Empty>
      </Panel>
    );
  }
  const max = Math.max(1, ...traffic.daily.map((d) => d.visitors));
  const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="On site now" value={traffic.live} highlight={traffic.live > 0} />
        <StatCard label="Visitors today" value={traffic.today.visitors} sub={`${traffic.today.views} page views`} />
        <StatCard label="Visitors, 7 days" value={traffic.last7.visitors} sub={`${traffic.last7.views} page views`} />
        <StatCard label="Visitors, 30 days" value={traffic.last30.visitors} sub={`${traffic.last30.views} page views`} />
        <StatCard label="Visitors, all time" value={traffic.total.visitors} sub={`${traffic.total.views} page views`} />
      </div>

      <Panel title="Daily visitors" subtitle="Last 30 days, Polish time. Hover a bar for the numbers.">
        <div className="px-5 pb-4 pt-6">
          <div className="flex h-40 items-end gap-[2px]">
            {traffic.daily.map((d) => (
              <div key={d.day} className="group relative flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-blue-deep transition group-hover:bg-blue-light"
                  style={{ height: `${Math.max(d.visitors ? 3 : 0, (d.visitors / max) * 100)}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white group-hover:block">
                  <div className="font-semibold">{dayLabel(d.day)}</div>
                  <div>
                    {d.visitors} visitors · {d.views} views
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-xs text-gray-soft">
            <span>{traffic.daily[0] ? dayLabel(traffic.daily[0].day) : ''}</span>
            <span>Today</span>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        <RankList
          title="Top pages"
          subtitle="Last 30 days, by page views"
          rows={traffic.pages.map((p) => ({ key: p.path, label: p.path, value: p.views }))}
        />
        <RankList
          title="Sources"
          subtitle="Last 30 days, by visitors (referrer or utm_source)"
          rows={traffic.sources.map((s) => ({ key: s.source, label: s.source, value: s.visitors }))}
        />
        <RankList
          title="Countries"
          subtitle="Last 30 days, by visitors"
          rows={traffic.countries.map((c) => ({ key: c.country, label: c.country, value: c.visitors }))}
        />
      </div>
    </div>
  );
}

function RankList({ title, subtitle, rows }: { title: string; subtitle: string; rows: { key: string; label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Panel title={title} subtitle={subtitle}>
      {!rows.length ? (
        <Empty>No visits yet.</Empty>
      ) : (
        <ul className="space-y-2 p-5">
          {rows.map((r) => (
            <li key={r.key} className="relative overflow-hidden rounded-lg px-3 py-1.5 text-sm">
              <div className="absolute inset-y-0 left-0 rounded-lg bg-blue-light/15" style={{ width: `${(r.value / max) * 100}%` }} />
              <div className="relative flex justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className="font-semibold tabular-nums">{r.value}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function StatCard({ label, value, highlight, sub }: { label: string; value: number; highlight?: boolean; sub?: string }) {
  return (
    <div className={`rounded-2xl border bg-white p-5 ${highlight ? 'border-warn' : 'border-line'}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">{label}</div>
      <div className="mt-2 font-heading text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-soft">{sub}</div>}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <div className="flex items-start justify-between border-b border-line p-5">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-soft">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="p-10 text-center text-sm text-gray-soft">{children}</div>;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition ${on ? 'bg-ok' : 'bg-line'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${on ? 'left-4' : 'left-0.5'}`} />
    </button>
  );
}
