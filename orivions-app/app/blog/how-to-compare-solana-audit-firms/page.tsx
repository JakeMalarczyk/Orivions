import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-compare-solana-audit-firms';

export const metadata = postMetadata(SLUG);

const CRITERIA: [string, string, string][] = [
  ['Solana-specific track record', 'Public reports for Solana programs, ideally similar to yours', 'Their published reports, the audited projects\' repos'],
  ['Anchor and native Rust', 'Which framework the reports cover, and Solana-specific findings', 'Findings on signers, owners, PDAs, CPIs, account closing'],
  ['Methodology', 'Manual review, tests, fuzzing, invariants, formal methods', 'Methodology section of past reports, scoping call'],
  ['People on your code', 'Named engineers, how many, for how many days', 'The quote, not the sales deck'],
  ['Fix review', 'Included in the price, with a final report', 'The quote and the sample report'],
  ['Calendar', 'Start date and review length that fit your launch', 'Written start date in the proposal'],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="How to compare Solana audit firms"
      answer="To compare Solana audit firms, check six things you can verify yourself: recent public reports for Solana programs similar to yours, Anchor or native Rust experience, the methodology, the named engineers and engineer-days in the quote, whether the fix review is included, and a written start date. Ask every firm to quote the same frozen commit."
      glance={{
        caption: 'Audit quote comparison at a glance',
        head: ['Ask each firm for', 'Why it matters'],
        rows: [
          ['Links to recent Solana reports', 'Proves Solana experience; logos do not'],
          ['Engineers and engineer-days', 'This is what you are paying for'],
          ['Price per engineer-day', 'Makes quotes of different sizes comparable'],
          ['Scope: programs, commit, exclusions', 'A cheaper quote often covers less'],
          ['Fix review included?', 'Without it the audit is not finished'],
          ['Written start date', 'Good firms are often booked weeks ahead'],
        ],
        note: 'Fill one row per firm. No ranking: Orivions does not rank auditors.',
      }}
      summary={[
        'Most "best audit firm" lists are written by audit firms or by companies that sell to them. Compare firms on evidence you can check yourself.',
        'The strongest evidence is public: past reports for Solana programs similar to yours, and Solana-specific findings in them.',
        'Ask who will review your code, for how many engineer-days, and whether the fix review is included.',
        'Compare quotes on the same scope and commit. A cheaper quote for a different scope is not cheaper.',
        'Brand matters to investors and users, but fit with your code matters more for finding bugs.',
      ]}
      cta={{
        title: 'Get a shortlist of verified Solana auditors',
        text: 'Describe your program and launch date. We hand-pick auditors whose public work matches your stack. Free for teams.',
        href: '/smart-match',
        label: 'Start Smart Match →',
      }}
    >
      <P>
        Search for the best Solana audit firm and most of what you find are rankings published by
        audit firms, infrastructure providers or marketing agencies. Some are useful, but almost all
        of them have a reason to put someone at the top. This guide does not rank anyone. It gives you
        a framework to compare the firms on your own shortlist using evidence you can check in an
        afternoon.
      </P>

      <H2>The short answer</H2>
      <P>
        Compare Solana audit firms on five things: published reports for Solana programs like yours,
        experience with your framework (Anchor or native Rust), a methodology that goes beyond a manual
        read, the named engineers and engineer-days in the quote, and a fix review included in the
        price. Then check that the start date fits your launch. Everything else is secondary.
      </P>

      <H2>Six criteria, and where to check each</H2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
              <th className="px-4 py-3 font-semibold">Criterion</th>
              <th className="px-4 py-3 font-semibold">What good looks like</th>
              <th className="px-4 py-3 font-semibold">Where to check</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map(([criterion, good, where]) => (
              <tr key={criterion} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold">{criterion}</td>
                <td className="px-4 py-3">{good}</td>
                <td className="px-4 py-3 text-gray">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>How to check an auditor&apos;s portfolio yourself</H2>
      <BulletList
        items={[
          ['Find the reports, not the logos:', 'a logo wall proves a relationship, not a Solana audit. Ask for links to published reports, or find them on the firm\'s site or GitHub.'],
          ['Open three reports for Solana programs:', 'check the date, the commit hash and the programs in scope. Recent work on code similar to yours is worth more than a famous name from years ago.'],
          ['Read the findings, not the summary:', 'Solana-specific issues (missing signer or owner checks, unvalidated PDAs, unsafe CPIs, account closing, arithmetic) show the team knows the runtime. Reports with only generic findings are a warning sign.'],
          ['Cross-check with the audited project:', 'the project\'s repo or docs should link the same report. If it does not, ask why.'],
          ['Check the fix review:', 'a good report lists each finding\'s status after fixes. A report that ends at "findings" was never closed.'],
          ['Ask for a reference:', 'one call with a past Solana client tells you more about communication and timing than any deck.'],
        ]}
      />
      <P>
        Not sure what you are looking at in a report? Our{' '}
        <Link href="/blog/how-to-read-a-smart-contract-audit-report" className="text-blue-deep">
          guide to reading an audit report
        </Link>{' '}
        explains scope, severity and finding statuses in plain English.
      </P>

      <H2>Questions to put in every scoping call</H2>
      <BulletList
        items={[
          ['Who exactly will review our code?', 'Names, and their past Solana reports.'],
          ['How many engineer-days, and how many engineers in parallel?', 'This is what you are buying.'],
          ['What is out of scope?', 'Off-chain services, frontends, oracles and dependencies are often excluded by default.'],
          ['Which commit will you audit, and what happens if it changes?', 'A moving target leaves gaps.'],
          ['Is the fix review included, and how long does it take?', 'Get it in the quote.'],
          ['Will the report be public, and can we link to it?', 'Users and investors will ask.'],
        ]}
      />

      <H2>Comparing quotes fairly</H2>
      <P>
        Quotes for the same project can differ a lot, mostly because firms scope differently. Before
        you compare prices, make every firm quote the same commit, the same programs and the same
        exclusions, and convert each quote to engineer-days. Then compare price per engineer-day,
        start date and whether the fix review is included. For a ballpark before the first call, use
        the{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">
          Solana audit cost calculator
        </Link>
        .
      </P>

      <Callout>
        <b>Brand is a real factor, but a separate one.</b> A well-known name can help with investors,
        exchanges and users. It does not guarantee that the engineers assigned to your code know your
        stack. If you pay for the name, still check the people and the engineer-days.
      </Callout>

      <H2>Red flags</H2>
      <BulletList
        items={[
          ['Guarantees:', 'no firm can promise your code is bug-free or "hack-proof".'],
          ['No Solana reports to show:', 'EVM experience does not transfer automatically to the Solana account model.'],
          ['A full review of a complex protocol in a few days:', 'ask how many engineers and what is out of scope.'],
          ['Pressure to sign today:', 'a real slot can be held for a few days while you check references.'],
          ['Paid placement presented as a ranking:', 'ask any list how it chose its order.'],
        ]}
      />

      <H2>Next steps</H2>
      <P>
        Shortlist three firms, run the checks above, and send all three the same brief. For more on
        what to look for, read{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana smart contract auditor
        </Link>{' '}
        or browse{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">
          verified Solana auditors
        </Link>
        . On Orivions, every listed auditor has passed a manual check of company, portfolio and a
        client reference, and nobody can pay for a higher position.
      </P>
    </BlogPost>
  );
}
