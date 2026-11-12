import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-indexer-vs-rpc-what-to-use';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana indexer vs RPC"
      answer="Use an RPC node to read current state and send transactions. Add an indexer when your app needs history, filters, totals or fast lists, because RPC answers one question at a time and is not a database. Most production Solana apps use both: RPC for the live path, an indexer for everything users browse."
      glance={{
        caption: 'RPC node vs indexer',
        head: ['', 'RPC node', 'Indexer'],
        rows: [
          ['Answers', 'Current state, one request at a time', 'History, filters and totals from a database'],
          ['Sends transactions', 'Yes', 'No'],
          ['Typical use', 'Balances, simulate, send, confirm', 'Activity feeds, leaderboards, analytics'],
          ['Who runs it', 'A provider, or you', 'You, or a provider that decodes for you'],
        ],
        note: 'Providers package these differently: ask what is included in writing.',
      }}
      summary={[
        'An RPC node reads state and sends transactions. It is not built to filter, sort or aggregate history.',
        'An indexer reads chain data, decodes it with your program IDL and stores it in a database you can query.',
        'Add an indexer when you show histories, lists, totals or search, or when getProgramAccounts gets slow or costly.',
        'Index at confirmed or finalized commitment, or handle rollbacks if you read processed data.',
        'Decide who owns the data pipeline before launch: it is part of the product, not an afterthought.',
      ]}
      cta={{
        title: 'Find a Solana infrastructure provider',
        text: 'Describe your workload and stage. Smart Match suggests verified infrastructure and development providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        A first Solana app usually works with a single RPC endpoint. Then someone asks for a
        transaction history, a leaderboard or a search box, and the endpoint that felt fast starts
        to feel slow and expensive. The cause is usually not the provider. It is asking an RPC node
        to do the job of a database.
      </P>

      <H2>What an RPC node is good at</H2>
      <P>
        RPC methods return the current state of the chain: an account, a balance, a transaction
        by signature, the result of a simulation. The same endpoint is how your app sends
        transactions and learns whether they landed. That is the live path, and it should stay on
        RPC.
      </P>
      <P>
        Where it struggles is breadth. Scanning every account of a program with
        getProgramAccounts is heavy, providers often limit or price it up, and standard nodes do not
        keep unlimited history. Our guide on{' '}
        <Link href="/blog/how-to-choose-a-solana-rpc-provider" className="text-blue-deep">
          choosing an RPC provider
        </Link>{' '}
        covers rate limits and transaction landing.
      </P>

      <H2>What an indexer adds</H2>
      <P>
        An <Link href="/solana-glossary/indexer" className="text-blue-deep">indexer</Link> reads
        blocks, transactions and account updates, decodes them and stores the result in a database.
        Your app then queries that database with ordinary filters, sorting and aggregation, so a
        history page is one fast query instead of thousands of RPC calls.
      </P>
      <BulletList
        items={[
          ['Decoding:', 'Anchor programs publish an IDL, and accounts and instructions start with an 8-byte discriminator, so decoding is mostly mechanical. Native programs need a hand-written decoder.'],
          ['Streaming:', 'validators can stream account, slot and transaction updates through Geyser plugins, and providers expose this as a gRPC feed. It is the usual way to keep an indexer current.'],
          ['Backfill:', 'when you start, you also need old data. Ask where history comes from and how long a backfill takes.'],
          ['Compressed NFTs:', 'their data is not stored in ordinary accounts, so reading them needs an indexer that supports the Digital Asset Standard (DAS) API.'],
        ]}
      />

      <H2>When you need one</H2>
      <BulletList
        items={[
          ['You show history:', 'activity feeds, transaction lists, portfolio charts.'],
          ['You rank or total:', 'leaderboards, volume, TVL, rewards, anything summed across accounts.'],
          ['You search or filter:', 'by owner, status, date range or tag across many accounts.'],
          ['Your account scans are slow:', 'getProgramAccounts timeouts or a growing bill are the usual sign.'],
          ['You need reports:', 'finance, tax or compliance exports are database work, not RPC work.'],
        ]}
      />
      <P>
        If you only read balances and send transactions, an RPC provider is enough. Do not build a
        pipeline you do not need.
      </P>

      <H2>Build it or buy it</H2>
      <BulletList
        items={[
          ['Hosted indexer or data API:', 'fastest to start, you pay per use and depend on their schema and uptime. Good for early stage.'],
          ['Your own indexer:', 'full control of schema, history and cost at scale, but you run a stream consumer, a database, monitoring and backfills. Budget engineering time for it.'],
          ['Mixed:', 'a hosted feed for the stream, your own database for the data that is core to the product.'],
        ]}
      />

      <Callout>
        <b>Questions to ask a provider or developer:</b> which commitment level do you index at and
        how do you handle a rolled-back slot? How do you backfill history? What happens when a
        program upgrade changes an account layout? How do you detect that the indexer fell behind?
        Who owns the database and can we export it?
      </Callout>

      <H2>Mistakes to avoid</H2>
      <BulletList
        items={[
          ['Reading processed data as final:', 'processed slots can be dropped. Index at confirmed or finalized, or write rollback handling.'],
          ['No lag alert:', 'an indexer that quietly stops shows stale numbers to users. Monitor the gap to the chain head.'],
          ['Ignoring program upgrades:', 'a new account layout breaks old decoders. Version your decoders.'],
          ['Using RPC as a database:', 'it works in a demo and fails on launch day.'],
        ]}
      />

      <P>
        Indexing is also a cost line in a build. See{' '}
        <Link href="/blog/how-much-does-it-cost-to-build-a-solana-dapp" className="text-blue-deep">
          how much it costs to build a Solana dApp
        </Link>
        , and compare verified providers on the{' '}
        <Link href="/solana-infrastructure-providers" className="text-blue-deep">
          Solana infrastructure providers
        </Link>{' '}
        page. The related term in the glossary is{' '}
        <Link href="/solana-glossary/rpc" className="text-blue-deep">RPC</Link>.
      </P>

      <P>
        Also useful: <Link href="/blog/solana-program-monitoring-and-alerts" className="text-blue-deep">how to monitor a Solana program in production</Link>.
      </P>
    </BlogPost>
  );
}
