import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import SmartMatchClient from './SmartMatchClient';

export const metadata: Metadata = {
  title: 'Smart Match',
  description: 'Describe what you need. AI matches you with the right verified provider in the Solana ecosystem.',
  alternates: {
    canonical: '/smart-match',
  },
};

export default function SmartMatchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="px-8 py-20 text-center text-gray-soft">Loading…</div>}>
        <SmartMatchClient />
      </Suspense>
    </>
  );
}
