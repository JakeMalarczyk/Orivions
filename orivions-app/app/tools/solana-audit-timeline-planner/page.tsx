import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { auditPhases, FIND_DAYS, QUEUE_DAYS, FIX_DAYS, FIX_REVIEW_DAYS } from '@/lib/auditTimeline';
import type { AuditInput } from '@/lib/auditEstimate';
import TimelinePlanner from './TimelinePlanner';

const PATH = '/tools/solana-audit-timeline-planner';
const TITLE = 'Solana audit timeline planner';
const DESCRIPTION =
  'Free planner: enter your mainnet launch date and code size, get the latest date to contact Solana auditors. Transparent phases, no signup.';

export const metadata: Metadata = {
  title: 'Solana Audit Timeline Planner (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('When must you book your Solana audit?', 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('When must you book your Solana audit?', 'Free tool')] },
};

const base: Omit<AuditInput, 'lines' | 'complexity'> = { programs: 1, framework: 'anchor', integrations: 'none', fixReview: true, rush: false };
const EXAMPLES: { label: string; input: AuditInput }[] = [
  { label: 'Token vesting program, 500 lines', input: { ...base, lines: 500, complexity: 'simple' } },
  { label: 'Staking program, 1,500 lines', input: { ...base, lines: 1500, complexity: 'standard' } },
  { label: 'Lending protocol, 3,000 lines, 2 programs, oracle', input: { ...base, lines: 3000, programs: 2, complexity: 'defi', integrations: 'few' } },
];
const examples = EXAMPLES.map((e) => {
  const phases = auditPhases(e.input);
  const fast = phases.reduce((n, p) => n + p.days[0], 0);
  const slow = phases.reduce((n, p) => n + p.days[1], 0);
  return { label: e.label, weeks: [Math.round(fast / 7), Math.round(slow / 7)] as [number, number] };
});

const wk = (d: [number, number]) => `${d[0] / 7 < 1 ? `${d[0]} days` : `${d[0] / 7} week${d[0] === 7 ? '' : 's'}`} to ${d[1] / 7 < 1 ? `${d[1]} days` : `${d[1] / 7} weeks`}`;

const FAQS = [
  {
    q: 'When should I book a Solana audit?',
    a: `Contact auditors at least ${examples[1]!.weeks[1]} weeks before mainnet for a standard 1,500-line program, and earlier for large DeFi protocols. The planner works backwards from your launch date and shows the latest date for the comfortable and the fast case.`,
  },
  {
    q: 'Why does the plan take longer than the review itself?',
    a: `The review is only one phase. Finding an auditor takes ${wk(FIND_DAYS)}, the wait for a start date ${wk(QUEUE_DAYS)}, fixing findings ${wk(FIX_DAYS)} and the fix review ${wk(FIX_REVIEW_DAYS)}.`,
  },
  {
    q: 'Can I shorten the timeline?',
    a: 'Freeze the code at a tagged commit before the first call, write a short specification, ship tests and contact firms as soon as the scope is stable. A rush start within two weeks usually costs more.',
  },
  {
    q: 'Does the planner replace an auditor quote?',
    a: 'No. It is a planning range built from typical phase lengths and the audit cost calculator method. The real start date depends on each firm calendar.',
  },
];

export default function AuditTimelinePage() {
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
          { '@type': 'ListItem', position: 3, name: 'Audit timeline planner', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        eyebrow={<><Link href="/tools" className="hover:text-white">Free tools</Link> / Audit timeline planner</>}
        title={TITLE}
        lede="Enter your mainnet launch date and the size of your code. The planner adds up the phases of a Solana audit, from finding a firm to the fix review, and tells you the latest date to contact auditors. Free, no signup, and nothing you enter leaves your browser."
      />
      <div className="mx-auto max-w-5xl px-8 pb-20 pt-10">
        <div className="mt-8"><TimelinePlanner /></div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">How long a Solana audit takes, by phase</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
                  <th className="px-4 py-3 font-semibold">Phase</th>
                  <th className="px-4 py-3 font-semibold">Typical length</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line"><td className="px-4 py-3">Find and book an auditor</td><td className="px-4 py-3">{wk(FIND_DAYS)}</td></tr>
                <tr className="border-b border-line"><td className="px-4 py-3">Wait for the start date</td><td className="px-4 py-3">{wk(QUEUE_DAYS)}</td></tr>
                <tr className="border-b border-line"><td className="px-4 py-3">The review itself</td><td className="px-4 py-3">1 to 12 weeks, by code size and complexity</td></tr>
                <tr className="border-b border-line"><td className="px-4 py-3">Fix the findings</td><td className="px-4 py-3">{wk(FIX_DAYS)}</td></tr>
                <tr><td className="px-4 py-3">Fix review and final report</td><td className="px-4 py-3">{wk(FIX_REVIEW_DAYS)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 font-heading text-[22px] font-semibold">Worked examples</h2>
          <p className="mt-2 text-sm text-gray">Anchor, fix review included. Total time from first call to final report.</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink/90">
            {examples.map((e) => (
              <li key={e.label}>{e.label}: about {e.weeks[0]} to {e.weeks[1]} weeks.</li>
            ))}
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            For the full explanation read{' '}
            <Link href="/blog/how-long-does-a-solana-audit-take" className="text-blue-deep">how long a Solana audit takes</Link>
            , estimate the price with the{' '}
            <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>
            , prepare with the{' '}
            <Link href="/blog/solana-audit-readiness-checklist" className="text-blue-deep">audit readiness checklist</Link>
            {' '}and send firms the same brief using the{' '}
            <Link href="/tools/audit-rfp-generator" className="text-blue-deep">audit RFP generator</Link>.
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
