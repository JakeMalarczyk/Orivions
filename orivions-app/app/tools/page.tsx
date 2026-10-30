import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';

// Hub for the free calculators. Each tool also links back here via its breadcrumb.

const DESCRIPTION =
  'Free tools for Solana teams: estimate what an audit costs, what building a dApp costs, and how long each takes. Transparent methods, no signup.';

const TOOLS = [
  {
    href: '/tools/solana-audit-cost-calculator',
    title: 'Solana audit cost calculator',
    text: 'Price range, engineer-days and calendar time for auditing your Solana programs, from lines of code, complexity, framework and integrations.',
  },
  {
    href: '/tools/solana-dapp-cost-calculator',
    title: 'Solana dApp cost calculator',
    text: 'Build cost and timeline for your dApp: programs, frontend, backend, extras, and whether a freelancer or an agency builds it.',
  },
  {
    href: '/ai-proposal-generator',
    title: 'AI proposal generator',
    text: 'For providers: turn a client brief into a structured proposal with scope, milestones and pricing.',
  },
];

export const metadata: Metadata = {
  title: 'Free Tools for Solana Teams',
  description: DESCRIPTION,
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Free tools for Solana teams',
    description: DESCRIPTION,
    url: '/tools',
    images: [{ url: ogImageUrl('Free tools for Solana teams', 'Tools'), width: 1200, height: 630 }],
  },
};

export default function ToolsPage() {
  const url = `${SITE_URL}/tools`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name: 'Free tools for Solana teams',
        description: DESCRIPTION,
        url,
        publisher: { '@id': `${SITE_URL}/#organization` },
        hasPart: TOOLS.map((t) => ({ '@type': 'WebApplication', name: t.title, url: `${SITE_URL}${t.href}` })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Free tools', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        narrow
        eyebrow="Free tools"
        title="Free tools for Solana teams"
        lede="Plan your budget before you talk to providers. Every calculator shows its method and assumptions, so you can check the numbers against real quotes."
      />
      <div className="mx-auto max-w-3xl px-8 pb-20 pt-10">
        <ul className="space-y-3">
          {TOOLS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="block rounded-2xl border border-line p-6 hover:border-blue-deep">
                <span className="font-heading text-lg font-semibold">{t.title} →</span>
                <span className="mt-1.5 block text-sm text-gray">{t.text}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-heading text-[22px] font-semibold">How to use these tools</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
          Start with the dApp cost calculator to size the whole build, then use the audit cost
          calculator to add security review to the plan. Both give a range, not a quote: use it to
          sanity-check offers and to decide how much runway a launch needs. When you are ready to
          talk to people, describe the project in{' '}
          <Link href="/smart-match" className="text-blue-deep">Smart Match</Link> or browse{' '}
          <Link href="/solana-smart-contract-audits" className="text-blue-deep">verified Solana auditors</Link> and{' '}
          <Link href="/solana-development-companies" className="text-blue-deep">development companies</Link>.
        </p>
      </div>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
    </>
  );
}
