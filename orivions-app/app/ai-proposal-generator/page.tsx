import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import ProposalGeneratorClient from './ProposalGeneratorClient';

export const metadata: Metadata = {
  title: 'AI Proposal Generator',
  description: 'Draft a client proposal in seconds. AI-powered tool for verified providers on Orivions.',
  alternates: { canonical: '/ai-proposal-generator' },
};

export default function AiProposalGeneratorPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ProposalGeneratorClient />
      </Suspense>
      <section className="mx-auto max-w-3xl px-8 pb-20 text-[15px] leading-relaxed text-ink/90">
        <h2 className="font-heading text-2xl font-semibold">How the AI proposal generator works</h2>
        <p className="mt-3">
          Paste a client brief and the generator drafts a structured proposal for you to edit:
          scope, deliverables, milestones, timeline and a price range. It is built for verified
          providers on Orivions, so a good brief becomes a sendable proposal in minutes instead of
          hours.
        </p>
        <p className="mt-3">
          Always read and adjust the draft before you send it. For what clients expect to see, read{' '}
          <Link href="/blog/solana-project-brief-template" className="text-blue-deep">the Solana project brief template</Link> and{' '}
          <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">how to structure milestone payments</Link>
          , or estimate costs with the{' '}
          <Link href="/tools" className="text-blue-deep">free calculators</Link>.
        </p>
      </section>
    </>
  );
}
