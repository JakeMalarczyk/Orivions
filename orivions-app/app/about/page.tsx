import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { SITE_URL, ogImageUrl } from '@/lib/blog';

const DESCRIPTION =
  'Orivions is the verified B2B marketplace for onchain teams. How it works for teams and providers, how verification works, how Orivions makes money, and the principles behind it.';

export const metadata: Metadata = {
  title: 'About Orivions: the verified B2B marketplace for onchain teams',
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    title: 'About Orivions',
    description: DESCRIPTION,
    url: '/about',
    images: [{ url: ogImageUrl('The verified B2B marketplace for onchain teams', 'About Orivions'), width: 1200, height: 630 }],
  },
};

// Answer-first facts. Short, self-contained sentences are what AI answer
// engines quote, so each line must be true on its own.
const FACTS: [string, string][] = [
  ['What it is', 'A B2B marketplace where onchain teams find and hire human-verified auditors, developers and agencies.'],
  ['Categories', 'Smart contract audits, development, marketing and growth, and more.'],
  ['Who it is for', 'Funded Solana projects hiring outside help, and service companies looking for Solana clients.'],
  ['Price for clients', 'Free. Searching, matching and contacting providers costs nothing.'],
  ['Price for providers', 'A flat 10% success fee on completed engagements. No subscriptions, no listing fees.'],
  ['Matching', 'Smart Match (AI) suggests the 1 to 3 best-fitting verified providers, with a reason for each.'],
  ['Scope', 'Onchain teams. Our guides and tools currently cover Solana.'],
];

const PRINCIPLES: [string, string][] = [
  ['Verified by people, not by payment', 'A person checks every provider before the Verified badge appears. There are no paid placements: the badge, ranking and matches are never for sale.'],
  ['Ranked by fit', 'Smart Match orders providers by how well they fit the need you describe, not by who pays.'],
  ['Free for the teams that hire', 'Clients never pay to search, match or contact. Providers pay only when work is completed.'],
  ['Depth over breadth', 'One ecosystem, understood properly. Solana programs, audits and launches have their own pitfalls, and generic directories miss them.'],
  ['Transparent by default', 'Pricing is public, there are no paid placements, and progress and market data are published on the blog.'],
];

const CLIENT_STEPS: [string, string][] = [
  ['Describe what you need', 'In plain English: what you are building, timeline and budget. No account required.'],
  ['Get matched', 'Smart Match suggests up to three verified providers and explains why each fits.'],
  ['Talk directly', 'Contact providers yourself, compare proposals and agree milestones. Orivions stays free for you.'],
];

const PROVIDER_STEPS: [string, string][] = [
  ['Create a profile', 'Company details, services, indicative price ranges and portfolio.'],
  ['Get verified', 'A person reviews your profile and work before the Verified badge is granted.'],
  ['Win work', 'Receive requests from Solana teams that match what you do. Pay 10% only on completed engagements.'],
];

const VERIFICATION: [string, string][] = [
  ['Real company', 'A real, reachable business with a working website and identifiable people behind it.'],
  ['Portfolio confirmed', 'At least one portfolio project confirmed independently: a public report, a shipped product or the client itself.'],
  ['Client reference', 'A past client confirms the work and how the engagement went.'],
  ['A 15-minute call', 'A person at Orivions talks to the team. Development and security firms also answer a technical Solana question.'],
];

const FAQS: [string, string][] = [
  ['Is Orivions free?', 'Yes, for clients. Teams search, use Smart Match and contact providers for free. Providers pay a flat 10% success fee only when an engagement found through Orivions is completed.'],
  ['What does "Verified" mean on Orivions?', 'A person at Orivions checked that the provider is a real company, that its portfolio holds up and that its services and price ranges are specific. It lowers risk but does not replace your own checks and references.'],
  ['Which ecosystems does Orivions cover?', 'Orivions is built for onchain teams. Our guides, calculators and glossary currently cover Solana, where hiring well needs specific knowledge: Rust and Anchor, the account model and Solana audit practices.'],
];

function Steps({ items }: { items: [string, string][] }) {
  return (
    <ol className="mt-4 space-y-3">
      {items.map(([lead, rest], i) => (
        <li key={lead} className="flex gap-4 rounded-2xl border border-line p-5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
            {i + 1}
          </span>
          <div>
            <div className="font-semibold">{lead}</div>
            <p className="mt-1 text-[15px] leading-relaxed text-[#27272E]">{rest}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-14 font-heading text-[24px] font-semibold tracking-tight">{children}</h2>;
}

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
          { '@type': 'ListItem', position: 2, name: 'About', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-12 pt-12">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> / About
        </p>

        <div className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-deep">About Orivions</div>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[42px]">
          The verified B2B marketplace for onchain teams.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray">
          Orivions helps onchain teams find auditors, developers and growth partners they can actually
          trust. Describe what you need in plain English, and Smart Match suggests the one to three
          best-fitting providers, each checked by a person before being marked Verified.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/smart-match" className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white">
            Find a provider
          </Link>
          <Link href="/login" className="rounded-xl border border-line bg-white px-6 py-3 text-sm font-semibold">
            List your company
          </Link>
        </div>

        <dl className="mt-12 divide-y divide-line rounded-2xl border border-line">
          {FACTS.map(([k, v]) => (
            <div key={k} className="grid gap-1 p-4 sm:grid-cols-[170px_1fr]">
              <dt className="text-sm font-semibold">{k}</dt>
              <dd className="text-sm text-gray">{v}</dd>
            </div>
          ))}
        </dl>

        <H2>Why Orivions exists</H2>
        <p className="mt-4 leading-relaxed text-[#27272E]">
          Thousands of funded Solana teams need auditors, developers and growth partners, and
          thousands of companies offer those services. Yet most hiring still happens through Discord
          recommendations and cold DMs, where a proven team and a confident one look the same. A bad
          hire on Solana is not just a delay: it can mean an exploited program or a failed launch.
        </p>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          Orivions makes the first step verifiable. Every provider is checked by a person, every
          match comes with a reason, and teams pay nothing to use it. The longer story is in{' '}
          <Link href="/blog/why-we-are-building-orivions" className="text-blue-deep">
            why we are building Orivions
          </Link>
          .
        </p>

        <H2>Our principles</H2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map(([lead, rest]) => (
            <div key={lead} className="rounded-2xl border border-line bg-bg-soft p-5">
              <div className="font-semibold">{lead}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray">{rest}</p>
            </div>
          ))}
        </div>

        <H2>How it works</H2>
        <div className="mt-2 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-soft">For Solana teams</h3>
            <Steps items={CLIENT_STEPS} />
          </div>
          <div>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-soft">For service providers</h3>
            <Steps items={PROVIDER_STEPS} />
          </div>
        </div>

        <H2>How verification works</H2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {VERIFICATION.map(([lead, rest], i) => (
            <div key={lead} className="rounded-2xl border border-line p-5">
              <div className="text-xs font-bold text-blue-deep">Check {i + 1}</div>
              <div className="mt-1 font-semibold">{lead}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray">{rest}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray">
          All four checks must pass.{' '}
          <Link href="/how-we-verify" className="text-blue-deep">
            How we verify providers
          </Link>{' '}
          has the full process and the red flags that lead to a rejection. Verification lowers risk; it
          is not a guarantee. For any significant engagement, review the
          provider&apos;s work and agree scope, milestones and ownership in writing. Our guides on{' '}
          <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">
            verifying a Web3 agency
          </Link>{' '}
          and{' '}
          <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
            red flags when hiring
          </Link>{' '}
          explain what to check.
        </p>

        <H2>How Orivions makes money</H2>
        <p className="mt-4 leading-relaxed text-[#27272E]">
          Providers pay a flat 10% success fee when an engagement found through Orivions is
          completed. Clients never pay. That is the only way we earn: no subscriptions, no listing
          fees and no paid placements. Ranking and matches are never for sale.
        </p>

        <H2>Frequently asked questions</H2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {FAQS.map(([q, a]) => (
            <div key={q} className="py-4">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray">{a}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-ink p-7 text-white">
            <h2 className="font-heading text-xl font-semibold">Hiring on Solana?</h2>
            <p className="mt-2 text-sm text-white/75">
              Describe your project and get matched with verified providers. Free, no account needed.
            </p>
            <Link href="/smart-match" className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink">
              Try Smart Match →
            </Link>
          </div>
          <div className="rounded-2xl border border-line bg-bg-soft p-7">
            <h2 className="font-heading text-xl font-semibold">Offer services to Solana teams?</h2>
            <p className="mt-2 text-sm text-gray">
              Create a free profile, get verified and receive matching requests. Pay only on
              completed work.
            </p>
            <Link href="/login" className="mt-4 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white">
              List your company →
            </Link>
          </div>
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
