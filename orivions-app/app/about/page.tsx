import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { SITE_URL, ogImageUrl } from '@/lib/blog';

const DESCRIPTION =
  'Orivions is a verified B2B marketplace for the Solana ecosystem. Who builds it, how provider verification works, how Orivions makes money, and what it will not do.';

export const metadata: Metadata = {
  title: 'About Orivions',
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    title: 'About Orivions',
    description: DESCRIPTION,
    url: '/about',
    images: [{ url: ogImageUrl('About Orivions', 'Company'), width: 1200, height: 630 }],
  },
};

// Answer-first facts. Short, self-contained sentences are what AI answer
// engines quote, so each line must be true on its own.
const FACTS: [string, string][] = [
  ['What it is', 'A B2B marketplace where Solana teams find and hire human-verified service providers.'],
  ['Who it is for', 'Funded Solana projects hiring auditors, developers or growth agencies, and service companies looking for Solana clients.'],
  ['Price for clients', 'Free. Searching, matching and contacting providers costs nothing.'],
  ['Price for providers', 'A flat 10% success fee on completed engagements. No subscriptions, no listing fees.'],
  ['Scope', 'Solana only, by design.'],
  ['Founder', 'Jakub Malarczyk.'],
];

const STEPS: [string, string][] = [
  ['Real company', 'We confirm the provider is a real, reachable business with a working website and identifiable people behind it.'],
  ['Relevant work', 'We review the portfolio for Solana-specific delivery: programs, audits, launches or campaigns we can check.'],
  ['Clear offer', 'Services and indicative price ranges must be specific enough for a client to compare.'],
  ['Human decision', 'A person at Orivions makes the call. Paying for visibility never buys the Verified badge.'],
];

export default function AboutPage() {
  const url = `${SITE_URL}/about`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#page`,
        url,
        name: 'About Orivions',
        description: DESCRIPTION,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        mainEntity: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'About', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-2xl px-6 pb-12 pt-12">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> / About
        </p>
        <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[34px]">
          About Orivions
        </h1>
        <p className="mt-4 text-lg text-gray">
          Orivions is a verified B2B marketplace for the Solana ecosystem. Teams describe what they
          need in plain English, and Smart Match suggests the one to three best-fitting
          human-verified providers, with a reason for each match.
        </p>

        <dl className="mt-8 divide-y divide-line rounded-2xl border border-line">
          {FACTS.map(([k, v]) => (
            <div key={k} className="grid gap-1 p-4 sm:grid-cols-[170px_1fr]">
              <dt className="text-sm font-semibold">{k}</dt>
              <dd className="text-sm text-gray">{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-12 font-heading text-[22px] font-semibold">Why we built it</h2>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          Thousands of funded Solana teams need auditors, developers and growth partners, and
          thousands of companies offer those services. Yet most hiring still happens through
          Discord recommendations and cold DMs, where it is hard to tell a proven team from a
          confident one. Orivions exists to make that first step verifiable. The full story is in{' '}
          <Link href="/blog/why-we-are-building-orivions" className="text-blue-deep">
            why we are building Orivions
          </Link>
          .
        </p>

        <h2 className="mt-12 font-heading text-[22px] font-semibold">How verification works</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map(([lead, rest], i) => (
            <li key={lead} className="rounded-2xl border border-line p-5">
              <div className="font-semibold">
                {i + 1}. {lead}
              </div>
              <p className="mt-1 text-[15px] leading-relaxed text-[#27272E]">{rest}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-gray">
          Verification lowers risk; it is not a guarantee. Always review a provider&apos;s work and
          agree scope, milestones and ownership in writing. Our guides on{' '}
          <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
            hiring a development company
          </Link>{' '}
          and{' '}
          <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
            choosing an auditor
          </Link>{' '}
          explain what to check.
        </p>

        <h2 className="mt-12 font-heading text-[22px] font-semibold">How Orivions makes money</h2>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          Providers pay a flat 10% success fee when an engagement found through Orivions is
          completed. Clients never pay. Providers can also buy clearly labeled sponsored placement;
          it affects where a listing appears, never whether it is verified, and Smart Match ranks by
          fit, not by payment.
        </p>

        <h2 className="mt-12 font-heading text-[22px] font-semibold">Who builds it</h2>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          Orivions is founded and built by <b>Jakub Malarczyk</b>, in public. Progress, numbers and
          lessons are published on the{' '}
          <Link href="/blog" className="text-blue-deep">blog</Link>, and the source code is on{' '}
          <a href="https://github.com/JakeMalarczyk/Orivions" className="text-blue-deep" rel="noopener">
            GitHub
          </a>
          .
        </p>

        <div className="mt-12 rounded-2xl bg-ink p-7 text-white">
          <h2 className="font-heading text-xl font-semibold">Looking for a Solana team?</h2>
          <p className="mt-2 text-sm text-white/75">
            Describe your project in plain English and get matched with verified providers. Free,
            no account needed.
          </p>
          <Link href="/smart-match" className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink">
            Try Smart Match →
          </Link>
        </div>
      </div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
