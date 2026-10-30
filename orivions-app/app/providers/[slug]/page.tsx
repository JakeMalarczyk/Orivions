import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ProviderContactForm from '@/components/ProviderContactForm';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { getVerifiedProvider, listVerifiedProviders, websiteUrl } from '@/lib/providers';

// Public profile of a verified provider. The "Verified on Orivions" badge on
// provider websites links here, so this page must render on the server and
// stay at a stable URL. Unverified providers have no public page.

export const revalidate = 300;

// Category pages that exist for a provider category; used for the breadcrumb and a link back.
const CATEGORY_HUBS: Record<string, { href: string; label: string }> = {
  'Security & Audits': { href: '/solana-smart-contract-audits', label: 'Smart contract audits' },
  Development: { href: '/solana-development-companies', label: 'Development companies' },
  'Marketing & Growth': { href: '/solana-marketing-growth-agencies', label: 'Marketing and growth agencies' },
};

export async function generateStaticParams() {
  return (await listVerifiedProviders()).map((p) => ({ slug: p.slug }));
}

function summary(description: string | null, name: string, category: string): string {
  const text = (description ?? '').trim();
  const base = text || `${name} is a verified ${category.toLowerCase()} provider on Orivions.`;
  return base.length > 155 ? `${base.slice(0, 152).trimEnd()}...` : base;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVerifiedProvider(slug);
  if (!data) return { title: 'Provider not found', robots: { index: false } };
  const { provider } = data;
  const title = `${provider.name}: verified ${provider.category} provider`;
  const description = summary(provider.description, provider.name, provider.category);
  return {
    title,
    description,
    alternates: { canonical: `/providers/${provider.slug}` },
    openGraph: {
      type: 'profile',
      title,
      description,
      url: `/providers/${provider.slug}`,
      images: [{ url: ogImageUrl(provider.name, 'Verified on Orivions'), width: 1200, height: 630 }],
    },
  };
}

export default async function ProviderProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getVerifiedProvider(slug);
  if (!data) notFound();
  const { provider, portfolio, services } = data;

  const url = `${SITE_URL}/providers/${provider.slug}`;
  const site = websiteUrl(provider.website);
  const hub = CATEGORY_HUBS[provider.category];
  const profiles = [provider.x_url, provider.github_url, provider.linkedin_url].filter(
    (u): u is string => !!u && /^https?:\/\//.test(u)
  );
  const facts: [string, string][] = [
    ['Category', provider.category],
    ...(provider.location ? ([['Location', provider.location]] as [string, string][]) : []),
    ...(provider.team_size ? ([['Team size', provider.team_size]] as [string, string][]) : []),
    ...(provider.founded_year ? ([['Founded', String(provider.founded_year)]] as [string, string][]) : []),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: `${provider.name} on Orivions`,
        dateCreated: provider.created_at,
        dateModified: provider.updated_at,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${url}#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${url}#organization`,
        name: provider.name,
        description: provider.description || undefined,
        url: site ?? url,
        sameAs: profiles.length ? profiles : undefined,
        address: provider.location || undefined,
        foundingDate: provider.founded_year ? String(provider.founded_year) : undefined,
      },
      ...services.map((s) => ({
        '@type': 'Service',
        '@id': `${url}#service-${s.id}`,
        name: s.name,
        serviceType: s.category || provider.category,
        provider: { '@id': `${url}#organization` },
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            minPrice: s.price_min,
            maxPrice: s.price_max,
          },
        },
      })),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Providers', item: `${SITE_URL}/providers` },
          { '@type': 'ListItem', position: 3, name: provider.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-8 pb-20 pt-10">
        <p className="text-sm text-gray-soft">
          <Link href="/" className="text-ink">Orivions</Link> /{' '}
          <Link href="/providers" className="text-ink">Providers</Link> / {provider.name}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{provider.name}</h1>
          <span className="rounded-full bg-ok/10 px-2.5 py-1 text-xs font-bold text-ok">✓ Verified on Orivions</span>
          {provider.founding_provider && (
            <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-ink">
              ★ Founding Provider
            </span>
          )}
        </div>
        <div className="mt-2 text-sm font-semibold text-ink">{provider.category}</div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-base leading-relaxed text-ink/90">
              {provider.description || `${provider.name} is a verified ${provider.category.toLowerCase()} provider on Orivions.`}
            </p>
            {site && (
              <a href={site} target="_blank" rel="noopener" className="mt-3 inline-block text-sm font-semibold text-ink">
                {provider.website!.replace(/^https?:\/\//, '')} ↗
              </a>
            )}

            {services.length > 0 && (
              <section className="mt-10">
                <h2 className="font-heading text-xl font-semibold">Services and indicative pricing</h2>
                <div className="mt-4">
                  {services.map((s) => (
                    <div key={s.id} className="flex justify-between gap-4 border-t border-line py-3 text-sm">
                      <span>{s.name}</span>
                      <span className="whitespace-nowrap text-gray">
                        ${s.price_min.toLocaleString('en-US')} - ${s.price_max.toLocaleString('en-US')}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-soft">Ranges provided by {provider.name}. The final price depends on scope.</p>
              </section>
            )}

            {portfolio.length > 0 && (
              <section className="mt-10">
                <h2 className="font-heading text-xl font-semibold">Portfolio</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {portfolio.map((p) => (
                    <div key={p.id} className="rounded-xl border border-line p-4">
                      <h3 className="text-sm font-semibold">{p.title}</h3>
                      {p.description && <p className="mt-1.5 text-xs leading-relaxed text-gray">{p.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10 rounded-2xl border border-line bg-bg-soft p-6">
              <h2 className="font-heading text-lg font-semibold">What &quot;Verified&quot; means</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray">
                A person at Orivions confirmed that {provider.name} is a real company, confirmed at least one
                portfolio project independently, spoke to a past client and talked to the team. Verification
                cannot be bought and lowers risk, but it does not replace your own checks.{' '}
                <Link href="/how-we-verify" className="text-ink">How we verify providers</Link>
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line p-5">
              <dl className="space-y-2.5 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-gray-soft">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {profiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4 text-sm">
                  {profiles.map((u) => (
                    <a key={u} href={u} target="_blank" rel="noopener" className="text-ink">
                      {new URL(u).hostname.replace(/^www\./, '')} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-line p-5">
              <ProviderContactForm providerId={provider.id} providerName={provider.name} />
              <p className="mt-3 text-xs text-gray-soft">Free for clients. Your message goes straight to {provider.name}.</p>
            </div>
            <div className="rounded-2xl border border-line p-5 text-sm">
              <div className="font-semibold">Comparing options?</div>
              <p className="mt-1 text-gray">Describe your project and get up to three verified providers that fit.</p>
              <Link href="/smart-match" className="mt-3 inline-block font-semibold text-ink">Start Smart Match →</Link>
              {hub && (
                <Link href={hub.href} className="mt-2 block text-ink">More {hub.label.toLowerCase()} →</Link>
              )}
            </div>
          </aside>
        </div>
      </div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
    </>
  );
}
