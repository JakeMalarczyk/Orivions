import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana RPC Providers: How to Choose and Compare',
  description:
    'How to choose a Solana RPC and infrastructure provider: nodes, data and indexing, validators and DevOps. Reliability, limits, red flags and questions to ask. Browse providers, free to contact.',
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
    {
      heading: 'What infrastructure providers deliver',
      bullets: [
        ['RPC endpoints', 'shared or dedicated access to Solana nodes for reading data and sending transactions.'],
        ['Data and indexing', 'streaming, historical data and query services so you do not parse the chain yourself.'],
        ['Validators and staking', 'running validators, or staking with one, for teams that need that role.'],
        ['DevOps and monitoring', 'deployment, alerting and on-call support for the systems around your app.'],
      ],
    },
    {
      heading: 'Shared and dedicated RPC',
      body: 'Shared endpoints are cheaper and enough for many apps, but you share capacity and rate limits with other customers. Dedicated nodes give you your own capacity and more predictable performance, at a higher price and with more setup. Many teams start shared, then move heavy workloads to a dedicated node as traffic grows.',
    },
    {
      heading: 'Red flags when comparing providers',
      bullets: [
        ['Unclear request counting', 'if you cannot tell how a call is billed, your bill is hard to predict.'],
        ['No failover story', 'a single endpoint with no plan for outages is a single point of failure.'],
        ['Limits that appear only after you sign', 'ask for rate limits and burst behaviour in writing.'],
        ['No way to reach a person during an incident', 'support that is only a ticket form can be too slow on launch day.'],
        ['Missing methods or history', 'check that the calls and the data depth your product uses are supported.'],
      ],
    },
    {
      heading: 'How a typical setup runs',
      bullets: [
        ['Needs assessment', 'expected traffic, the methods you call and how much history you need.'],
        ['Trial', 'test an endpoint with your own traffic pattern before you commit.'],
        ['Migration', 'switch traffic gradually and keep the old endpoint as a fallback.'],
        ['Monitoring', 'track errors, latency and rate limit hits so you notice problems before users do.'],
      ],
    },
    {
      heading: 'Questions to ask before you commit',
      bullets: [
        ['What happens when I exceed my plan?', 'throttling, extra charges or an upgrade.'],
        ['How do you handle outages?', 'status history, failover and how you communicate.'],
        ['Which commitment do you require?', 'monthly or annual, and how to leave.'],
        ['Can I run two providers?', 'most teams add a second endpoint for resilience.'],
      ],
      link: { text: 'For a longer walkthrough, read', href: '/blog/how-to-choose-a-solana-rpc-provider', label: 'how to choose a Solana RPC provider' },
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
    {
      q: 'What is the difference between a shared and a dedicated RPC node?',
      a: 'A shared endpoint serves many customers and is limited by rate limits, while a dedicated node is reserved for you and gives more predictable capacity. Dedicated nodes cost more and are usually worth it once traffic or latency needs grow.',
    },
    {
      q: 'Do I need to run my own validator?',
      a: 'Most apps do not. Running a validator is a separate operation from serving your app, and teams usually use an RPC provider unless they have a specific reason to run their own infrastructure.',
    },
    {
      q: 'What is the difference between RPC and an indexing service?',
      a: 'RPC lets you read the current state and send transactions. An indexing or data service stores and organises history so you can query it, for example for portfolios, analytics or search.',
    },
  ],
  ctaBoxTitle: 'Not sure which provider fits your project?',
  ctaBoxText: 'Describe your project and expected traffic, and we match you with infrastructure providers that fit.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
