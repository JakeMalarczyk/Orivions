import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { SITE_URL, ogImageUrl } from '@/lib/blog';

// Public version of the provider verification SOP. Linked from every provider
// profile, the About page and llms.txt, so "Verified" has one checkable meaning.

const DESCRIPTION =
  'How Orivions verifies providers: four checks by a person, all required. A real company, a confirmed portfolio project, a client reference and a 15-minute call.';

export const metadata: Metadata = {
  title: 'How We Verify Providers',
  description: DESCRIPTION,
  alternates: { canonical: '/how-we-verify' },
  openGraph: {
    type: 'website',
    title: 'How Orivions verifies providers',
    description: DESCRIPTION,
    url: '/how-we-verify',
    images: [{ url: ogImageUrl('How we verify providers', 'Orivions'), width: 1200, height: 630 }],
  },
};

const CHECKS: [string, string][] = [
  [
    'The company is real',
    'A real, reachable business with a working website and identifiable people behind it. We confirm it exists outside its own website.',
  ],
  [
    'At least one portfolio project is confirmed independently',
    'We check one or more projects from the portfolio against a source the provider does not control: a published audit report linked by the audited project, a shipped product, a public repository or the client itself.',
  ],
  [
    'A client reference',
    'A past client confirms the work was done by this provider and tells us how the engagement went.',
  ],
  [
    'A 15-minute call',
    'A person at Orivions talks to the team. Development and security firms also answer a technical control question about Solana, so we know the people on the call understand the work.',
  ],
];

const RED_FLAGS: [string, string][] = [
  ['Impossible guarantees', 'such as "100% bug-free code" or guaranteed returns, listings or price action.'],
  ['Fake traction', 'invented volume, followers, users or client logos.'],
  ['Pressure to skip the process', 'asking us to verify now and check later, or to drop a check.'],
  ['Plagiarized portfolio', 'work that belongs to another team, or reports that were never published by the auditor named on them.'],
];

const FAQS: [string, string][] = [
  [
    'What does "Verified" mean on Orivions?',
    'A person at Orivions checked four things, and all four passed: the company is real, at least one portfolio project was confirmed independently, a past client gave a reference, and the team took a 15-minute call. Development and security firms also answered a technical Solana question.',
  ],
  [
    'Can a provider pay to get verified?',
    'No. Verification is free and cannot be bought. Providers pay a 10% success fee only on completed work. No paid placements: ranking and matches are never for sale.',
  ],
  [
    'How long does verification take?',
    'We decide within 48 hours of receiving everything we need: company details, portfolio links, a reference contact and a time for the call.',
  ],
  [
    'Can the Verified badge be removed?',
    'Yes. If the facts change, for example a reference turns out to be false or the company stops operating, a person at Orivions removes the badge.',
  ],
  [
    'Does verification guarantee the result of my project?',
    'No. It lowers the risk of hiring a team that is not what it claims to be. For any significant engagement, review the work yourself and agree scope, milestones and ownership in writing.',
  ],
];

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-14 font-heading text-[24px] font-semibold tracking-tight">{children}</h2>;
}

export default function HowWeVerifyPage() {
  const url = `${SITE_URL}/how-we-verify`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: 'How Orivions verifies providers',
        description: DESCRIPTION,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        dateModified: '2026-10-22T00:00:00+00:00',
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#process`,
        name: 'How Orivions verifies a service provider',
        step: CHECKS.map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: FAQS.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'How we verify', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-12 pt-12">
        <p className="text-sm text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> / How we verify
        </p>

        <div className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-deep">Verification</div>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[42px]">
          How we verify providers
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray">
          Every provider marked Verified on Orivions passed four checks, done by a person. All four are
          required. Verification is free and cannot be bought.
        </p>

        <H2>The four checks</H2>
        <ol className="mt-4 space-y-3">
          {CHECKS.map(([lead, rest], i) => (
            <li key={lead} className="flex gap-4 rounded-2xl border border-line p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold">{lead}</div>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/90">{rest}</p>
              </div>
            </li>
          ))}
        </ol>

        <H2>How the decision is made</H2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
          We decide within 48 hours of receiving everything we need, and every decision is recorded with
          its reason. Only an Orivions administrator can mark a provider as Verified; providers cannot
          change it themselves. If the facts change later, the badge is removed.
        </p>

        <H2>Red flags that mean a rejection</H2>
        <ul className="mt-4 space-y-2.5">
          {RED_FLAGS.map(([lead, rest]) => (
            <li key={lead} className="text-[15px] leading-relaxed text-ink/90">
              <span className="font-semibold">{lead}:</span> {rest}
            </li>
          ))}
        </ul>

        <H2>The &quot;Verified on Orivions&quot; badge</H2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
          Verified providers can show a &quot;Verified on Orivions&quot; badge on their own website. It links to
          their profile on Orivions, for example orivions.com/providers/&lt;name&gt;, so anyone can check that the
          badge is real and see what we checked. A badge that does not link to a live Orivions profile is not
          ours.
        </p>

        <H2>What verification is not</H2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
          Verification lowers the risk of hiring a team that is not what it claims to be. It is not a
          guarantee of the outcome of your project. Our guides on{' '}
          <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">verifying a Web3 agency</Link>,{' '}
          <Link href="/blog/how-to-read-a-smart-contract-audit-report" className="text-blue-deep">reading an audit report</Link>{' '}
          and{' '}
          <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">red flags when hiring</Link>{' '}
          cover the checks worth doing yourself.
        </p>

        <H2>Questions</H2>
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line">
          {FAQS.map(([q, a]) => (
            <div key={q} className="p-5">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink/90">{a}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link href="/providers" className="rounded-2xl border border-line p-5 hover:shadow-md">
            <div className="font-semibold">Find a verified provider →</div>
            <p className="mt-1 text-sm text-gray">Free for clients. Describe what you need or browse the directory.</p>
          </Link>
          <Link href="/founding-providers" className="rounded-2xl border border-line p-5 hover:shadow-md">
            <div className="font-semibold">Get verified →</div>
            <p className="mt-1 text-sm text-gray">Free profile and verification; 10% success fee only on completed work.</p>
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
