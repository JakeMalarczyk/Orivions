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
  ['Describe the project', 'Say what you are building, your stage, budget and timeline. A few plain sentences are enough. No account, no RFQ form.'],
  ['Get a shortlist with reasons', 'A person at Orivions picks up to three verified providers and writes why each one fits your scope. Early access means every shortlist is hand-checked.'],
  ['Talk to them directly', 'Message the providers you like, compare proposals and agree scope and milestones in writing. Orivions takes no commission from you.'],
];

const FOR_TEAMS: [string, string][] = [
  ['Verified by a person', 'Real company, confirmed portfolio, a client reference and a call. No paid placements, ever.'],
  ['A shortlist, not a directory', 'Up to three providers that fit, each with a specific reason. No scrolling through hundreds of profiles.'],
  ['Free for teams', 'Searching, matching and contacting providers costs nothing, and we take no cut from you.'],
  ['Prices before calls', 'Providers state indicative ranges. Free calculators estimate an audit or a dApp build before you ask for quotes.'],
  ['Guides that help you buy', 'Checklists, a brief template, audit timelines and a Solana glossary, written to make you a sharper client.'],
  ['Direct line to the provider', 'You talk to the team that will do the work. Agree scope, milestones and ownership in writing.'],
];

const FOR_PROVIDERS: [string, string][] = [
  ['Verified badge', 'Four checks, decided within 48 hours of receiving what we need. Free, and it cannot be bought.'],
  ['Briefs that match', 'Teams describe their project and we route it to the providers who fit, instead of a cold-DM lottery.'],
  ['Pay only on completed work', 'A flat 10% success fee. No subscription, no listing fee, no placement fee.'],
  ['Founding Provider status', 'The first twenty verified companies get a permanent Founding badge and first access to incoming briefs.'],
];

const CHECKS: [string, string][] = [
  ['The company is real', 'A reachable business with a working website and identifiable people behind it, confirmed outside its own website.'],
  ['Independent proof', 'At least one portfolio project checked against a source the provider does not control: a public audit report, a shipped product, a repository or the client.'],
  ['A client reference', 'A past client confirms the work was done by this provider and tells us how the engagement went.'],
  ['A 15-minute call', 'A person at Orivions talks to the team. Development and security firms also answer a technical Solana control question.'],
];

const RED_FLAGS = [
  'Impossible guarantees, such as "100% bug-free code"',
  'Invented traction, followers or client logos',
  'Pressure to verify now and check later',
  'A portfolio that belongs to another team',
];

const RESOURCES: [string, string, string][] = [
  ['/tools/solana-audit-cost-calculator', 'Audit cost calculator', 'Estimate a Solana audit from code size and complexity.'],
  ['/tools/solana-dapp-cost-calculator', 'dApp cost calculator', 'Where the money goes when you build on Solana.'],
  ['/blog/solana-project-brief-template', 'Project brief template', 'One page that makes every quote comparable.'],
  ['/blog/how-to-choose-a-solana-smart-contract-auditor', 'How to choose an auditor', 'A practical checklist for your mainnet date.'],
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

      <section className="relative overflow-hidden bg-ink px-8 pb-24 pt-16 text-white md:pt-24 [background-image:radial-gradient(55%_70%_at_90%_0%,rgb(var(--c-blue-deep)/0.55),transparent_70%),radial-gradient(45%_60%_at_5%_100%,rgb(var(--c-blue-light)/0.28),transparent_70%)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(75%_80%_at_50%_30%,black,transparent)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-heading text-[40px] font-medium leading-[1.05] tracking-tight md:text-[56px]">
              The{' '}
              <span className="bg-gradient-to-r from-blue-light to-white bg-[length:100%_4px] bg-[position:0_92%] bg-no-repeat">
                verified
              </span>{' '}
              B2B marketplace for onchain teams.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/70">
              Describe what you need. We pick verified auditors, developers and agencies, and tell you why. Free for clients.
            </p>
            <Suspense fallback={null}>
              <HeroCtas />
            </Suspense>
          </div>

          {/* Illustration of what a shortlist looks like; the providers are placeholders. */}
          <figure className="rounded-xl border border-line bg-white p-6 text-ink shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_30px_80px_-20px_rgb(var(--c-blue-light)/0.55)]">
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
              Solana has thousands of builders and no trusted place to find them. We replace the
              Discord thread with a short, checked list.
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

      <section id="teams" className="bg-bg-soft px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-deep">For teams</div>
            <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight md:text-4xl">
              Everything you need to hire well, none of the noise.
            </h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            {FOR_TEAMS.map(([title, desc]) => (
              <div key={title} className="bg-white p-7">
                <div aria-hidden className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-deep to-blue-light" />
                <h3 className="mt-5 font-heading text-xl font-medium">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="verified"
        className="bg-ink px-8 py-20 text-white [background-image:radial-gradient(60%_80%_at_85%_0%,rgb(var(--c-blue-light)/0.22),transparent_70%),radial-gradient(50%_70%_at_0%_100%,rgb(var(--c-blue-deep)/0.35),transparent_70%)]"
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
          <div className="mt-12 rounded-xl border border-white/15 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-light">What fails a provider</div>
            <ul className="mt-4 grid gap-3 text-[15px] text-white/80 md:grid-cols-2">
              {RED_FLAGS.map((f) => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-light" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-10 text-sm text-white/70">
            Verification is free and cannot be bought.{' '}
            <Link href="/how-we-verify" className="font-semibold text-white underline underline-offset-4">
              How we verify
            </Link>
          </p>
        </div>
      </section>

      <section id="providers" className="px-8 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-deep">For providers</div>
            <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight md:text-4xl">
              Win work from teams that already know what they need.
            </h2>
            <p className="mt-4 max-w-sm text-gray">
              Free to list. You pay 10% only when an engagement is completed.
            </p>
            <Link
              href="/founding-providers"
              className="mt-7 inline-block rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-deep"
            >
              Become a Founding Provider
            </Link>
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {FOR_PROVIDERS.map(([title, desc]) => (
              <div key={title} className="border-t border-line pt-4">
                <dt className="font-heading text-xl font-medium">{title}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-gray">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="resources" className="bg-bg-soft px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">Useful before you hire</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESOURCES.map(([href, title, desc]) => (
              <Link
                key={href}
                href={href}
                className="group rounded-xl border border-line bg-white p-6 transition hover:border-blue-deep hover:shadow-[0_16px_40px_-24px_rgb(var(--c-blue-deep)/0.5)]"
              >
                <h3 className="font-heading text-xl font-medium group-hover:text-blue-deep">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray">{desc}</p>
                <span aria-hidden className="mt-5 inline-block text-blue-light transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
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
