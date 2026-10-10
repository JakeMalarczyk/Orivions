import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CategoryProviders from '@/components/CategoryProviders';

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
}

export function buildFaqJsonLd(faqs: CategoryFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export default function CategoryPage({ content }: { content: CategoryContent }) {
  const {
    breadcrumbLabel, h1, lede, ctaPrimary, sections,
    providersHeading, category, faqs, ctaBoxTitle, ctaBoxText,
  } = content;

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
                      <b className="text-ink">{lead}</b> — {rest}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }}
      />
    </>
  );
}
