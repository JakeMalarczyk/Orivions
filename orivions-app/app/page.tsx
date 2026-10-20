import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import HeroCtas from './HeroCtas';
import WaitlistForm from './WaitlistForm';

// Shown on the page and emitted as FAQPage JSON-LD, so answer engines can quote them.
const FAQS: [string, string][] = [
  [
    'What is Orivions?',
    'Orivions is a verified B2B marketplace for the Solana ecosystem. It helps companies discover, compare, and hire verified service providers instead of relying on Discord, X, or word-of-mouth.',
  ],
  [
    'Is Orivions free?',
    'Yes, for clients. Searching, comparing, and contacting providers costs nothing. Providers pay a flat 10% success fee only when a real engagement is completed through the platform - no subscriptions, no placement fees.',
  ],
  [
    'How is Orivions different from Superteam Earn?',
    'Superteam Earn is a bounty marketplace for individual builders. Orivions is built for verified companies and ongoing B2B engagements: a different unit of trust, not a replacement.',
  ],
  [
    'How does Smart Match work?',
    'You describe what you need in plain English and get up to three verified providers that fit, with a specific reason for each. During early access, our team hand-picks every shortlist; automatic matching switches on as the verified network grows. No account or RFQ form is needed.',
  ],
  [
    'What does "verified" mean on Orivions?',
    'A person at Orivions has checked the provider: real company, real portfolio and services, transparent price ranges. Sponsored placements are always labeled and never mixed into organic results.',
  ],
];

export const metadata: Metadata = {
  title: 'Orivions: Business Infrastructure Layer for Solana',
  description:
    'The verified B2B marketplace for the Solana ecosystem. Discover, verify, and hire trusted providers. Free for clients.',
  alternates: {
    canonical: '/',
  },
};

// This whole page is a Server Component by default: it renders to HTML on the
// server (or at build time) and ships almost no JavaScript for the static parts.
// Only HeroCtas and WaitlistForm (which need onClick
// handlers or read the URL) are separately marked 'use client'; everything
// else here is plain, fast, zero-JS markup.
export default function HomePage() {
  return (
    <>
      <Header />

      <section className="px-8 pb-16 pt-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm text-gray">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-light" />
            Solana ecosystem
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            The{' '}
            <span className="bg-gradient-to-r from-blue-deep to-blue-light bg-clip-text text-transparent">
              business infrastructure layer
            </span>{' '}
            for the Solana ecosystem.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray">
            The professional home where Solana builders find, verify, and hire their next
            partner: developers, auditors, marketers, and more.
          </p>
          <Suspense fallback={null}>
            <HeroCtas />
          </Suspense>
        </div>
      </section>

      <section id="problem" className="bg-bg-soft px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">
            01 · The problem
          </div>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            The fastest blockchain still runs on the slowest business process.
          </h2>
          <p className="mt-4 max-w-2xl text-gray">
            Solana has thousands of builders, but no trusted place where businesses can find
            each other. Today that happens through Discord, X, Telegram, and private referrals:
            fragmented, slow, and impossible to verify.
          </p>
        </div>
      </section>

      <section id="solution" className="px-8 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">
            02 · The solution
          </div>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            Introducing Orivions.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['Discover partners', 'Search verified providers across every category your project needs.'],
              ['Showcase services', 'Providers build a profile, portfolio, and service catalog once.'],
              ['Verify providers', "Admin verification and reputation, so trust isn't a guessing game."],
              ['Receive leads', 'Providers get inbound contact requests from qualified clients.'],
              ['Collaborate', 'Everything needed to move from first contact to signed work.'],
              ['Grow', "Reputation compounds: the more you deliver, the more you're found."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-line p-6">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-bg-soft px-8 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">08 · FAQ</div>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            Questions people actually ask.
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-line bg-white p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-1.5 text-sm text-gray">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ask" className="px-8 py-20">
        <Suspense fallback={null}>
          <WaitlistForm />
        </Suspense>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map(([q, a]) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }),
        }}
      />
    </>
  );
}
