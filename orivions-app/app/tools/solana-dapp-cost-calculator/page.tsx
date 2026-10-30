import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { formatUsd } from '@/lib/auditEstimate';
import {
  BACKEND,
  EXTRAS,
  EXTRA_PROGRAM_SHARE,
  FRONTEND,
  INTEGRATIONS,
  MAINTENANCE_SHARE,
  OVERHEAD,
  PROGRAM_TYPES,
  TEAMS,
  estimateDapp,
  type DappInput,
} from '@/lib/dappEstimate';
import DappCalculator from './DappCalculator';

// Free tool page. The calculator is client-side, but everything a crawler or AI
// answer engine needs (worked examples, methodology, FAQ) is rendered on the
// server from the same constants the calculator uses.

const PATH = '/tools/solana-dapp-cost-calculator';
const TITLE = 'Solana dApp development cost calculator';
const DESCRIPTION =
  'Free calculator: estimate what a Solana dApp costs to build and how long it takes, from programs, frontend, backend and team type. No signup.';
const OG_TITLE = 'How much will your Solana dApp cost to build?';

export const metadata: Metadata = {
  title: 'Solana dApp Cost Calculator (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl(OG_TITLE, 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl(OG_TITLE, 'Free tool')],
  },
};

const EXAMPLES: { label: string; input: DappInput }[] = [
  {
    label: 'Vesting program with a basic interface, freelancer',
    input: { programType: 'simple', programs: 1, integrations: 'none', frontend: 'basic', backend: 'none', extras: [], team: 'freelancer' },
  },
  {
    label: 'NFT marketplace with a production app, agency',
    input: { programType: 'standard', programs: 1, integrations: 'none', frontend: 'production', backend: 'basic', extras: ['design'], team: 'agency' },
  },
  {
    label: 'Lending protocol, 2 programs, oracle, agency',
    input: { programType: 'defi', programs: 2, integrations: 'few', frontend: 'production', backend: 'full', extras: ['design', 'admin'], team: 'agency' },
  },
  {
    label: 'Consumer app on existing protocols, web and mobile, agency',
    input: { programType: 'none', programs: 1, integrations: 'none', frontend: 'polished', backend: 'basic', extras: ['design', 'mobile'], team: 'agency' },
  },
];

const examples = EXAMPLES.map((e) => ({ ...e, result: estimateDapp(e.input) }));

const FAQS = [
  {
    q: 'How much does it cost to build a Solana dApp?',
    a: `A simple program with a basic interface built by a freelancer comes out at about ${formatUsd(examples[0]!.result.costLow)} to ${formatUsd(examples[0]!.result.costHigh)} with our method. A full DeFi protocol with several programs, a production app and backend built by an agency commonly runs from tens of thousands to well over $100,000, before the audit. Scope, not the blockchain, moves the number.`,
  },
  {
    q: 'How long does it take to build a Solana dApp?',
    a: 'A small, well-scoped MVP can take a few weeks. A production protocol with several programs, an audit and fixes usually takes several months, and audit slots often have a waiting list, so book one early.',
  },
  {
    q: 'Should I hire a freelancer or an agency?',
    a: 'A freelancer is often cheaper per day and fine for a focused, well-specified piece of work. An agency costs more per day but brings design, frontend, backend, QA and project management, and can work in parallel to ship sooner.',
  },
  {
    q: 'What costs are not included in this estimate?',
    a: 'The independent audit and fix review, RPC and indexing services, token listing and liquidity, marketing, legal work, and the time your own team spends on reviews and decisions.',
  },
];

export default function DappCostCalculatorPage() {
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
          { '@type': 'ListItem', position: 3, name: 'dApp cost calculator', item: url },
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
            <Link href="/tools" className="hover:text-white">Free tools</Link> / dApp cost calculator
          </>
        }
        title={TITLE}
        lede={
          <>
            Estimate what it costs to build your Solana dApp and how long it takes: programs, frontend,
          backend and the team that builds it. The range updates as you go. No signup, and nothing you
          enter leaves your browser.
          </>
        }
      />
      <div className="mx-auto max-w-5xl px-8 pb-20 pt-10">

        <div className="mt-8">
          <DappCalculator />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">Solana dApp cost examples</h2>
          <p className="mt-2 text-sm text-gray">Build cost only, before the audit.</p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Developer-days</th>
                  <th className="px-4 py-3 font-semibold">Calendar time</th>
                  <th className="px-4 py-3 font-semibold">Indicative cost</th>
                </tr>
              </thead>
              <tbody>
                {examples.map(({ label, result }) => (
                  <tr key={label} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">{label}</td>
                    <td className="px-4 py-3 tabular-nums">{result.devDays}</td>
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
            Development is priced by time, so the calculator adds up developer-days for each part of the
            product and applies a day rate for the type of team. Every number below is an assumption you
            can check against real quotes.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
            <li>
              <b>First program:</b>{' '}
              {PROGRAM_TYPES.filter((p) => p.days).map((p) => `${p.label} ${p.days} days`).join(', ')}.
              Each extra program adds {Math.round(EXTRA_PROGRAM_SHARE * 100)}% of the first.
            </li>
            <li>
              <b>Integrations:</b> {INTEGRATIONS.map((i) => `${i.label.split(' (')[0]} ×${i.factor}`).join(', ')} on program work.
            </li>
            <li>
              <b>Frontend:</b> {FRONTEND.filter((f) => f.days).map((f) => `${f.label} ${f.days} days`).join(', ')}.
            </li>
            <li>
              <b>Backend and indexing:</b> {BACKEND.filter((b) => b.days).map((b) => `${b.label} ${b.days} days`).join(', ')}.
            </li>
            <li>
              <b>Extras:</b> {Object.values(EXTRAS).map((e) => `${e.label} ${e.days} days`).join(', ')}.
            </li>
            <li>
              <b>Testing, QA, deployment and project management:</b> ×{OVERHEAD} on everything.
            </li>
            <li>
              <b>Day rates:</b>{' '}
              {TEAMS.map((t) => `${t.label} ${formatUsd(t.rateLow)} to ${formatUsd(t.rateHigh)}`).join('; ')}.
              Calendar time assumes {TEAMS.map((t) => `${t.people} ${t.people > 1 ? 'people' : 'person'} for ${t.label}`).join(' and ')}.
            </li>
            <li>
              <b>Maintenance:</b> {Math.round(MAINTENANCE_SHARE[0] * 100)}% to {Math.round(MAINTENANCE_SHARE[1] * 100)}% of the
              build cost per year, a common rule of thumb.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            The audit is not included. Estimate it with the{' '}
            <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">
              Solana audit cost calculator
            </Link>
            , and read{' '}
            <Link href="/blog/how-much-does-it-cost-to-build-a-solana-dapp" className="text-blue-deep">
              how much a Solana dApp costs
            </Link>{' '}
            for what moves the budget most.
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
            <h2 className="font-heading text-xl font-semibold">Turn the estimate into a real quote</h2>
            <p className="mt-2 text-sm text-white/75">
              Write a short brief with our free template, then compare verified Solana development teams.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/blog/solana-project-brief-template" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink">
                Project brief template →
              </Link>
              <Link href="/solana-development-companies" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                Verified dev teams →
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
