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
        <h2 className="font-heading text-2xl font-semibold">What these insights cover</h2>
        <p className="mt-3">
          The numbers come from verified providers in the Orivions directory: how many are active in
          each category and what they charge for common work. Nothing is estimated from outside
          sources, and nothing is published until a real, checked cohort exists.
        </p>
        <p className="mt-3">
          For a budget today, use the free{' '}
          <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link> and{' '}
          <Link href="/tools/solana-dapp-cost-calculator" className="text-blue-deep">dApp cost calculator</Link>, or read how audit
          pricing works in{' '}
          <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">how much a Solana audit costs</Link>. To
          see how providers are checked, read{' '}
          <Link href="/how-we-verify" className="text-blue-deep">how we verify</Link>.
        </p>
        <h2 className="mt-8 font-heading text-2xl font-semibold">Why publish market data</h2>
        <p className="mt-3">
          Pricing for Solana audits, development and growth is hard to find and easy to inflate.
          Showing real supply and typical price ranges by category lets teams check a quote against
          the market before they sign, and helps good providers stand out for what they actually
          deliver rather than for who shouts loudest.
        </p>
      </section>
    </>
  );
}
