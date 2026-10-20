import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { isDirectoryOpen, verifiedProviderCount } from '@/lib/directory';
import SmartMatchClient from './SmartMatchClient';

export const metadata: Metadata = {
  title: 'Smart Match',
  description: 'Describe what you need and get a shortlist of verified Solana providers that fit, each with a reason. Free for teams.',
  alternates: {
    canonical: '/smart-match',
  },
};

// Re-check every 5 minutes whether enough providers are verified for automatic matching.
export const revalidate = 300;

export default async function SmartMatchPage() {
  const autoMatch = isDirectoryOpen(await verifiedProviderCount());
  return (
    <>
      <Header />
      <Suspense fallback={<div className="px-8 py-20 text-center text-gray-soft">Loading…</div>}>
        <SmartMatchClient autoMatch={autoMatch} />
      </Suspense>
    </>
  );
}
