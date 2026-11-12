import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-choose-a-solana-rpc-provider';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Choosing a Solana RPC provider"
      answer="To choose a Solana RPC provider, start from your workload: reads, heavy account queries, streaming or sending transactions. Check documented rate limits, how transactions land, regions, support and uptime history, then benchmark two providers with your own traffic for a week. Use a second provider as a fallback, and never expose an unrestricted key in the frontend."
      glance={{
        caption: 'Shared vs dedicated Solana RPC',
        head: ['', 'Shared plan', 'Dedicated node'],
        rows: [
          ['Cost', 'Lower, scales with requests', 'Much higher, fixed'],
          ['Performance', 'Varies with other customers', 'Steady, reserved for you'],
          ['Heavy queries', 'Often limited or priced up', 'Usually fewer limits'],
          ['Good for', 'Early stage and most apps', 'Trading, indexers, high load'],
        ],
        note: 'Plans and prices differ by provider: ask for current limits in writing.',
      }}
      summary={[
        'The public Solana endpoints are rate limited and are not for production.',
        'Match the provider to your workload: plain reads, heavy account queries, streaming or transaction sending behave very differently.',
        'Ask how transactions land and what happens at the rate limit, not just for a requests-per-second number.',
        'Benchmark with your own traffic and compare latency, errors and slot lag.',
        'Use two providers, keep API keys out of the frontend, and test the failover.',
      ]}
      cta={{
        title: 'Find a verified Solana infrastructure provider',
        text: 'Describe your project and load. Smart Match suggests verified infrastructure providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        An RPC provider sits between your app and the chain. When it is slow or drops requests, users
        blame your product, not the node. Choosing one is mostly a question of what you ask it to
        do, and a few checks before you sign save a painful migration later.
      </P>

      <H2>Start with your workload</H2>
      <BulletList
        items={[
          ['Reads for a frontend:', 'balances, accounts, recent transactions. Needs low latency near your users and steady availability.'],
          ['Heavy account queries:', 'calls such as getProgramAccounts return a lot of data and are often limited or priced differently.'],
          ['Streaming and indexing:', 'WebSocket subscriptions or a gRPC stream (Geyser-based) for live data. Check what is included and what is extra.'],
          ['Sending transactions:', 'bots, keepers and launches live or die on how reliably transactions reach the leader.'],
        ]}
      />

      <H2>Ten questions to ask</H2>
      <BulletList
        items={[
          ['1. What are the exact rate limits?', 'per second, per method and per plan, and what happens when you hit them: errors, throttling or a surprise bill.'],
          ['2. How do you land transactions?', 'ask about stake-weighted connections, retries and priority fee support, and request landing statistics for your use case.'],
          ['3. Which regions do you serve?', 'pick one close to your backend and your users, and check if you can run in two regions.'],
          ['4. What streaming options exist?', 'WebSockets, gRPC and what they cost.'],
          ['5. How much history do you keep?', 'full history, archival access and indexing add cost: say what you need.'],
          ['6. What is the uptime record?', 'a public status page with past incidents is a better signal than a number in a sales deck.'],
          ['7. What support do you give?', 'a named channel, response times, and whether anyone answers at the hour of your launch.'],
          ['8. How are keys secured?', 'IP or domain allowlists, rotation and per-key limits, so a leaked key cannot be abused.'],
          ['9. How do you price overages?', 'ask for an example bill for a traffic spike.'],
          ['10. Can we leave easily?', 'standard endpoints and no lock-in to a proprietary API for core calls.'],
        ]}
      />

      <H2>Test before you commit</H2>
      <P>
        A benchmark of simple calls tells you little. Run your own traffic against two providers for
        a week, including your heaviest calls and some peak hours. Record median and slow latency,
        error rates, rate-limit responses and how far each reports its slot behind a second source.
        Ask for a trial or a short plan to do it.
      </P>

      <Callout>
        <b>Use two providers.</b> A single endpoint is an availability risk for your frontend and your
        keepers. Configure a fallback, set client-side timeouts and test the switch before launch, as
        in the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          pre-launch security checklist
        </Link>
        .
      </Callout>

      <H2>Security and red flags</H2>
      <BulletList
        items={[
          ['Keys in the frontend:', 'an unrestricted key in browser code will be copied. Restrict by domain or proxy requests through your backend.'],
          ['"Unlimited" with no terms:', 'ask what unlimited means in the fair-use policy.'],
          ['No incident history or named support:', 'you cannot judge reliability you cannot see.'],
          ['Pushing a dedicated node early:', 'most early-stage apps do well on a shared plan with a fallback.'],
        ]}
      />
      <P>
        For terms and fees around priority transactions see the glossary entries for{' '}
        <Link href="/solana-glossary/rpc" className="text-blue-deep">RPC</Link> and{' '}
        <Link href="/solana-glossary/priority-fee" className="text-blue-deep">priority fee</Link>. To
        compare providers that Orivions has verified, see{' '}
        <Link href="/solana-infrastructure-providers" className="text-blue-deep">
          Solana infrastructure providers
        </Link>
        .
      </P>

      <P>
        Also useful: <Link href="/blog/solana-program-monitoring-and-alerts" className="text-blue-deep">how to monitor a Solana program in production</Link>.
      </P>
    </BlogPost>
  );
}
