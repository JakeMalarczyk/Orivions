import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import ReadinessCheck from './ReadinessCheck';

const PATH = '/tools/solana-audit-readiness-check';
const TITLE = 'Solana audit readiness check';
const DESCRIPTION =
  'Free check: answer twelve questions about your code, docs, tests and process and see how ready your Solana program is for an audit, and what to fix first.';

export const metadata: Metadata = {
  title: 'Solana Audit Readiness Check (free, 2 minutes)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Is your Solana program ready for an audit?', 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('Is your Solana program ready for an audit?', 'Free tool')] },
};

const FAQS = [
  {
    q: 'What does audit readiness mean?',
    a: 'That auditors can spend their time finding bugs instead of setting up: one frozen commit, finished features, a short spec with invariants, tests that run in one command, agreed scope and a developer who answers questions quickly.',
  },
  {
    q: 'Why does readiness change the price of an audit?',
    a: 'Audits are priced in engineer-days. Unclear scope, missing docs or a broken test setup add days, and code that changes during the review gets reviewed twice.',
  },
  {
    q: 'What score do I need before booking?',
    a: 'You can ask for quotes at any score, since firms need a few weeks to start. Close the open items before the start date, so the review time goes to your code.',
  },
  {
    q: 'Is my answer stored?',
    a: 'No. The check runs in your browser and nothing you select is sent to Orivions.',
  },
];

export default function ReadinessCheckPage() {
  const url = `${SITE_URL}${PATH}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: TITLE,
        description: DESCRIPTION,
        url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any (web browser)',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      { '@type': 'FAQPage', mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Free tools', item: `${SITE_URL}/tools` },
          { '@type': 'ListItem', position: 3, name: 'Audit readiness check', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        eyebrow={<><Link href="/tools" className="hover:text-white">Free tools</Link> / Audit readiness check</>}
        title={TITLE}
        lede="Twelve questions about your code, documentation, tests and process. See how ready your Solana program is for an audit and what to fix before the start date. Two minutes, no signup, and nothing you select leaves your browser."
      />
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-8">
        <ReadinessCheck />

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">Why readiness matters</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
            Auditors bill by engineer-days. Every hour spent getting your build to run or guessing what
            an instruction should allow is an hour not spent finding bugs. The items in this check come
            from the{' '}
            <Link href="/blog/solana-audit-readiness-checklist" className="text-blue-deep">Solana audit readiness checklist</Link>
            . Estimate the price with the{' '}
            <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>
            {' '}and the latest date to book with the{' '}
            <Link href="/tools/solana-audit-timeline-planner" className="text-blue-deep">audit timeline planner</Link>.
          </p>

          <h2 className="mt-12 font-heading text-[22px] font-semibold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-line p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
    </>
  );
}
