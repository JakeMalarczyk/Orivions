import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import InsightsClient from './InsightsClient';

export const metadata: Metadata = {
  title: 'Solana Services Market Insights',
  description:
    "Live data on the Solana ecosystem's business infrastructure: verified provider counts by category, indicative pricing ranges — updated automatically.",
  alternates: {
    canonical: '/insights',
  },
};

export default function InsightsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="px-8 py-20 text-center text-gray-soft">Loading…</div>}>
        <InsightsClient />
      </Suspense>
    </>
  );
}
