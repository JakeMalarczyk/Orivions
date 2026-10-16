import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProposalGeneratorClient from './ProposalGeneratorClient';

export const metadata: Metadata = {
  title: 'AI Proposal Generator',
  description: 'Draft a client proposal in seconds. AI-powered tool for verified providers on Orivions.',
  alternates: { canonical: '/ai-proposal-generator' },
};

export default function AiProposalGeneratorPage() {
  return (
    <Suspense fallback={null}>
      <ProposalGeneratorClient />
    </Suspense>
  );
}
