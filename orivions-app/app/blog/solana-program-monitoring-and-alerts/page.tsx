import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-program-monitoring-and-alerts';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana program monitoring"
      answer="Monitor a Solana program on five fronts: failed transactions, authority and upgrade changes, balances of your keeper and fee-payer wallets, oracle freshness, and how far your RPC lags behind the chain. Send each alert to a named person with a written runbook, and test the alerts before mainnet, not after the first incident."
      glance={{
        caption: 'What to watch on a live Solana program',
        head: ['Signal', 'Where it comes from', 'Alert when'],
        rows: [
          ['Failed transactions', 'Transaction logs and signature statuses', 'The failure rate of one instruction jumps, or a new error code appears'],
          ['Upgrade and authority changes', 'The program data account and authority accounts', 'Any change you did not schedule'],
          ['Keeper and fee-payer balances', 'Account balances of your own wallets', 'Balance can no longer cover the next days of fees'],
          ['Oracle freshness', 'Timestamps in the price feed accounts you read', 'The feed is older than your own limit'],
          ['RPC lag and errors', 'Slot compared with a second source, error and rate-limit responses', 'Your endpoint falls behind or starts rejecting calls'],
        ],
        note: 'Set the thresholds from your own traffic. A number that suits another protocol may be wrong for yours.',
      }}
      summary={[
        'Launch day is when monitoring matters most. Build it before mainnet, not after the first incident.',
        'Watch changes you did not make: an upgrade, a new authority or a large transfer out of a vault.',
        'Your own wallets can fail the product. A keeper that runs out of SOL stops liquidations silently.',
        'Read data at confirmed or finalized commitment, and compare your RPC with a second source.',
        'An alert nobody owns is noise. Give each one a named person and a short runbook.',
      ]}
      cta={{
        title: 'Find a Solana infrastructure provider',
        text: 'Describe your workload and stage. Smart Match suggests verified infrastructure and development providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Most Solana teams spend months on the program and an afternoon on monitoring. Then a
        transaction starts failing at three in the morning, or a keeper wallet runs dry, and the
        first person to notice is a user on social media. Monitoring is part of the launch, and it
        is cheaper to set up while the team still remembers how the program works.
      </P>

      <H2>1. Failed transactions</H2>
      <P>
        Failed transactions still land onchain and still pay fees, so they leave a trail. Track the
        failure rate per instruction and the error codes behind it. A single error is normal. A
        sudden rise for one instruction, or a new error code after a deploy, deserves a person.
        Anchor programs publish custom errors in the IDL, which makes the codes readable.
      </P>

      <H2>2. Upgrade and authority changes</H2>
      <P>
        A program that can be upgraded stores its upgrade authority in the program data account.
        Watch that account and every authority your program uses, such as admin keys and mint or
        freeze authorities. Any change you did not schedule is an incident until proven otherwise.
        Pair the alert with a{' '}
        <Link href="/blog/solana-program-upgrade-authority-multisig" className="text-blue-deep">
          multisig on the upgrade authority
        </Link>
        , so one stolen key cannot ship new code.
      </P>

      <H2>3. Balances you own</H2>
      <BulletList
        items={[
          ['Keeper and bot wallets:', 'liquidators, crankers and reward distributors pay fees from their own SOL. When it runs out, the product stops without an error on your side.'],
          ['Fee payer for user transactions:', 'if you sponsor fees, watch the balance and the daily burn.'],
          ['Vaults and treasuries:', 'alert on large or unusual transfers out, and on balances that move outside the pattern you expect.'],
        ]}
      />

      <H2>4. Oracle freshness</H2>
      <P>
        If your program reads a price feed, check how old the last update is. A stale price can let
        a bad trade or liquidation through. Decide your own limit, enforce it in the program, and
        alert when the feed gets close to it.
      </P>

      <H2>5. Your RPC and data pipeline</H2>
      <BulletList
        items={[
          ['Slot lag:', 'compare the slot your provider reports with a second source. A node that falls behind returns old state without an error.'],
          ['Errors and rate limits:', 'count rejected calls and throttling responses, and see who hits the limit first.'],
          ['Commitment level:', 'read at confirmed or finalized for anything that moves money. Processed data can be dropped.'],
          ['Indexer lag:', 'if you run an indexer, alert when it falls behind the chain head, so users do not see stale numbers.'],
        ]}
      />

      <H2>How to get the data</H2>
      <P>
        Solana RPC supports WebSocket subscriptions for accounts, program accounts and logs, which is
        enough for a small program. Heavier setups stream account and transaction updates through
        Geyser-based gRPC feeds, or read from an indexer. See{' '}
        <Link href="/blog/solana-indexer-vs-rpc-what-to-use" className="text-blue-deep">
          Solana indexer vs RPC
        </Link>{' '}
        for when to add one, and{' '}
        <Link href="/blog/how-to-choose-a-solana-rpc-provider" className="text-blue-deep">
          how to choose an RPC provider
        </Link>{' '}
        for what to ask about uptime and failover.
      </P>

      <Callout>
        <b>Questions to ask before launch:</b> who gets paged for each alert, and what do they do
        first? Can they pause the program or cap deposits if it is needed? Have we tested every
        alert on devnet by causing the failure on purpose? What is the plan if our RPC provider goes
        down?
      </Callout>

      <H2>Mistakes to avoid</H2>
      <BulletList
        items={[
          ['No owner:', 'an alert that goes to a channel nobody reads is the same as no alert.'],
          ['Alerting on everything:', 'too many alerts teach the team to ignore them. Start with the five above.'],
          ['Untested alerts:', 'trigger each one on devnet before launch.'],
          ['One data source:', 'a single RPC endpoint can be wrong or down at the moment you need it.'],
          ['No runbook:', 'write down the first three steps for each alert while nobody is under pressure.'],
        ]}
      />

      <P>
        Monitoring is one line in our{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>
        . You can browse verified providers on the{' '}
        <Link href="/solana-infrastructure-providers" className="text-blue-deep">
          Solana infrastructure providers
        </Link>{' '}
        page.
      </P>
    </BlogPost>
  );
}
