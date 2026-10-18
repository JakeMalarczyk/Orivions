import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CategoryProviders from '@/components/CategoryProviders';
import { SITE_URL, sortedPosts } from '@/lib/blog';

// One shared template for every SEO category page.
// Each category route (e.g. /solana-smart-contract-audits) is a thin page that
// defines its metadata + a CategoryContent object and renders <CategoryPage/>.
// Adding a new category = one small data file, zero copied layout.

export interface CategorySection {
  heading: string;
  /** Paragraph body (plain text; may be omitted when bullets are used). */
  body?: string;
  /** Bulleted list items as [boldLead, rest] pairs. */
  bullets?: [string, string][];
  /** Append a link to /insights at the end of the body paragraph. */
  linkToInsights?: boolean;
}

export interface CategoryFaq {
  q: string;
  a: string;
}

export interface CategoryContent {
  breadcrumbLabel: string;
  h1: string;
  lede: string;
  ctaPrimary: string;
  sections: CategorySection[];
  providersHeading: string;
  /** Exact `category` value in the companies table this page lists. */
  category: string;
  faqs: CategoryFaq[];
  ctaBoxTitle: string;
  ctaBoxText: string;
  /** Canonical path of the page, e.g. '/solana-smart-contract-audits'. */
  path: string;
  /** Blog tags whose guides are listed under "Guides" on this page. */
  guideTags: string[];
}

// FAQPage + BreadcrumbList + Service: lets search engines and AI answer
// engines read the page as "Orivions connects you with verified providers of
// <service> on Solana", with the FAQ answers attached.
export function buildJsonLd(content: CategoryContent) {
  const url = `${SITE_URL}${content.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: content.faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Providers', item: `${SITE_URL}/providers` },
          { '@type': 'ListItem', position: 3, name: content.breadcrumbLabel, item: url },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: content.h1,
        description: content.lede,
        serviceType: content.category,
        url,
        areaServed: 'Worldwide',
        audience: { '@type': 'BusinessAudience', name: 'Solana projects and Web3 companies' },
        provider: { '@id': `${SITE_URL}/#organization` },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free for clients to search, match and contact verified providers.',
        },
      },
    ],
  };
}

export default function CategoryPage({ content }: { content: CategoryContent }) {
  const {
    breadcrumbLabel, h1, lede, ctaPrimary, sections,
    providersHeading, category, faqs, ctaBoxTitle, ctaBoxText, guideTags,
  } = content;
  const guides = sortedPosts()
    .filter((p) => p.tags.some((t) => guideTags.includes(t)))
    .slice(0, 4);

  return (
    <>
      <Header />

      <div className="mx-auto max-w-3xl px-8 pb-20 pt-6">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> /{' '}
          <Link href="/providers" className="text-blue-deep">Providers</Link> / {breadcrumbLabel}
        </p>

        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight md:text-4xl">{h1}</h1>
        <p className="mt-4 max-w-xl text-lg text-gray">{lede}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/smart-match" className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white">
            {ctaPrimary}
          </Link>
          <Link href="/providers" className="rounded-xl border border-line bg-white px-6 py-3 text-sm font-semibold">
            Browse all categories
          </Link>
        </div>

        <article className="mt-12 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              {s.body && (
                <p className="mt-3 text-[15px] text-gray">
                  {s.body}
                  {s.linkToInsights && (
                    <>
                      {' '}See live, aggregated indicative pricing on the{' '}
                      <Link href="/insights" className="text-blue-deep">Orivions Market Insights</Link> page.
                    </>
                  )}
                </p>
              )}
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] text-gray">
                  {s.bullets.map(([lead, rest]) => (
                    <li key={lead}>
                      <b className="text-ink">{lead}</b>: {rest}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold">{providersHeading}</h2>
            <Suspense fallback={<p className="mt-4 text-sm text-gray-soft">Loading providers…</p>}>
              <CategoryProviders category={category} />
            </Suspense>
          </section>

          {guides.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Guides</h2>
              <ul className="mt-3 space-y-2.5">
                {guides.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="block rounded-xl border border-line p-4 hover:border-blue-deep">
                      <span className="text-[15px] font-semibold">{p.title}</span>
                      <span className="mt-1 block text-sm text-gray">{p.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold">Frequently asked questions</h2>
            <div className="mt-3 divide-y divide-line border-t border-line">
              {faqs.map(({ q, a }) => (
                <div key={q} className="py-4">
                  <h3 className="font-semibold">{q}</h3>
                  <p className="mt-1.5 text-sm text-gray">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <div className="mt-14 rounded-2xl bg-bg-soft p-7 text-center">
          <h2 className="font-heading text-lg font-semibold">{ctaBoxTitle}</h2>
          <p className="mt-2 text-sm text-gray">{ctaBoxText}</p>
          <Link href="/smart-match" className="mt-3.5 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white">
            Try Smart Match →
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(content)) }}
      />
    </>
  );
}
