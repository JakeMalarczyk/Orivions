import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import {
  COMPLEXITY,
  DAY_RATE_HIGH,
  DAY_RATE_LOW,
  EXTRA_PROGRAM_DAYS,
  FIX_REVIEW_FACTOR,
  FRAMEWORK,
  INTEGRATIONS,
  LINES_PER_ENGINEER_DAY,
  MIN_ENGINEER_DAYS,
  RUSH_FACTOR,
  estimateAudit,
  formatUsd,
  type AuditInput,
} from '@/lib/auditEstimate';
import AuditCalculator from './AuditCalculator';

// Free tool page. The calculator is client-side, but everything a crawler or AI
// answer engine needs (worked examples, methodology, FAQ) is rendered on the
// server from the same constants the calculator uses.

const PATH = '/tools/solana-audit-cost-calculator';
const TITLE = 'Solana smart contract audit cost calculator';
const DESCRIPTION =
  'Free calculator: estimate Solana audit cost and duration from lines of code, complexity, framework and integrations. Transparent method, no signup.';

export const metadata: Metadata = {
  title: 'Solana Audit Cost Calculator (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('How much will your Solana audit cost?', 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl('How much will your Solana audit cost?', 'Free tool')],
  },
};

const base: Omit<AuditInput, 'lines' | 'complexity'> = {
  programs: 1,
  framework: 'anchor',
  integrations: 'none',
  fixReview: true,
  rush: false,
};

const EXAMPLES: { label: string; input: AuditInput }[] = [
  { label: 'Token vesting program, 500 lines', input: { ...base, lines: 500, complexity: 'simple' } },
  { label: 'Staking program, 1,500 lines', input: { ...base, lines: 1500, complexity: 'standard' } },
  { label: 'Lending protocol, 3,000 lines, 2 programs, oracle', input: { ...base, lines: 3000, programs: 2, complexity: 'defi', integrations: 'few' } },
  { label: 'Perps DEX in native Rust, 6,000 lines, 3 programs', input: { ...base, lines: 6000, programs: 3, complexity: 'defi', framework: 'native', integrations: 'many' } },
];

const examples = EXAMPLES.map((e) => ({ ...e, result: estimateAudit(e.input) }));

const FAQS = [
  {
    q: 'How much does a Solana smart contract audit cost?',
    a: `Small single-purpose programs start at around $5,000, and large DeFi protocols can cost tens of thousands. With our method, a 1,500-line Anchor staking program comes out at about ${formatUsd(examples[1]!.result.costLow)} to ${formatUsd(examples[1]!.result.costHigh)}. The size and complexity of the code in scope drive most of the price.`,
  },
  {
    q: 'How long does a Solana audit take?',
    a: 'Most audits of a single program take one to three weeks of review, plus a few days for the fix review. Larger protocols take a month or more. Good auditors are often booked several weeks ahead, so contact them early.',
  },
  {
    q: 'Why do audit quotes for the same code differ so much?',
    a: 'Auditors price by engineer-time. One firm may plan two engineers for two weeks with a fix review included, another one engineer for one week with the fix review billed separately. Compare scope, engineer-days and deliverables, not just the total.',
  },
  {
    q: 'How can I lower the cost of an audit?',
    a: 'Freeze the code at a tagged commit, write a short specification of each instruction and its invariants, ship a good test suite, remove dead code from scope, and book early instead of paying for a rush slot.',
  },
  {
    q: 'How many lines of code can an auditor review per day?',
    a: `Our method assumes about ${LINES_PER_ENGINEER_DAY} lines of straightforward Anchor code per engineer-day, then adjusts for complexity, framework and integrations. Complex DeFi logic is reviewed much more slowly per line, which is why effort is multiplied by up to 2.1 for novel or cross-chain designs.`,
  },
  {
    q: 'How accurate is this Solana audit cost calculator?',
    a: 'It gives an indicative range, not a quote. Real quotes depend on the firm, its calendar, your code quality, tests and documentation. Use the range to sanity-check quotes and to plan budget and dates before you contact auditors.',
  },
];

export default function AuditCostCalculatorPage() {
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
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Free tools', item: `${SITE_URL}/tools` },
          { '@type': 'ListItem', position: 3, name: 'Audit cost calculator', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        eyebrow={
          <>
            <Link href="/tools" className="hover:text-white">Free tools</Link> / Audit cost calculator
          </>
        }
        title={TITLE}
        lede={
          <>
            {`This Solana audit cost calculator estimates the price and calendar time of an independent security audit from lines of code, number of programs, complexity, framework (Anchor or native Rust) and integrations. It uses ${formatUsd(DAY_RATE_LOW)}-${formatUsd(DAY_RATE_HIGH)} per engineer-day and about ${LINES_PER_ENGINEER_DAY} lines of Anchor code per engineer-day. Free, no signup, and nothing you enter leaves your browser.`}
          </>
        }
      />
      <div className="mx-auto max-w-5xl px-8 pb-20 pt-10">

        <div className="mt-8">
          <AuditCalculator />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">Solana audit cost examples</h2>
          <p className="mt-2 text-sm text-gray">Anchor unless noted, fix review included, no rush.</p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Engineer-days</th>
                  <th className="px-4 py-3 font-semibold">Calendar time</th>
                  <th className="px-4 py-3 font-semibold">Indicative cost</th>
                </tr>
              </thead>
              <tbody>
                {examples.map(({ label, result }) => (
                  <tr key={label} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">{label}</td>
                    <td className="px-4 py-3 tabular-nums">{result.engineerDays}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {result.weeks[0]} to {result.weeks[1]} weeks
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {formatUsd(result.costLow)} to {formatUsd(result.costHigh)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 font-heading text-[22px] font-semibold">How the estimate works</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
            Auditors price by engineer-time, so the calculator first estimates engineer-days and then
            applies a day rate. Every number below is an assumption you can check against real quotes.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
            <li>
              <b>Review speed:</b> about {LINES_PER_ENGINEER_DAY} lines of straightforward Anchor code per
              engineer-day, with a minimum of {MIN_ENGINEER_DAYS} engineer-days for any audit.
            </li>
            <li>
              <b>Complexity:</b>{' '}
              {COMPLEXITY.map((c) => `${c.label} ×${c.factor}`).join(', ')}.
            </li>
            <li>
              <b>Framework:</b> {FRAMEWORK.map((f) => `${f.label} ×${f.factor}`).join(', ')}, because native
              programs hand-write validation that Anchor generates.
            </li>
            <li>
              <b>Integrations:</b> {INTEGRATIONS.map((i) => `${i.label.split(' (')[0]} ×${i.factor}`).join(', ')}.
            </li>
            <li>
              <b>Extra programs:</b> +{EXTRA_PROGRAM_DAYS} engineer-day for each program beyond the first,
              for the interactions between them.
            </li>
            <li>
              <b>Fix review:</b> ×{FIX_REVIEW_FACTOR}. <b>Rush start within two weeks:</b> ×{RUSH_FACTOR} on price.
            </li>
            <li>
              <b>Day rate:</b> {formatUsd(DAY_RATE_LOW)} to {formatUsd(DAY_RATE_HIGH)} per engineer-day, a
              range that covers most independent Solana security firms. The best-known firms can charge
              more, and competitive audit platforms price differently.
            </li>
            <li>
              <b>Calendar time:</b> two engineers working in parallel at the fast end, one engineer at the
              slow end.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            The estimate does not cover economic or design reviews, formal verification, re-audits of
            later upgrades or a bug bounty. For what drives real quotes, read{' '}
            <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
              how much a Solana audit costs
            </Link>{' '}
            and{' '}
            <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
              how to choose a Solana auditor
            </Link>
            .
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

          <div className="mt-12 rounded-2xl bg-ink p-7 text-white">
            <h2 className="font-heading text-xl font-semibold">Before you book an audit</h2>
            <p className="mt-2 text-sm text-white/75">
              Go through the pre-launch security checklist so the auditors spend their time on real
              issues, then compare verified Solana auditors.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/blog/solana-pre-launch-security-checklist" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink">
                Pre-launch checklist →
              </Link>
              <Link href="/solana-smart-contract-audits" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                Verified auditors →
              </Link>
            </div>
          </div>
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
