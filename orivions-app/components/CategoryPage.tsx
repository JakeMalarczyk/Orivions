import { ldJson } from '@/lib/jsonLd';
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
  /** Optional sentence ending in an internal link, e.g. to a free tool. */
  link?: { text: string; href: string; label: string };
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

      <div className="mx-auto max-w-3xl px-8 pb-24 pt-10">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="hover:text-ink">Orivions</Link> /{' '}
          <Link href="/providers" className="hover:text-ink">Providers</Link> / {breadcrumbLabel}
        </p>

        <h1 className="mt-6 font-heading text-[36px] font-medium leading-[1.1] tracking-tight md:text-[52px]">{h1}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray">{lede}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/smart-match" className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white">
            {ctaPrimary}
          </Link>
          <Link href="/providers" className="rounded-lg border border-ink/20 px-6 py-3 text-sm font-semibold hover:border-ink">
            Browse all categories
          </Link>
        </div>

        <article className="mt-16 space-y-12">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-heading text-[28px] font-medium leading-tight">{s.heading}</h2>
              {s.body && (
                <p className="mt-4 text-[17px] leading-[1.75] text-gray">
                  {s.body}
                  {s.linkToInsights && (
                    <>
                      {' '}See live, aggregated indicative pricing on the{' '}
                      <Link href="/insights" className="text-blue-deep">Orivions Market Insights</Link> page.
                    </>
                  )}
                  {s.link && (
                    <>
                      {' '}{s.link.text}{' '}
                      <Link href={s.link.href} className="text-blue-deep">{s.link.label}</Link>.
                    </>
                  )}
                </p>
              )}
              {s.bullets && (
                <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[17px] leading-[1.7] text-gray">
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
            <h2 className="font-heading text-[28px] font-medium leading-tight">{providersHeading}</h2>
            <Suspense fallback={<p className="mt-4 text-sm text-gray-soft">Loading providers…</p>}>
              <CategoryProviders category={category} />
            </Suspense>
          </section>

          {guides.length > 0 && (
            <section>
              <h2 className="font-heading text-[28px] font-medium leading-tight">Guides</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {guides.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="block py-4 hover:text-blue-deep">
                      <span className="text-[15px] font-semibold">{p.title}</span>
                      <span className="mt-1 block text-sm text-gray">{p.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-heading text-[28px] font-medium leading-tight">Frequently asked questions</h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <span aria-hidden className="text-xl text-gray-soft transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <div className="mt-16 rounded-xl bg-ink p-8 text-white [background-image:radial-gradient(70%_100%_at_100%_0%,rgba(56,189,248,0.25),transparent_70%)]">
          <h2 className="font-heading text-2xl font-medium">{ctaBoxTitle}</h2>
          <p className="mt-2 max-w-lg text-white/75">{ctaBoxText}</p>
          <Link href="/smart-match" className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ink">
            Try Smart Match →
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(buildJsonLd(content)) }}
      />
    </>
  );
}
