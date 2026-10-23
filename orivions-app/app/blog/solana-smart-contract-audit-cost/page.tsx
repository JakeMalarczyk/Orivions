import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-smart-contract-audit-cost';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana audit cost"
      answer="A Solana smart contract audit costs about $5,500-10,000 for a small 500-line program, $12,000-21,000 for a 1,500-line staking program and $37,000-64,500 for a 3,000-line DeFi protocol, by our calculator method. Large multi-program protocols can pass $90,000. Price follows engineer-days: code size, complexity, framework, integrations and whether the fix review is included."
      glance={{
        caption: 'Solana audit cost at a glance',
        head: ['Project', 'Code in scope', 'Engineer-days', 'Indicative cost'],
        rows: [
          ['Token vesting (simple)', '500 lines', '3.5', '$5,500-10,000'],
          ['Staking (standard)', '1,500 lines', '7.5', '$12,000-21,000'],
          ['Lending, 2 programs, oracle (DeFi)', '3,000 lines', '23', '$37,000-64,500'],
          ['Perps DEX, native Rust, 3 programs', '6,000 lines', '56.5', '$90,500-158,000'],
        ],
        note: 'From our audit cost calculator: $1,600-2,800 per engineer-day, Anchor unless noted, fix review included, no rush. Indicative, not a quote.',
      }}
      summary={[
        'The size and complexity of the code in scope drive most of the price, not the brand of the auditor.',
        'Small single-purpose programs start at around $5,000; large DeFi protocols can cost tens of thousands.',
        'Compare quotes by scope, engineer-days and deliverables against the same frozen commit, not by the total alone.',
        'Rush timelines, unclear scope and missing tests make audits more expensive and less useful.',
        'Budget for the fix review and for re-audits of later upgrades, not only for the first report.',
      ]}
      cta={{
        title: 'Get quotes from verified Solana auditors',
        text: 'Describe your program, timeline and budget. Smart Match suggests verified security firms that fit, with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Find an auditor →',
      }}
    >
      <P>
        &quot;How much does an audit cost?&quot; is usually the first question a Solana team asks
        an auditor, and the honest answer is &quot;it depends on what you send us&quot;. That is
        not evasion. Audit pricing is mostly a function of effort, and effort depends on a handful
        of factors you can understand, and partly control, before you ask for a quote.
      </P>

      <H2>The short answer</H2>
      <P>
        Small, single-purpose programs (a vesting contract, a simple staking program, an NFT
        mint with custom logic) start at around $5,000. Larger DeFi protocols
        with several interacting programs, oracles and complex math can run into the tens of
        thousands. For a range based on your own code, try our free{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">Solana audit cost calculator</Link>;
        live, indicative ranges from verified providers are on our{' '}
        <Link href="/insights" className="text-blue-deep">insights page</Link>.
      </P>
      <P>
        Most auditors price by engineer-time: how many security engineers, for how many days. A
        quote is their estimate of how long it takes to understand your code well enough to find
        what is wrong with it.
      </P>

      <H2>What drives the price</H2>
      <BulletList
        items={[
          ['Code size in scope:', 'the number of lines in the programs being reviewed, excluding tests and generated code. It is the starting point of almost every estimate.'],
          ['Complexity, not just size:', 'custom math, token flows between many accounts, cross-program invocations (CPIs), oracle usage and upgrade logic take far longer to review than straightforward state updates.'],
          ['Number of programs and integrations:', 'every program and external protocol you interact with adds assumptions that must be checked.'],
          ['Novelty:', 'a standard escrow pattern is faster to review than a new AMM curve or liquidation mechanism nobody has seen before.'],
          ['Timeline:', 'auditors are often booked weeks ahead. Asking for an audit to start next week, or to finish in a few days, usually costs more.'],
          ['Deliverables:', 'a fix review, a public report, economic or design review and post-audit support may or may not be included in the base price.'],
        ]}
      />

      <H2>Why two quotes for the same code can differ</H2>
      <P>
        It is normal to receive quotes that differ by a factor of two or more. One auditor may
        plan two engineers for two weeks with a fix review included; another may plan one engineer
        for one week and charge separately for verifying fixes. Neither is necessarily wrong, but
        they are not the same product.
      </P>
      <P>To compare quotes fairly, ask every auditor for the same things:</P>
      <BulletList
        items={[
          ['The exact scope:', 'which programs, at which commit, and what is explicitly out of scope.'],
          ['Engineer-days:', 'how many people, for how many days, and their seniority.'],
          ['Methodology:', 'manual review, automated tooling, fuzzing or invariant testing.'],
          ['Fix review:', 'whether it is included, and how many rounds.'],
          ['Report:', 'a sample of a previous public report, and whether yours will be published.'],
        ]}
      />

      <Callout>
        <b>A cheap audit is expensive</b> if it misses the bug that matters. A quote far below the
        others usually means less time on your code. Ask what was cut before you accept it.
      </Callout>

      <H2>How to get more audit for the same budget</H2>
      <P>
        Auditors spend a large share of their time understanding what your code is supposed to
        do. Everything that shortens that phase leaves more time for finding real issues.
      </P>
      <BulletList
        items={[
          ['Freeze the code:', 'audit a tagged commit and do not keep changing it during the review. Changes mid-audit cost time and leave gaps.'],
          ['Write a short specification:', 'what each instruction does, who may call it, and which invariants must always hold.'],
          ['Ship tests:', 'a good test suite shows intended behaviour and lets auditors try edge cases quickly.'],
          ['Do your own pass first:', 'run linters and static analysis and fix obvious issues before the audit, so the report is not filled with things you could have found yourself.'],
          ['Cut scope:', 'remove dead code and features you are not launching, and audit them later if they ship.'],
        ]}
      />

      <H2>Costs teams forget</H2>
      <P>
        The first report is rarely the last expense. Budget for the fix review, for re-auditing
        meaningful upgrades after launch, and for a bug bounty once real funds are at stake. For
        high-value protocols, many teams use more than one auditor or add a competitive audit on
        top of a private one.
      </P>
      <P>
        Before you book, our{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          checklist for choosing a Solana auditor
        </Link>{' '}
        covers what to look for in a firm, and the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          pre-launch security checklist
        </Link>{' '}
        covers what the audit does not. You can compare verified firms on the{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">
          Solana smart contract audits
        </Link>{' '}
        page.
      </P>
    </BlogPost>
  );
}
