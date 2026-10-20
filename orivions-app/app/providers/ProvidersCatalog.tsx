'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, PROVIDER_CATEGORIES, type Company, type PortfolioItem, type Service } from '@/lib/supabase';
import { isDirectoryOpen } from '@/lib/directory';
import ConciergeForm from '@/components/ConciergeForm';
import { EarlyAccessBadge, FoundingProviderCard } from '@/components/EarlyAccess';

// UI strings for this page. The site is English-only by design; these were
// previously routed through a locale dictionary and prop-drilled three levels
// deep; a single module-level constant is simpler and equally type-safe.
const t = {
  title: 'Find your next partner in the Solana ecosystem.',
  sub: 'Verified companies, real portfolios. Free to search and contact.',
  searchPh: 'Search by name or keyword…',
  category: 'Category',
  allProviders: 'All providers',
  emptyCategory: 'Categories will appear here as providers join.',
  sponsored: 'Sponsored',
  viewProfile: 'View profile →',
  noDesc: 'No description yet.',
  emptyResults: 'No providers here yet. Check back soon, or try another category.',
  foundOne: 'provider found',
  foundMany: 'providers found',
  contact: 'Contact',
  yourName: 'Your name',
  company: 'Company',
  email: 'Email',
  needLabel: 'What do you need?',
  needPh: 'Briefly describe your project...',
  send: 'Send message',
  sentPrefix: '✓ Sent:',
  sentSuffix: 'will get back to you directly.',
  formError: 'Something went wrong. Please try again.',
  fillRequired: 'Please fill in your name, email, and message.',
  verified: '✓ Verified',
  portfolio: 'Portfolio',
  services: 'Services',
} as const;


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProvidersCatalog() {
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, description, category, website, verified, featured, founding_provider, verification_requested, account_type, created_at')
        .eq('account_type', 'provider')
        .order('verified', { ascending: false });
      if (!cancelled) {
        if (!error && data) setProviders(data as unknown as Company[]);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep-link support: /providers?open=<id> (used by Smart Match "view full profile")
  useEffect(() => {
    const id = searchParams.get('open');
    if (id && providers.some((p) => p.id === id)) setOpenId(id);
  }, [searchParams, providers]);

  const populatedCategories = useMemo(
    () => PROVIDER_CATEGORIES.filter((cat) => providers.some((p) => p.category === cat)),
    [providers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return providers.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [providers, activeCategory, search]);

  const featured = useMemo(
    () => (activeCategory === 'all' && !search ? providers.filter((p) => p.featured) : []),
    [providers, activeCategory, search]
  );

  const openProvider = providers.find((p) => p.id === openId) ?? null;
  const directoryOpen = isDirectoryOpen(providers.filter((p) => p.verified).length);

  if (loading) return <div className="px-8 py-20 text-center text-gray-soft">Loading…</div>;

  // Early access: no empty grid or zero counts; teams get a hand-picked
  // shortlist and providers can apply for the founding cohort.
  if (!directoryOpen) {
    return (
      <section className="mx-auto max-w-5xl px-8 pb-20 pt-14">
        <div className="text-center">
          <EarlyAccessBadge />
          <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight md:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray">
            We are verifying our founding cohort of Solana service companies one by one: real team,
            real portfolio, transparent pricing. The public directory opens with that cohort. Until
            then, our team matches you by hand.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <ConciergeForm need="" source="providers" />
          <FoundingProviderCard />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="px-8 pb-6 pt-14 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{t.title}</h1>
        <p className="mt-3 text-gray">{t.sub}</p>
        <div className="mx-auto mt-7 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder={t.searchPh}
            className="w-full rounded-xl border border-line px-5 py-3.5 text-sm outline-none focus:border-blue-light"
          />
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-8 pb-20 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-wrap gap-1.5 md:sticky md:top-20 md:block md:h-fit">
          <h3 className="mb-3 hidden text-xs font-bold uppercase tracking-wide text-gray-soft md:block">
            {t.category}
          </h3>
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
              activeCategory === 'all' ? 'bg-blue-deep/10 font-semibold text-blue-deep' : 'text-gray hover:bg-bg-soft'
            }`}
          >
            {t.allProviders} <span className="text-xs text-gray-soft">{providers.length}</span>
          </button>
          {populatedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                activeCategory === cat ? 'bg-blue-deep/10 font-semibold text-blue-deep' : 'text-gray hover:bg-bg-soft'
              }`}
            >
              {cat} <span className="text-xs text-gray-soft">{providers.filter((p) => p.category === cat).length}</span>
            </button>
          ))}
          {!populatedCategories.length && !loading && (
            <p className="text-xs text-gray-soft">{t.emptyCategory}</p>
          )}
        </aside>

        <div>
          {featured.length > 0 && (
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-soft">
                {t.sponsored}
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <ProviderCard key={p.id} provider={p} onOpen={() => setOpenId(p.id)} sponsored />
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 text-sm text-gray">
            {loading
              ? '…'
              : `${filtered.length} ${filtered.length === 1 ? t.foundOne : t.foundMany}`}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-gray-soft">
              {t.emptyResults}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProviderCard key={p.id} provider={p} onOpen={() => setOpenId(p.id)} />
            ))}
          </div>
        </div>
      </div>

      {openProvider && (
        <ProviderDetailModal provider={openProvider} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}

function ProviderCard({
  provider,
  onOpen,
  sponsored,
}: {
  provider: Company;
  onOpen: () => void;
  sponsored?: boolean;
}) {
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && onOpen()}
      className={`cursor-pointer rounded-2xl border p-5 transition hover:shadow-md ${
        sponsored ? 'border-warn/40 bg-gradient-to-b from-warn/5 to-transparent' : 'border-line'
      }`}
    >
      {sponsored && (
        <span className="mb-2 inline-block rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-bold text-warn">
          {t.sponsored}
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">{provider.name}</div>
        {provider.verified && (
          <span className="rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-bold text-ok">{t.verified}</span>
        )}
        {provider.founding_provider && (
          <span className="rounded-full bg-gradient-to-br from-blue-deep/10 to-blue-light/15 px-2 py-0.5 text-[10px] font-bold text-blue-deep">★ Founding</span>
        )}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-blue-deep">{provider.category}</div>
      <p className="mt-2.5 line-clamp-3 text-[13px] text-gray">{provider.description || t.noDesc}</p>
    </div>
  );
}

function ProviderDetailModal({
  provider,
  onClose,
}: {
  provider: Company;
  onClose: () => void;
}) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });
  const [sendState, setSendState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: pf }, { data: sv }] = await Promise.all([
        supabase.from('portfolio_items').select('*').eq('company_id', provider.id),
        supabase.from('services').select('*').eq('company_id', provider.id),
      ]);
      if (!cancelled) {
        setPortfolio((pf ?? []) as PortfolioItem[]);
        setServices((sv ?? []) as Service[]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [provider.id]);

  async function handleSend() {
    setErrorMsg('');
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim()) || !form.message.trim()) {
      setErrorMsg(t.fillRequired);
      return;
    }
    setSendState('loading');
    try {
      const { error } = await supabase.from('leads').insert({
        company_id: provider.id,
        client_name: form.name.trim(),
        client_company: form.company.trim(),
        client_email: form.email.trim(),
        message: form.message.trim(),
        status: 'new',
      });
      if (error) throw error;
      // Best-effort admin ping; never blocks the client.
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead', companyId: provider.id }),
      }).catch(() => {});
      setSendState('success');
      setForm({ name: '', company: '', email: '', message: '' });
    } catch {
      setSendState('error');
      setErrorMsg(t.formError);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-10"
      onClick={(e: MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onClose()}
    >
      <div className="mb-10 w-full max-w-xl rounded-2xl bg-white p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xl font-semibold">
              {provider.name}
              {provider.verified && (
                <span className="rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-bold text-ok">
                  {t.verified}
                </span>
              )}
              {provider.founding_provider && (
                <span className="rounded-full bg-gradient-to-br from-blue-deep/10 to-blue-light/15 px-2 py-0.5 text-[10px] font-bold text-blue-deep">
                  ★ Founding
                </span>
              )}
            </div>
            <div className="mt-1 text-sm font-semibold text-blue-deep">{provider.category}</div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-bg-soft p-2 text-gray" aria-label="Close">
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm text-gray">{provider.description || t.noDesc}</p>
        {provider.website && (
          <a
            href={`https://${provider.website.replace(/^https?:\/\//, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-deep"
          >
            {provider.website} ↗
          </a>
        )}

        {portfolio.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-soft">{t.portfolio}</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {portfolio.map((p) => (
                <div key={p.id} className="rounded-lg border border-line p-3">
                  <div className="text-[13px] font-semibold">{p.title}</div>
                  <div className="mt-1 text-xs text-gray">{p.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-soft">{t.services}</h4>
            {services.map((s) => (
              <div key={s.id} className="flex justify-between border-t border-line py-2.5 text-sm">
                <span>{s.name}</span>
                <span className="text-xs text-gray-soft">
                  ${s.price_min.toLocaleString()}–${s.price_max.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <h4 className="mb-3.5 text-sm font-semibold">
            {t.contact} {provider.name}
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              placeholder={t.yourName}
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
            />
            <input
              placeholder={t.company}
              value={form.company}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, company: e.target.value })}
              className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
            />
          </div>
          <input
            type="email"
            placeholder={t.email}
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
            className="mt-2.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
          />
          <textarea
            placeholder={t.needPh}
            value={form.message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, message: e.target.value })}
            rows={3}
            className="mt-2.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-blue-deep"
          />
          <button
            onClick={handleSend}
            disabled={sendState === 'loading'}
            className="mt-3 w-full rounded-lg bg-ink py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t.send}
          </button>
          {sendState === 'success' && (
            <p className="mt-2.5 rounded-lg bg-ok/10 p-3 text-sm text-ok">
              {t.sentPrefix} {provider.name} {t.sentSuffix}
            </p>
          )}
          {sendState === 'error' && (
            <p className="mt-2.5 rounded-lg bg-danger/10 p-3 text-sm text-danger">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
