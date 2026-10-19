'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  supabase,
  PROVIDER_CATEGORIES,
  type Company,
  type PortfolioItem,
  type Service,
  type Lead,
  type LeadStatus,
} from '@/lib/supabase';

type Panel = 'overview' | 'profile' | 'portfolio' | 'services' | 'leads';

export default function DashboardClient() {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>('overview');
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        router.push('/login');
        return;
      }
      // referral_code is not readable through the table (column grant in 06_referral_code_grants.sql),
      // so the provider's own code comes from the my_referral_code() RPC instead of select('*').
      const [{ data: c }, { data: referralCode }, { data: pf }, { data: sv }, { data: ld }] = await Promise.all([
        supabase
          .from('companies')
          .select('id, name, description, category, website, verified, featured, founding_provider, verification_requested, account_type, created_at')
          .eq('id', user.id)
          .single(),
        supabase.rpc('my_referral_code'),
        supabase.from('portfolio_items').select('*').eq('company_id', user.id),
        supabase.from('services').select('*').eq('company_id', user.id),
        supabase.from('leads').select('*').eq('company_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (!cancelled) {
        setCompany(c ? ({ ...c, referral_code: (referralCode as string | null) ?? null } as Company) : null);
        setPortfolio((pf ?? []) as PortfolioItem[]);
        setServices((sv ?? []) as Service[]);
        setLeads((ld ?? []) as Lead[]);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function updateLeadStatus(leadId: string, status: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
    if (error) {
      showToast('Error updating lead');
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    showToast(`Lead marked as ${status}`);
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-soft">Loading…</div>;
  }
  if (!company) {
    return <div className="flex h-screen items-center justify-center text-gray-soft">Company not found.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r border-line bg-bg-soft p-5 md:flex">
        <div className="flex items-center gap-2.5 px-1">
          <Logo size={24} />
          <span className="font-heading text-sm font-semibold">ORIVIONS</span>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {(['overview', 'profile', 'portfolio', 'services', 'leads'] as Panel[]).map((p) => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className={`rounded-lg px-3 py-2 text-left text-sm capitalize transition ${
                panel === p ? 'bg-white font-semibold shadow-sm' : 'text-gray hover:bg-white/60'
              }`}
            >
              {p}
              {p === 'leads' && leads.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-deep px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {leads.length}
                </span>
              )}
            </button>
          ))}
          <Link
            href="/ai-proposal-generator"
            className="mt-1 flex items-center rounded-lg px-3 py-2 text-sm text-gray hover:bg-white/60"
          >
            AI Proposal Generator
            <span className="ml-auto rounded-full bg-warn/15 px-1.5 py-0.5 text-[9px] font-bold text-warn">AI</span>
          </Link>
        </nav>
        <Link href="/login" className="px-3 py-2 text-xs text-gray-soft hover:text-danger">
          ← Log out
        </Link>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <h1 className="mb-7 font-heading text-xl font-semibold capitalize">{panel}</h1>

        {panel === 'overview' && (
          <OverviewPanel company={company} leads={leads} services={services} portfolioCount={portfolio.length} goTo={setPanel} />
        )}
        {panel === 'profile' && (
          <ProfilePanel company={company} setCompany={setCompany} showToast={showToast} />
        )}
        {panel === 'portfolio' && (
          <PortfolioPanel companyId={company.id} portfolio={portfolio} setPortfolio={setPortfolio} showToast={showToast} />
        )}
        {panel === 'services' && (
          <ServicesPanel companyId={company.id} services={services} setServices={setServices} showToast={showToast} />
        )}
        {panel === 'leads' && <LeadsPanel leads={leads} onUpdateStatus={updateLeadStatus} />}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function OverviewPanel({
  company,
  leads,
  services,
  portfolioCount,
  goTo,
}: {
  company: Company;
  leads: Lead[];
  services: Service[];
  portfolioCount: number;
  goTo: (panel: Panel) => void;
}) {
  const newLeads = leads.filter((l) => l.status === 'new').length;
  // What a person at Orivions checks before granting the Verified badge (see /about).
  const steps: { done: boolean; label: string; hint: string; panel: Panel }[] = [
    {
      done: (company.description ?? '').trim().length >= 40 && !!company.website,
      label: 'Complete your company profile',
      hint: 'Company name, category, website and a short description of what you do on Solana.',
      panel: 'profile',
    },
    { done: services.length > 0, label: 'Add your services with price ranges', hint: 'Specific services and indicative prices help clients compare.', panel: 'services' },
    { done: portfolioCount > 0, label: 'Add at least one portfolio item', hint: 'A shipped project, audit report or campaign we can check.', panel: 'portfolio' },
    {
      done: company.verification_requested || company.verified,
      label: 'Request verification',
      hint: 'A person at Orivions reviews your profile and grants the Verified badge.',
      panel: 'profile',
    },
  ];
  const doneCount = steps.filter((st) => st.done).length;
  return (
    <div className="space-y-6">
      {!company.verified && (
        <div className="rounded-2xl border border-blue-light/40 bg-blue-light/5 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Get verified</h3>
            <span className="text-xs font-semibold text-blue-deep">
              {doneCount}/{steps.length} done
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-soft">
            Verified providers get the badge and are listed first in the directory. The first 20 also get the Founding Provider badge.
          </p>
          <ol className="mt-4 space-y-2.5">
            {steps.map((st, i) => (
              <li key={st.label} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    st.done ? 'bg-ok text-white' : 'bg-white text-gray-soft ring-1 ring-line'
                  }`}
                >
                  {st.done ? '✓' : i + 1}
                </span>
                <div>
                  <button onClick={() => goTo(st.panel)} className={`font-semibold ${st.done ? 'text-gray-soft line-through' : 'text-ink hover:text-blue-deep'}`}>
                    {st.label}
                  </button>
                  {!st.done && <p className="text-xs text-gray-soft">{st.hint}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Stat label="New leads" value={newLeads} />
        <Stat label="Active services" value={services.length} />
        <Stat label="Verification" value={company.verified ? 'Verified' : 'Pending'} />
      </div>
      <div className="rounded-2xl border border-line p-5">
        <h3 className="font-semibold">Recent leads</h3>
        <p className="mt-0.5 text-xs text-gray-soft">Latest contact requests from clients.</p>
        <div className="mt-4 space-y-2.5">
          {leads.slice(0, 5).map((l) => (
            <div key={l.id} className="flex items-center justify-between border-t border-line pt-2.5 text-sm">
              <span>{l.client_name}</span>
              <StatusBadge status={l.status} />
            </div>
          ))}
          {!leads.length && <p className="text-sm text-gray-soft">No leads yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">{label}</div>
      <div className="mt-2 font-heading text-2xl font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-deep/10 text-blue-deep',
    contacted: 'bg-warn/15 text-warn',
    won: 'bg-ok/10 text-ok',
    lost: 'bg-danger/10 text-danger',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${colors[status]}`}>{status}</span>
  );
}

function ProfilePanel({
  company,
  setCompany,
  showToast,
}: {
  company: Company;
  setCompany: (c: Company) => void;
  showToast: (msg: string) => void;
}) {
  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description ?? '');
  const [category, setCategory] = useState(company.category);
  const [website, setWebsite] = useState(company.website ?? '');
  const [saving, setSaving] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from('companies')
      .update({ name, description, category, website })
      .eq('id', company.id);
    setSaving(false);
    if (error) {
      showToast('Error saving profile');
      return;
    }
    setCompany({ ...company, name, description, category, website });
    showToast('Profile saved');
  }

  async function requestVerification() {
    setRequestingVerification(true);
    const { error } = await supabase
      .from('companies')
      .update({ verification_requested: true, verification_requested_at: new Date().toISOString() })
      .eq('id', company.id);
    setRequestingVerification(false);
    if (error) {
      showToast('Error sending request');
      return;
    }
    setCompany({ ...company, verification_requested: true });
    showToast('Verification requested');
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-2xl border border-line p-6">
        <h3 className="mb-4 font-semibold">Company profile</h3>
        <TextField label="Company name" value={name} onChange={setName} />
        <TextAreaField label="Description" value={description} onChange={setDescription} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Category" value={category} onChange={(v) => setCategory(v as Company['category'])} options={PROVIDER_CATEGORIES} />
          <TextField label="Website" value={website} onChange={setWebsite} />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="rounded-2xl border border-line p-6">
        <h3 className="font-semibold">Verification</h3>
        <p className="mt-1.5 text-sm text-gray">
          {company.verified
            ? '✓ Verified provider'
            : company.verification_requested
              ? "Verification requested. We'll follow up by email."
              : 'Not verified yet.'}
        </p>
        {!company.verified && (
          <button
            onClick={requestVerification}
            disabled={requestingVerification || company.verification_requested}
            className="mt-3 rounded-xl border border-line px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {company.verification_requested ? 'Request sent' : 'Request verification'}
          </button>
        )}
      </div>

      {company.referral_code && (
        <div className="rounded-2xl border border-line p-6">
          <h3 className="font-semibold">Referral program</h3>
          <div className="mt-3 flex gap-2.5">
            <input readOnly value={`orivions.com/r/${company.referral_code}`} className="flex-1 rounded-lg border border-line bg-bg-soft px-3 py-2.5 text-sm font-semibold" />
            <button
              onClick={() => navigator.clipboard.writeText(`orivions.com/r/${company.referral_code}`)}
              className="rounded-lg border border-line px-4 text-sm font-semibold"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioPanel({
  companyId,
  portfolio,
  setPortfolio,
  showToast,
}: {
  companyId: string;
  portfolio: PortfolioItem[];
  setPortfolio: (items: PortfolioItem[]) => void;
  showToast: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function add() {
    if (!title.trim()) return;
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert({ company_id: companyId, title, description })
      .select()
      .single();
    if (error || !data) {
      showToast('Error adding project');
      return;
    }
    setPortfolio([...portfolio, data as PortfolioItem]);
    setTitle('');
    setDescription('');
    setShowForm(false);
    showToast('Project added to portfolio');
  }

  async function remove(id: string) {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) {
      showToast('Error removing project');
      return;
    }
    setPortfolio(portfolio.filter((p) => p.id !== id));
    showToast('Project removed');
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-soft">Show clients what you&apos;ve shipped.</p>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white">
          + Add project
        </button>
      </div>
      {showForm && (
        <div className="mb-5 rounded-2xl border border-line p-5">
          <TextField label="Project title" value={title} onChange={setTitle} />
          <TextField label="Short description" value={description} onChange={setDescription} />
          <button onClick={add} className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white">
            Add to portfolio
          </button>
        </div>
      )}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {portfolio.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line p-5">
            <div className="text-sm font-semibold">{p.title}</div>
            <p className="mt-1 text-xs text-gray">{p.description}</p>
            <button onClick={() => remove(p.id)} className="mt-3 text-xs font-semibold text-danger">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesPanel({
  companyId,
  services,
  setServices,
  showToast,
}: {
  companyId: string;
  services: Service[];
  setServices: (s: Service[]) => void;
  showToast: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Service['category']>('Development');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  async function add() {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from('services')
      .insert({ company_id: companyId, name, category, price_min: Number(priceMin) || 0, price_max: Number(priceMax) || 0 })
      .select()
      .single();
    if (error || !data) {
      showToast('Error adding service');
      return;
    }
    setServices([...services, data as Service]);
    setName('');
    setPriceMin('');
    setPriceMax('');
    setShowForm(false);
    showToast('Service added');
  }

  async function remove(id: string) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      showToast('Error removing service');
      return;
    }
    setServices(services.filter((s) => s.id !== id));
    showToast('Service removed');
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-soft">What clients can hire you for.</p>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white">
          + Add service
        </button>
      </div>
      {showForm && (
        <div className="mb-5 rounded-2xl border border-line p-5">
          <TextField label="Service name" value={name} onChange={setName} />
          <SelectField label="Category" value={category} onChange={(v) => setCategory(v as Service['category'])} options={PROVIDER_CATEGORIES} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Price from ($)" value={priceMin} onChange={setPriceMin} />
            <TextField label="Price to ($)" value={priceMax} onChange={setPriceMax} />
          </div>
          <button onClick={add} className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white">
            Add service
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-line">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b border-line p-4 text-sm last:border-0">
            <span>{s.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-soft">
                ${s.price_min.toLocaleString()}–${s.price_max.toLocaleString()}
              </span>
              <button onClick={() => remove(s.id)} className="text-xs font-semibold text-danger">
                Remove
              </button>
            </div>
          </div>
        ))}
        {!services.length && <p className="p-6 text-center text-sm text-gray-soft">No services yet.</p>}
      </div>
    </div>
  );
}

function LeadsPanel({ leads, onUpdateStatus }: { leads: Lead[]; onUpdateStatus: (id: string, status: LeadStatus) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      {leads.map((l) => (
        <div key={l.id} className="grid grid-cols-[1fr_2fr_auto_auto] items-center gap-4 border-b border-line p-4 text-sm last:border-0">
          <span className="font-semibold">{l.client_name}</span>
          <span className="truncate text-gray-soft">{l.message}</span>
          <span className="text-xs text-gray-soft">{new Date(l.created_at).toLocaleDateString()}</span>
          <select
            value={l.status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onUpdateStatus(l.id, e.target.value as LeadStatus)}
            className="rounded-lg border border-line px-2 py-1.5 text-xs"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      ))}
      {!leads.length && <p className="p-6 text-center text-sm text-gray-soft">No leads yet.</p>}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1.5 block text-xs font-semibold text-gray">{label}</span>
      <input
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1.5 block text-xs font-semibold text-gray">{label}</span>
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1.5 block text-xs font-semibold text-gray">{label}</span>
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
