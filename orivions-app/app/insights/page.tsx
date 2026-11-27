import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import InsightsClient from './InsightsClient';

export const metadata: Metadata = {
  title: 'Solana Services Market Insights',
  description:
    "Live data on the Solana ecosystem's business infrastructure: verified provider counts by category, indicative pricing ranges, updated automatically.",
  alternates: {
    canonical: '/insights',
  },
  // Mostly zeros until there is real provider data: keep out of the index for now.
  robots: { index: false, follow: true },
};

export default function InsightsPage() {
  return (
    <>
      <Header />
      {/* The fallback is what crawlers receive, so it carries the h1 and intro. */}
      <Suspense
        fallback={
          <PageHero
            align="center"
            eyebrow="Market insights"
            title="Solana Business Infrastructure: Market Insights"
            lede="Verified provider supply by category and indicative pricing for Solana audits, development and marketing, updated from the Orivions directory."
          />
        }
      >
        <InsightsClient />
      </Suspense>

      <section className="mx-auto max-w-3xl px-8 pb-20 text-[15px] leading-relaxed text-ink/90">
        <h2 className="font-heading text-2xl font-semibold">Plan your budget</h2>
        <p className="mt-3">
          Use the free{' '}
          <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link> and{' '}
          <Link href="/tools/solana-dapp-cost-calculator" className="text-blue-deep">dApp cost calculator</Link>, or read how audit
          pricing works in{' '}
          <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">how much a Solana audit costs</Link>. To
          see how providers are checked, read{' '}
          <Link href="/how-we-verify" className="text-blue-deep">how we verify</Link>.
        </p>
      </section>
    </>
  );
}
