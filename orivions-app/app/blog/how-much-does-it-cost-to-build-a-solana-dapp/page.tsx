import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-much-does-it-cost-to-build-a-solana-dapp';

export const metadata = postMetadata(SLUG);

const COMPONENTS: [string, string][] = [
  [
    'On-chain programs:',
    'the Rust code that runs on Solana. Cost scales with the number of programs and instructions, and above all with the complexity of the logic: token flows, math, permissions and integrations with other protocols.',
  ],
  [
    'Frontend:',
    'wallet connection, transaction building, error handling and a usable interface. A polished production app often takes as much effort as the programs themselves.',
  ],
  [
    'Off-chain infrastructure:',
    'RPC providers, indexers to query on-chain data, backend services, keepers or cranks that trigger instructions, and monitoring. Easy to forget, and a common source of production issues.',
  ],
  [
    'Independent audit:',
    'for anything that holds user funds. Budget for the audit and the fix review separately from development.',
  ],
  [
    'Maintenance:',
    'dependency upgrades, network changes, new wallets, bug fixes and support after launch. Usually a monthly retainer or a share of the original budget per year.',
  ],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Cost of a Solana dApp"
      summary={[
        'A Solana dApp is several products to price: programs, frontend, off-chain infrastructure, audit and maintenance.',
        'A simple program with a basic interface might start around $2,000-5,000; a full protocol commonly runs $20,000 or more before the audit.',
        'Scope decisions move the budget far more than the choice of chain or framework.',
        'A short paid discovery phase is the cheapest way to turn a guess into a reliable quote.',
        'Teams most often forget the audit, infrastructure, monitoring and post-launch maintenance.',
      ]}
      cta={{
        title: 'Get a quote from verified Solana teams',
        text: 'Describe what you want to build and your budget. Smart Match suggests verified development companies with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        &quot;How much does a Solana dApp cost?&quot; has the same answer as &quot;how much does a
        house cost?&quot;: it depends on what you build. What we can do is show where the money
        goes, which decisions move the number, and how to get a quote you can actually rely on.
      </P>

      <H2>Indicative ranges</H2>
      <P>
        A simple program, such as a vesting contract or a straightforward staking program with a
        basic interface, might start around $2,000-5,000. A full protocol with several programs, a
        production frontend and integrations with other protocols commonly runs $20,000 or more,
        before the audit. For a range based on your own scope, try our free{' '}
        <Link href="/tools/solana-dapp-cost-calculator" className="text-blue-deep">Solana dApp cost calculator</Link>;
        live, indicative pricing from verified providers is on the{' '}
        <Link href="/insights" className="text-blue-deep">insights page</Link>.
      </P>

      <H2>Where the money goes</H2>
      <BulletList items={COMPONENTS} />

      <H2>What moves the budget most</H2>
      <BulletList
        items={[
          ['Custom logic versus known patterns:', 'escrows, vaults and token launches are well understood; a new pricing curve or liquidation engine is research.'],
          ['Integrations:', 'every external protocol, oracle or bridge adds code, testing and audit scope.'],
          ['Number of user roles:', 'admins, operators, partners and end users each need their own flows and checks.'],
          ['Upgradeability and migrations:', 'designing for future changes costs more now and much less later.'],
          ['Design quality:', 'a working interface and a polished, branded product are very different budgets.'],
          ['Timeline:', 'compressing a schedule usually means a bigger team, and coordination costs grow with team size.'],
        ]}
      />

      <Callout>
        <b>Cut scope, not quality.</b> Launching with fewer features that are tested and audited is
        cheaper and safer than launching everything at once. Ship the core, learn from real users,
        then extend.
      </Callout>

      <H2>How to get a quote you can rely on</H2>
      <P>
        A large fixed price based on a two-paragraph brief is a guess. Ask for a short, paid
        discovery phase that produces a written specification, an account and instruction design,
        a milestone plan and a list of assumptions. Then compare quotes from several teams against
        the same specification, and tie payments to accepted milestones.
      </P>
      <P>
        Before choosing a team, read{' '}
        <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
          the twelve questions to ask a Solana development company
        </Link>
        , check{' '}
        <Link href="/blog/anchor-vs-native-rust-solana" className="text-blue-deep">
          whether Anchor or native Rust fits your project
        </Link>
        , and plan for{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          the cost of the audit
        </Link>
        . Verified teams and indicative price ranges are on the{' '}
        <Link href="/solana-development-companies" className="text-blue-deep">
          Solana development companies
        </Link>{' '}
        page.
      </P>
    </BlogPost>
  );
}
