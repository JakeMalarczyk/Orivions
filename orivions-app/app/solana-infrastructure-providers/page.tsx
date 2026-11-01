import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Infrastructure Providers: RPC, Data and Nodes',
  description:
    'Find Solana infrastructure providers: RPC and node services, data and indexing, validators and DevOps. Compare what to check before you commit. Free to contact.',
  alternates: { canonical: '/solana-infrastructure-providers' },
};

const content: CategoryContent = {
  path: '/solana-infrastructure-providers',
  guideTags: ['Development'],
  breadcrumbLabel: 'Solana Infrastructure Providers',
  h1: 'Solana Infrastructure Providers',
  lede: 'Companies that run the plumbing behind Solana apps: RPC and node services, data and indexing, validators and DevOps support. Compare providers, then contact them directly. Free to search.',
  ctaPrimary: 'Describe your project (AI match)',
  sections: [
    {
      heading: 'What counts as Solana infrastructure?',
      body: 'Infrastructure is everything your app depends on that is not your own program or frontend: the RPC endpoints your users and backend call, the nodes and validators behind them, the services that index and query on-chain data, and the DevOps work that keeps all of it running.',
    },
    {
      heading: 'What to check before you pick a provider',
      bullets: [
        ['Reliability and redundancy', 'ask how the provider handles outages and whether you can fail over to a second endpoint.'],
        ['Limits and pricing model', 'understand rate limits, how requests are counted and what happens when you exceed your plan.'],
        ['Data you need', 'check that the provider supports the methods, history and indexing your product relies on.'],
        ['Support', 'know who you reach during an incident and how quickly they answer.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed our checks, though you should test an endpoint under your own load before you commit.'],
      ],
    },
    {
      heading: 'Plan for a launch spike',
      body: 'Launches and mints bring sudden traffic. Agree limits and a scaling path with your provider before launch day, load-test your own app, and keep a backup endpoint ready.',
      link: { text: 'Run through the', href: '/blog/solana-pre-launch-security-checklist', label: 'Solana pre-launch security checklist' },
    },
  ],
  providersHeading: 'Verified Infrastructure providers',
  category: 'Infrastructure',
  faqs: [
    {
      q: 'What is an RPC provider on Solana?',
      a: 'An RPC provider runs Solana nodes and exposes endpoints your wallet, frontend and backend call to read data and send transactions. Teams use a provider instead of running their own nodes to save operations work.',
    },
    {
      q: 'Should I use more than one RPC provider?',
      a: 'For anything that handles user funds or a launch, a second endpoint you can fail over to is a sensible precaution, because a single provider outage then does not take your app down.',
    },
    {
      q: 'How do I choose between providers?',
      a: 'Check reliability and failover, rate limits and how requests are counted, support for the methods and history you need, and who answers during an incident. Then load-test with your own traffic before you commit.',
    },
  ],
  ctaBoxTitle: 'Not sure which provider fits your project?',
  ctaBoxText: 'Describe your project and expected traffic, and we match you with infrastructure providers that fit.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
