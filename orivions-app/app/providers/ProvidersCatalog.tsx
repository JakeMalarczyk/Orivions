'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import { supabase, PROVIDER_CATEGORIES, type Company, type PortfolioItem, type Service } from '@/lib/supabase';
import { isDirectoryOpen } from '@/lib/directory';
import ConciergeForm from '@/components/ConciergeForm';
import ProviderContactForm from '@/components/ProviderContactForm';
import { EarlyAccessBadge, FoundingProviderCard } from '@/components/EarlyAccess';

// UI strings for this page. The site is English-only by design; these were
// previously routed through a locale dictionary and prop-drilled three levels
// deep; a single module-level constant is simpler and equally type-safe.
const t = {
  title: 'Find verified partners for your onchain project.',
  sub: 'Verified companies, real portfolios. Free to search and contact.',
  searchPh: 'Search by name or keyword…',
  category: 'Category',
  allProviders: 'All providers',
  emptyCategory: 'Categories will appear here as providers join.',
  viewProfile: 'View profile →',
  noDesc: 'No description yet.',
  emptyResults: 'No providers here yet. Check back soon, or try another category.',
  foundOne: 'provider found',
  foundMany: 'providers found',
  verified: '✓ Verified',
  portfolio: 'Portfolio',
  services: 'Services',
} as const;

// Providers are fetched on the server (page.tsx) and passed in, so the first
// HTML already contains the directory; search and filters run in the browser.
export default function ProvidersCatalog({ providers }: { providers: Company[] }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  // Deep-link support: /providers?open=<id> (used by Smart Match "view full profile").
  // Read from window instead of useSearchParams so the page stays statically rendered.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('open');
    if (id && providers.some((p) => p.id === id)) setOpenId(id);
  }, [providers]);

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

  const openProvider = providers.find((p) => p.id === openId) ?? null;
  const directoryOpen = isDirectoryOpen(providers.filter((p) => p.verified).length);

  // Early access: no empty grid or zero counts; teams get a hand-picked
  // shortlist and providers can apply for the founding cohort.
  if (!directoryOpen) {
    return (
      <section className="mx-auto max-w-5xl px-8 pb-20 pt-14">
        <div className="text-center">
          <EarlyAccessBadge />
          <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight md:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray">
            We are verifying our founding cohort of service companies one by one: real company,
            confirmed portfolio, a client reference and a call. The public directory opens with that cohort. Until
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
          {!populatedCategories.length && (
            <p className="text-xs text-gray-soft">{t.emptyCategory}</p>
          )}
        </aside>

        <div>

          <div className="mb-4 text-sm text-gray">
            {`${filtered.length} ${filtered.length === 1 ? t.foundOne : t.foundMany}`}
          </div>

          {filtered.length === 0 && (
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
}: {
  provider: Company;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && onOpen()}
      className="cursor-pointer rounded-2xl border border-line p-5 transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">{provider.name}</div>
        {provider.verified && (
          <span className="rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-bold text-ok">{t.verified}</span>
        )}
        {provider.founding_provider && (
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-ink">★ Founding</span>
        )}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-ink">{provider.category}</div>
      <p className="mt-2.5 line-clamp-3 text-[13px] text-gray">{provider.description || t.noDesc}</p>
      {provider.verified && provider.slug && (
        <Link
          href={`/providers/${provider.slug}`}
          onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
          className="mt-3 inline-block text-xs font-semibold text-blue-deep"
        >
          {t.viewProfile}
        </Link>
      )}
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
                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-ink">
                  ★ Founding
                </span>
              )}
            </div>
            <div className="mt-1 text-sm font-semibold text-ink">{provider.category}</div>
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

        {provider.verified && provider.slug && (
          <Link href={`/providers/${provider.slug}`} className="mt-5 inline-block text-sm font-semibold text-ink">
            Full profile →
          </Link>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <ProviderContactForm providerId={provider.id} providerName={provider.name} />
        </div>
      </div>
    </div>
  );
}
