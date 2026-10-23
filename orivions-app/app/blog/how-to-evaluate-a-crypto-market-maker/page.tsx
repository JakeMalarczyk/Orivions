import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-evaluate-a-crypto-market-maker';

export const metadata = postMetadata(SLUG);

const MODELS: [string, string, string][] = [
  [
    'Token loan + call options',
    'You lend tokens to the market maker; they get the option to buy them later at agreed strike prices.',
    'Strike prices, loan size, duration, what happens to the tokens at the end, and how they hedge.',
  ],
  [
    'Retainer',
    'You pay a fee and usually provide the inventory (tokens and stablecoins) in accounts you control.',
    'Who owns the accounts, read-only access, reporting, and what the fee covers per venue.',
  ],
  [
    'Hybrid',
    'A smaller fee plus a smaller loan or option package.',
    'Both sets of questions, and which incentive dominates.',
  ],
];

const KPIS: [string, string][] = [
  ['Venues and pairs', 'Exactly which exchanges, pools and trading pairs are covered. Anything not listed is not covered.'],
  ['Spread', 'The maximum bid-ask spread they commit to keep, per pair.'],
  ['Depth', 'How much size they keep on each side of the book within an agreed distance from the mid price.'],
  ['Uptime', 'The share of time those spread and depth commitments must be met, and how it is measured.'],
  ['Reporting', 'How often you get reports, in what format, and whether you can check them against exchange data yourself.'],
];

const DOJ_URL =
  'https://www.justice.gov/usao-ma/pr/eighteen-individuals-and-entities-charged-international-operation-targeting-widespread';

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="How to evaluate a crypto market maker"
      answer="To evaluate a crypto market maker, check four things before you sign: the deal model (token loan with call options or a retainer) and the incentives it creates, written commitments per venue and pair for spread, depth and uptime, reporting you can verify against exchange or onchain data, and a named legal entity with references you contact yourself."
      glance={{
        caption: 'Market maker due diligence at a glance',
        head: ['Check', 'Good answer', 'Red flag'],
        rows: [
          ['Deal model', 'Clear loan, option or fee terms in writing', 'Vague terms, verbal promises'],
          ['Commitments', 'Spread, depth and uptime per venue and pair', '"We provide liquidity"'],
          ['End of loan', 'One-paragraph answer for every price scenario', 'No clear answer'],
          ['Reporting', 'Raw data and read-only access you can check', 'Screenshots and charts only'],
          ['The firm', 'Named legal entity, references you contact', 'Guaranteed price, volume or listing'],
        ],
      }}
      summary={[
        'A market maker should give your token tighter spreads and real depth, not price support or volume. Anyone selling "volume" is selling wash trading.',
        'First understand the deal model: a token loan with call options and a retainer create very different incentives.',
        'Put measurable commitments in the contract: venues, pairs, maximum spread, depth, uptime and reporting.',
        'Read the option terms and the end of the loan as carefully as the fee. That is where most of the cost hides.',
        'Check the firm the same way you would check any provider: real entity, independent references, a contract a lawyer has read.',
      ]}
      cta={{
        title: 'Need a market maker you can check?',
        text: 'Tell us your token, venues and timeline. We hand-pick verified providers and you see how each one was checked. Free for teams.',
        href: '/smart-match',
        label: 'Start Smart Match →',
      }}
    >
      <P>
        Most token teams sign their first market making contract under time pressure, a few weeks
        before a listing, with a firm someone recommended in a group chat. The terms that matter most
        are buried in the option schedule and the end-of-loan clause, and they are hard to change
        once the tokens have moved. This guide is about what to check before you sign. It does not
        rank firms.
      </P>

      <H2>The short answer</H2>
      <P>
        Evaluate a crypto market maker on four things: the deal model and the incentives it creates,
        measurable commitments in the contract (spread, depth, uptime per venue and pair), how you can
        verify their reporting yourself, and whether the firm is real and has references you can
        confirm independently. Walk away from anyone who promises a price, a volume number or a
        listing.
      </P>

      <H2>What a market maker should and should not do</H2>
      <P>
        A legitimate market maker quotes buy and sell orders continuously so that people can trade
        your token without moving the price too much. Good market making shows up as a tighter
        spread and more depth near the mid price. It does not show up as a price that only goes up, or
        as daily volume far above what real users trade.
      </P>
      <P>
        Trading with yourself to inflate volume is wash trading, and it is a crime in many
        jurisdictions. In October 2024 the{' '}
        <a href={DOJ_URL} target="_blank" rel="noopener noreferrer" className="text-blue-deep">
          US Department of Justice charged several crypto market makers
        </a>{' '}
        with wash trading tokens for clients, after the FBI created its own token to catch them. In
        the EU, MiCA includes market abuse rules for crypto-assets. If a pitch includes
        &quot;volume support&quot; or a target volume, you are being offered market manipulation.
      </P>

      <H2>1. Understand the deal model first</H2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
              <th className="px-4 py-3 font-semibold">Model</th>
              <th className="px-4 py-3 font-semibold">How it works</th>
              <th className="px-4 py-3 font-semibold">What to read closely</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map(([model, how, read]) => (
              <tr key={model} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold">{model}</td>
                <td className="px-4 py-3 text-gray">{how}</td>
                <td className="px-4 py-3 text-gray">{read}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        In a loan and option deal, the market maker profits if the token price ends above the strike
        prices, and hedges its exposure in the meantime, often by selling some of the loaned tokens.
        That is normal, but you should know how much selling the hedge can create and when. In a
        retainer deal, you keep control of the inventory, and the question becomes whether the fee
        buys real quoting or just a dashboard.
      </P>

      <H2>2. Put measurable commitments in the contract</H2>
      <P>
        &quot;We will provide liquidity&quot; is not a commitment. Ask for these per venue and per pair,
        in writing:
      </P>
      <BulletList items={KPIS} />
      <P>
        Then agree what happens when the commitments are missed: a fee reduction, a right to end the
        contract early, or both. Commitments without consequences are marketing.
      </P>

      <H2>3. Read the option and loan terms line by line</H2>
      <BulletList
        items={[
          ['Strike prices:', 'how they were set, and whether they are fixed or reset based on a future price. A strike set far below where your token is likely to trade transfers value to the market maker.'],
          ['Loan size:', 'how many tokens leave your treasury, and what share of the circulating supply that is on day one.'],
          ['Duration and early termination:', 'how long the loan runs, who can end it early, and on what notice.'],
          ['End of loan:', 'when the term ends, does the market maker return the tokens, pay at the strike, or choose? Who decides, and on which date is the price measured?'],
          ['Custody:', 'where the loaned tokens sit and whether you can see the wallets or accounts.'],
          ['Exclusivity:', 'whether you can hire a second market maker, and on which venues.'],
        ]}
      />

      <Callout>
        <b>Ask for one scenario in writing.</b> &quot;If our token trades below every strike price at
        the end of the term, what exactly happens to our tokens?&quot; and the same question for a price
        above all strikes. A good firm answers in a paragraph. A vague answer tells you who carries the
        risk.
      </Callout>

      <H2>4. Make sure you can check their reporting</H2>
      <BulletList
        items={[
          ['Read-only access:', 'in a retainer model, the exchange accounts should be in your name, with read-only API keys for you.'],
          ['Onchain pools:', 'if they provide liquidity in onchain pools, ask for the position addresses so you can watch them yourself.'],
          ['Raw data:', 'reports should come with trade-level or order-level data you can compare with what the exchange shows, not only charts.'],
          ['Independent view:', 'spot-check spread and depth on the venues yourself at random times, not only when the report arrives.'],
        ]}
      />

      <H2>5. Check the firm, not the pitch deck</H2>
      <P>
        Treat a market maker like any other provider you are about to trust with money. Confirm which
        legal entity signs the contract and where it is based. Ask for references from token projects
        they currently work with, and contact those projects through their own public channels, not
        through introductions from the firm. Ask how they handle conflicts of interest, such as trading
        for their own book in tokens they make markets in. Our{' '}
        <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">
          30-minute verification routine
        </Link>{' '}
        works for market makers too, and{' '}
        <Link href="/how-we-verify" className="text-blue-deep">
          how we verify providers
        </Link>{' '}
        explains the checks we run before a company gets the Verified badge.
      </P>

      <H2>Red flags</H2>
      <BulletList
        items={[
          ['Guaranteed price, volume or listing:', 'nobody can promise these legally and honestly.'],
          ['"Volume support" or a daily volume target:', 'this is wash trading under another name.'],
          ['No legal entity or a refusal to name one:', 'you need someone to hold to the contract.'],
          ['References that only come through the firm:', 'and projects that will not confirm the relationship publicly or privately.'],
          ['Reports you cannot verify:', 'only screenshots and summary charts.'],
          ['Pressure to sign before a listing date:', 'the listing date is your problem, not a reason to skip the contract review.'],
        ]}
      />
      <P>
        Many of these overlap with the general{' '}
        <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
          red flags when hiring Web3 service providers
        </Link>
        .
      </P>

      <H2>Where market making fits in a token launch</H2>
      <P>
        Market making is one item in a longer launch plan. Authorities, metadata, supply and vesting,
        liquidity and the legal review all need to be settled first, and a lawyer should read the
        market making contract before you sign it. The{' '}
        <Link href="/blog/solana-token-launch-checklist" className="text-blue-deep">
          Solana token launch checklist
        </Link>{' '}
        covers the full sequence, and if you are launching around Breakpoint, see the{' '}
        <Link href="/blog/breakpoint-2026-pre-launch-checklist" className="text-blue-deep">
          Breakpoint 2026 pre-launch checklist
        </Link>
        .
      </P>
    </BlogPost>
  );
}
