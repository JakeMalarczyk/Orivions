import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'smart-contract-audit-vs-bug-bounty';

export const metadata = postMetadata(SLUG);

const ROWS: [string, string, string][] = [
  ['When', 'Before launch, and before major upgrades', 'After launch, for as long as the code holds value'],
  ['Who looks', 'A chosen firm or researcher', 'Anyone who decides to look'],
  ['Coverage', 'A fixed scope, reviewed systematically', 'Whatever attracts attention, no guarantee'],
  ['Cost', 'A fixed fee, paid whether or not bugs are found', 'Paid only for valid findings'],
  ['Output', 'A report with findings and a fix review', 'Individual reports, paid one by one'],
  ['Best at', 'Finding design and logic flaws early', 'Catching what audits missed, and new bugs from changes'],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Audit vs bug bounty"
      summary={[
        'An audit is a structured review of a fixed scope before launch. A bug bounty rewards anyone who reports a bug later.',
        'A bounty cannot replace an audit: nobody is obliged to look, and bugs are often found after funds are at risk.',
        'Rewards for critical bugs should make reporting clearly more attractive than exploiting.',
        'The usual order: audit, fix review, launch with a bounty, then re-audit major changes.',
      ]}
      cta={{
        title: 'Find a Solana auditor',
        text: 'Describe your programs and timeline. Smart Match suggests verified Solana security firms with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Find an auditor →',
      }}
    >
      <P>
        &quot;Do we need an audit if we run a bug bounty?&quot; comes up whenever a team looks at
        audit quotes. The two are often compared on price, but they do different jobs at different
        times. Protocols that hold real value on Solana usually need both.
      </P>

      <H2>The comparison</H2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-soft">
            <tr>
              <th className="p-3 font-semibold"> </th>
              <th className="p-3 font-semibold">Audit</th>
              <th className="p-3 font-semibold">Bug bounty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ROWS.map(([k, a, b]) => (
              <tr key={k}>
                <td className="p-3 font-semibold">{k}</td>
                <td className="p-3 text-gray">{a}</td>
                <td className="p-3 text-gray">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>What an audit gives you</H2>
      <P>
        Auditors review a defined set of programs at a specific commit, systematically and on a
        deadline. They look for account validation gaps, missing signer and owner checks, unsafe
        arithmetic, broken invariants and economic attacks, and they deliver a report and a fix
        review. You get coverage you can plan around before any user deposits a token. See{' '}
        <Link href="/blog/how-to-read-a-smart-contract-audit-report" className="text-blue-deep">
          how to read an audit report
        </Link>{' '}
        and{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          what drives audit cost
        </Link>
        .
      </P>

      <H2>What a bug bounty gives you</H2>
      <P>
        A bounty is a public promise to pay for valid vulnerability reports. It brings in many
        researchers with different skills, keeps working after launch, and catches bugs introduced
        by later changes or by new interactions with other protocols. You pay only for results, but
        there is no guarantee that anyone looks at a given part of the code.
      </P>

      <Callout>
        <b>Why a bounty alone is not enough:</b> without an audit, the first person to find a
        critical bug may be an attacker rather than a researcher. A bounty works best on code that
        has already been reviewed, so the remaining bugs are rarer and harder to find.
      </Callout>

      <H2>Designing a bounty that works</H2>
      <BulletList
        items={[
          ['Clear scope:', 'list the program addresses, repositories and what is out of scope.'],
          ['Rewards that match the risk:', 'scale critical rewards with the value at risk, with a fixed maximum, so reporting beats exploiting.'],
          ['Severity definitions:', 'say what counts as critical, high and medium, and how proof of concept must be shown.'],
          ['Safe harbor:', 'promise not to take legal action against researchers who follow the rules.'],
          ['A fast response:', 'acknowledge reports quickly and pay on time. Researchers talk to each other.'],
        ]}
      />

      <H2>The usual order</H2>
      <BulletList
        items={[
          ['1. Internal review and tests:', 'fix the obvious issues yourself first.'],
          ['2. External audit and fix review:', 'see the Solana pre-launch security checklist.'],
          ['3. Launch with a bounty:', 'announce it at or shortly after mainnet launch.'],
          ['4. Re-audit major upgrades:', 'and update the bounty scope when the code changes.'],
        ]}
      />
      <P>
        Before launch, also go through the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>
        , and when you compare auditors, use{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana smart contract auditor
        </Link>
        .
      </P>
    </BlogPost>
  );
}
