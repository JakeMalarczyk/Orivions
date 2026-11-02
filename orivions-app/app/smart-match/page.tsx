import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { isDirectoryOpen, verifiedProviderCount } from '@/lib/directory';
import FaqSection from '@/components/FaqSection';
import SmartMatchClient from './SmartMatchClient';

export const metadata: Metadata = {
  title: 'Smart Match: find a verified Solana provider',
  description: 'Describe your project and get a shortlist of verified Solana providers that fit, each with a reason. Free for teams.',
  alternates: {
    canonical: '/smart-match',
  },
};

// Re-check every 5 minutes whether enough providers are verified for automatic matching.
export const revalidate = 300;

const STEPS = [
  ['Describe the project', 'Say what you are building, your stage, budget and timeline. A few sentences are enough.'],
  ['We pick the fit', 'You get up to three verified Solana providers, each with a short reason it matches your scope.'],
  ['Talk to them directly', 'Message the providers you like. Orivions is free for teams and takes no commission from you.'],
];

const FAQS = [
  {
    q: 'What is Smart Match?',
    a: 'Smart Match turns a plain-English project brief into a shortlist of up to three verified providers, each with a short reason it fits your scope. It covers auditors, developers, legal and compliance firms and marketing agencies.',
  },
  {
    q: 'What should I put in the brief?',
    a: 'What you are building, what you need (for example an audit, development, legal review or launch support), your stage, budget and timeline. A few sentences are enough.',
  },
  {
    q: 'Does Smart Match cost anything?',
    a: 'No. It is free for teams and Orivions takes no commission from you. Providers pay a 10% success fee only on completed work.',
  },
  {
    q: 'Who picks the providers?',
    a: 'While the directory is in early access, the Orivions team matches you by hand from providers we have reviewed. Automatic matching switches on once enough providers are verified.',
  },
];

export default async function SmartMatchPage() {
  const autoMatch = isDirectoryOpen(await verifiedProviderCount());
  return (
    <>
      <Header />
      {/* The form reads the URL on the client, so the Suspense fallback is what crawlers
          receive. Keep the h1 and intro here, in the server HTML. */}
      <Suspense
        fallback={
          <PageHero
            align="center"
            eyebrow="Smart Match"
            title="Describe what you need. We'll find your match."
            lede="Smart Match turns a plain-English project brief into a shortlist of verified Solana providers: auditors, developers, marketing and growth agencies."
          />
        }
      >
        <SmartMatchClient autoMatch={autoMatch} />
      </Suspense>

      <section className="mx-auto max-w-3xl px-8 pb-20">
        <h2 className="font-heading text-2xl font-semibold">How Smart Match works</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="rounded-2xl border border-line p-5">
              <div className="font-semibold">
                {i + 1}. {title}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[15px] leading-relaxed text-ink/90">
          Every provider is checked by a person before it is called verified; see{' '}
          <Link href="/how-we-verify" className="text-blue-deep">how we verify providers</Link>. Not sure what to budget yet?
          Try the{' '}
          <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link> or the{' '}
          <Link href="/tools/solana-dapp-cost-calculator" className="text-blue-deep">dApp cost calculator</Link>, or browse{' '}
          <Link href="/solana-smart-contract-audits" className="text-blue-deep">Solana auditors</Link>.
        </p>
      </section>
      <FaqSection title="Smart Match FAQ" faqs={FAQS} />
    </>
  );
}
