import { ldJson } from '@/lib/jsonLd';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import HeroCtas from './HeroCtas';
import WaitlistForm from './WaitlistForm';

// Shown on the page and emitted as FAQPage JSON-LD, so answer engines can quote them.
const FAQS: [string, string][] = [
  [
    'What is Orivions?',
    'Orivions is the verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies. Free for clients; providers pay a 10% success fee only on completed work. It replaces hiring through Discord, X, or word-of-mouth.',
  ],
  [
    'Is Orivions free?',
    'Yes, for clients. Searching, comparing, and contacting providers costs nothing. Providers pay a flat 10% success fee only when a real engagement is completed through the platform - no subscriptions, no placement fees.',
  ],
  [
    'How does Smart Match work?',
    'You describe what you need in plain English and get up to three verified providers that fit, with a specific reason for each. During early access, our team hand-picks every shortlist; automatic matching switches on as the verified network grows. No account or RFQ form is needed.',
  ],
  [
    'What does "verified" mean on Orivions?',
    'A person at Orivions has checked the provider: real company, real portfolio and services, transparent price ranges. No paid placements: ranking and matches are never for sale.',
  ],
];

const STEPS: [string, string][] = [
  ['Describe the project', 'A few plain sentences. No forms.'],
  ['Get a shortlist', 'Up to three verified providers, each with a reason.'],
  ['Talk to them directly', 'No middleman. No commission from you.'],
];

const CHECKS: [string, string][] = [
  ['The company is real', 'Reachable, with identifiable people.'],
  ['Independent proof', 'One project checked against an outside source.'],
  ['A client reference', 'A past client confirms the work.'],
  ['A 15-minute call', 'We talk to the team ourselves.'],
];

const CATEGORIES: [string, string, string][] = [
  ['/solana-smart-contract-audits', 'Smart contract audits', 'Security reviews of Solana programs.'],
  ['/solana-development-companies', 'Development companies', 'Teams that build programs and dApps.'],
  ['/solana-marketing-growth-agencies', 'Marketing and growth', 'Agencies that launch onchain products.'],
];

export const metadata: Metadata = {
  title: 'Orivions: Verified B2B Marketplace for Onchain Teams',
  description:
    'The verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies. Free for clients.',
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

      <section className="px-8 pb-20 pt-16 md:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-heading text-[40px] font-medium leading-[1.05] tracking-tight md:text-[56px]">
              The{' '}
              <span className="bg-gradient-to-r from-blue-deep to-blue-light bg-[length:100%_4px] bg-[position:0_92%] bg-no-repeat">
                verified
              </span>{' '}
              B2B marketplace for onchain teams.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-gray">
              Describe what you need. We pick verified auditors, developers and agencies, and tell you why. Free for clients.
            </p>
            <Suspense fallback={null}>
              <HeroCtas />
            </Suspense>
          </div>

          {/* Illustration of what a shortlist looks like; the providers are placeholders. */}
          <figure className="rounded-xl border border-line bg-white p-6 shadow-[0_1px_0_rgba(11,21,48,0.04),0_16px_40px_-18px_rgba(29,78,216,0.35)]">
            <figcaption className="text-xs font-semibold uppercase tracking-wider text-gray-soft">
              Example shortlist
            </figcaption>
            <p className="mt-3 border-l-2 border-blue-deep pl-4 text-[15px] leading-relaxed">
              &ldquo;Anchor lending program, mainnet in six weeks. Need an independent security review.&rdquo;
            </p>
            <ul className="mt-5 divide-y divide-line">
              {[
                ['Security auditor', 'Published Anchor reviews. Has a slot in your window.'],
                ['Audit team', 'Includes a fix review. Price stated up front.'],
                ['Boutique reviewer', 'Smaller scope. Fits a tighter budget.'],
              ].map(([role, why]) => (
                <li key={role} className="flex gap-3 py-3.5">
                  <span aria-hidden className="mt-1 h-4 w-4 shrink-0 rounded-full bg-blue-deep text-center text-[10px] leading-4 text-white">
                    ✓
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{role}</div>
                    <div className="mt-0.5 text-sm text-gray">{why}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-soft">Illustration.</p>
          </figure>
        </div>
      </section>

      <section id="how" className="border-t border-line px-8 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
              Hiring here runs on DMs and referrals.
            </h2>
            <p className="mt-4 max-w-sm text-gray">
              We replace the Discord thread with a short, checked list.
            </p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
                <span className="font-heading text-2xl text-blue-deep">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-gray">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="verified"
        className="bg-ink px-8 py-20 text-white [background-image:radial-gradient(60%_80%_at_85%_0%,rgba(56,189,248,0.22),transparent_70%),radial-gradient(50%_70%_at_0%_100%,rgba(29,78,216,0.35),transparent_70%)]"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Verified means four checks, by a person.
          </h2>
          <dl className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {CHECKS.map(([name, text]) => (
              <div key={name} className="border-t border-blue-light/40 pt-4">
                <dt className="font-semibold">{name}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-white/70">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-sm text-white/70">
            Verification cannot be bought.{' '}
            <Link href="/how-we-verify" className="font-semibold text-white underline underline-offset-4">
              How we verify
            </Link>
          </p>
        </div>
      </section>

      <section id="start" className="px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">Where to start</h2>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {CATEGORIES.map(([href, name, desc]) => (
              <li key={href}>
                <Link href={href} className="group flex items-center justify-between gap-6 py-6">
                  <div>
                    <div className="font-heading text-2xl font-medium">{name}</div>
                    <div className="mt-1 text-gray">{desc}</div>
                  </div>
                  <span aria-hidden className="text-2xl text-blue-light transition group-hover:translate-x-1 group-hover:text-blue-deep">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-gray">
            Offer these services?{' '}
            <Link href="/founding-providers" className="font-semibold text-ink underline underline-offset-4">
              List your company
            </Link>
            . Providers pay 10% only on completed work.
          </p>
        </div>
      </section>

      <section id="faq" className="bg-bg-soft px-8 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">Questions</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}
                  <span aria-hidden className="text-xl text-gray-soft transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-xl text-gray">{a}</p>
              </details>
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
          __html: ldJson({
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
