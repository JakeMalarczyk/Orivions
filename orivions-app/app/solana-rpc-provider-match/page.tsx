import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding from '@/components/ServiceLanding';
import { ogImageUrl } from '@/lib/blog';

// Client offer: match a Solana RPC / infrastructure provider to the team's real load.

const PATH = '/solana-rpc-provider-match';
const TITLE = 'Find the right Solana RPC provider for your load';
const DESCRIPTION =
  'Choosing a Solana RPC provider? Send your expected load once and compare offers on the same terms: limits, streaming, landing, failover and price.';

export const metadata: Metadata = {
  title: 'Solana RPC Provider: Compare Offers for Your Load',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Find the right Solana RPC provider', 'For teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('Find the right Solana RPC provider', 'For teams')] },
};

export default function RpcMatchPage() {
  return (
    <ServiceLanding
      path={PATH}
      title={TITLE}
      description={DESCRIPTION}
      serviceType='Blockchain infrastructure sourcing'
      breadcrumbName='Solana RPC provider match'
      eyebrow='For teams running on Solana'
      lede='RPC plans are priced in different units and promise different things, so the cheapest plan is often the wrong one. Send your expected load once and we ask verified infrastructure providers for offers on the same terms. Free for teams, no obligation.'
      steps={[
        { title: 'Send your load', text: 'Requests per second at peak, methods you call most, streaming needs, regions and whether you send transactions.' },
        { title: 'We ask providers', text: 'A person at Orivions asks infrastructure providers we have checked for offers on one sheet: limits, streaming, landing, failover, support and price.' },
        { title: 'Compare and test', text: 'Compare offers side by side and run your own test before you commit. You choose, or walk away.' },
      ]}
      form={{
        source: 'rpc-match',
        title: 'Request RPC offers',
        text: 'Tell us what your app does on Solana and your expected load. A person at Orivions replies by email with next steps.',
        examples: [
          { label: 'Trading app', text: 'Trading app on Solana: we send many transactions at peak, need low latency in Europe and streaming of account updates. Peak about 300 requests per second.' },
          { label: 'Wallet or consumer app', text: 'Consumer app with a wallet, mostly reads (balances, history), about 50 requests per second at peak, users in the US and Asia.' },
          { label: 'Indexing and history', text: 'We need full transaction history for our programs and a way to stream new events into our database. Shared or dedicated, open to both.' },
        ],
      }}
      sendTitle='What to send for comparable offers'
      send={[
        'Peak and average requests per second, and the methods you call most',
        'Whether you need streaming (account or transaction updates) or history',
        'Whether you send transactions and how much landing speed matters',
        'Regions where your users and servers are',
        'Budget range and whether you need a dedicated node',
      ]}
      related={
        <>
          Read{' '}
          <Link href='/blog/how-to-choose-a-solana-rpc-provider' className='text-blue-deep'>how to choose a Solana RPC provider</Link> and{' '}
          <Link href='/blog/solana-indexer-vs-rpc-what-to-use' className='text-blue-deep'>when you need an indexer instead of RPC</Link>. After launch, set up{' '}
          <Link href='/blog/solana-program-monitoring-and-alerts' className='text-blue-deep'>monitoring and alerts</Link> for your program.
        </>
      }
      faqs={[
        { q: 'Why not just pick the cheapest RPC plan?', a: 'Plans count usage in different units and limit different things. A plan that is cheap for reads can be expensive or slow for streaming and transactions. Comparing on your real load shows the real cost.' },
        { q: 'Is it free?', a: 'Yes, for your team. You never pay Orivions. You sign up with the provider you choose.' },
        { q: 'Should I use more than one provider?', a: 'Many production apps keep a second provider for failover. Ask each provider how they handle outages and test switching before launch.' },
        { q: 'Do you test the providers?', a: 'We check the companies. Performance depends on your load and regions, so run your own test with the shortlisted providers before you commit.' },
      ]}
    />
  );
}
