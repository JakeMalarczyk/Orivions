import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import ProvidersCatalog from './ProvidersCatalog';

export const metadata: Metadata = {
  title: 'Find Providers',
  description:
    'Browse verified companies across the Solana ecosystem — developers, auditors, marketing agencies, and more. Free to search and contact.',
  alternates: {
    canonical: '/providers',
  },
};

export default function ProvidersPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="px-8 py-20 text-center text-gray-soft">Loading…</div>}>
        <ProvidersCatalog />
      </Suspense>
    </>
  );
}
