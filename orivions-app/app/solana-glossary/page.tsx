import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { GLOSSARY, shortTerm, termPath } from '@/lib/glossary';

const TITLE = 'Solana glossary: plain-English definitions for teams hiring in the ecosystem';
const DESCRIPTION =
  'Plain-English definitions of Solana terms for building, auditing and launching: PDA, CPI, Anchor, compute units, upgrade authority, verifiable builds and more.';

export const metadata: Metadata = {
  title: 'Solana Glossary',
  description: DESCRIPTION,
  alternates: { canonical: '/solana-glossary' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/solana-glossary',
    images: [{ url: ogImageUrl('Solana glossary', 'Reference'), width: 1200, height: 630 }],
  },
};

const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() {
  const url = `${SITE_URL}/solana-glossary`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTermSet',
        '@id': `${url}#set`,
        name: 'Solana glossary',
        description: DESCRIPTION,
        url,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
        hasDefinedTerm: terms.map((t) => ({
          '@type': 'DefinedTerm',
          '@id': `${url}#${t.id}`,
          name: t.term,
          description: t.definition,
          url: `${SITE_URL}${termPath(t.id)}`,
          inDefinedTermSet: `${url}#set`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Solana glossary', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        width="max-w-2xl"
        eyebrow="Reference"
        title="Solana glossary"
        lede="Plain-English definitions of the terms that come up when you build, audit and launch on Solana, or hire a team to do it. Short enough to quote, with links to our deeper guides."
      />
      <div className="mx-auto max-w-2xl px-8 pb-20 pt-2">
        <nav aria-label="Terms" className="mt-6 flex flex-wrap gap-1.5">
          {terms.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="rounded-full border border-line bg-bg-soft px-2.5 py-0.5 text-[12px] font-semibold text-gray hover:text-ink"
            >
              {shortTerm(t)}
            </a>
          ))}
        </nav>

        <dl className="mt-8 space-y-3">
          {terms.map((t) => (
            <div key={t.id} id={t.id} className="scroll-mt-24 rounded-2xl border border-line p-5">
              <dt className="font-heading text-lg font-semibold">
                <Link href={termPath(t.id)} className="hover:text-blue-deep">
                  {t.term}
                </Link>
              </dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-ink/90">
                {t.definition}
                {' '}
                <Link href={termPath(t.id)} className="text-blue-deep">
                  Why it matters →
                </Link>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 rounded-2xl bg-ink p-7 text-white">
          <h2 className="font-heading text-xl font-semibold">Need a team that speaks this language?</h2>
          <p className="mt-2 text-sm text-white/75">
            Describe your project in plain English. Smart Match suggests verified Solana developers,
            auditors and agencies with a reason for each match. Free for teams.
          </p>
          <Link href="/smart-match" className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink">
            Get matched →
          </Link>
        </div>
      </div>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
    </>
  );
}
