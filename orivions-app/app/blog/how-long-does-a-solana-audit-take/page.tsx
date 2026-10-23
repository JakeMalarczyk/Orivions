import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-long-does-a-solana-audit-take';

export const metadata = postMetadata(SLUG);

const PHASES: [string, string, string][] = [
  ['Finding and booking an auditor', '1 to 2 weeks', 'Shortlist, scoping calls, quotes, contract'],
  ['Waiting for the start date', '2 to 8 weeks', 'Good firms are booked ahead, more so before big launches'],
  ['The review itself', '1 to 4+ weeks', 'Depends on code size, complexity and team size'],
  ['Fixing findings', '3 days to 2 weeks', 'Your team, in parallel with report drafting'],
  ['Fix review and final report', '3 to 10 days', 'Auditors re-check every fix and publish the report'],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="How long a Solana audit takes"
      answer="A Solana audit takes about 1-2 weeks of review for a simple or standard program of up to 1,500 lines, 3-5 weeks for a 3,000-line DeFi protocol, and 6-12 weeks for a large multi-program protocol in native Rust. Including booking, the wait for a slot, fixes and the fix review, plan 6-12 weeks from first call to final report."
      glance={{
        caption: 'Solana audit timeline at a glance',
        head: ['Project', 'Code in scope', 'Engineer-days', 'Review time'],
        rows: [
          ['Simple (token vesting)', '500 lines', '3.5', '1-2 weeks'],
          ['Standard (staking)', '1,500 lines', '7.5', '1-2 weeks'],
          ['DeFi (lending, 2 programs, oracle)', '3,000 lines', '23', '3-5 weeks'],
          ['Large DeFi (perps DEX, native Rust, 3 programs)', '6,000 lines', '56.5', '6-12 weeks'],
        ],
        note: 'From our audit cost calculator method: Anchor unless noted, fix review included, no rush. Short end: two engineers in parallel; long end: one engineer. Booking and waiting for a start date come on top.',
      }}
      summary={[
        'The review itself usually takes one to four weeks; the whole process, from first call to final report, more often takes six to twelve.',
        'The longest wait is often the queue: established Solana auditors are commonly booked several weeks ahead.',
        'Code size and complexity set the review length; two engineers in parallel roughly halve the calendar time.',
        'Plan the fix review into the schedule. A report without re-checked fixes is not the end of the audit.',
        'Contact auditors as soon as the scope is stable, not when the code is finished.',
      ]}
      cta={{
        title: 'Estimate your audit timeline',
        text: 'Enter lines of code, complexity and framework to get an indicative cost and calendar time, then get a hand-picked shortlist of Solana auditors. Free for teams.',
        href: '/tools/solana-audit-cost-calculator',
        label: 'Open the calculator →',
      }}
    >
      <P>
        &quot;We launch in three weeks, can you audit us?&quot; is one of the most common messages
        Solana auditors receive, and the honest answer is usually no. Not because the review takes
        three weeks, but because everything around it does: finding the right firm, waiting for a
        slot, fixing what they find and having the fixes checked.
      </P>

      <H2>The short answer</H2>
      <P>
        For a single Anchor program of a few thousand lines, the review itself typically takes one to
        three weeks with two engineers. Large DeFi protocols with several programs, custom math and
        integrations can take a month or more. Counting booking, waiting and the fix review, most
        teams should plan six to twelve weeks from the first call to a published report.
      </P>

      <H2>Where the time goes</H2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
              <th className="px-4 py-3 font-semibold">Phase</th>
              <th className="px-4 py-3 font-semibold">Typical time</th>
              <th className="px-4 py-3 font-semibold">What happens</th>
            </tr>
          </thead>
          <tbody>
            {PHASES.map(([phase, time, what]) => (
              <tr key={phase} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold">{phase}</td>
                <td className="px-4 py-3 tabular-nums">{time}</td>
                <td className="px-4 py-3 text-gray">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        These ranges are typical, not guaranteed. A small program with a firm that has a gap in its
        calendar can go from first call to report in two weeks; a novel protocol in a busy season can
        wait two months just to start.
      </P>

      <H2>What makes the review longer</H2>
      <BulletList
        items={[
          ['Code size in scope:', 'the main driver. Auditors estimate engineer-days from lines of program code, excluding tests.'],
          ['Complexity:', 'custom pricing curves, liquidations, CPIs into other protocols and upgrade logic take far longer per line than simple state updates.'],
          ['Native Rust instead of Anchor:', 'more hand-written account validation to check, so more time per feature.'],
          ['A moving target:', 'code that changes during the audit forces auditors to re-read parts of it, and leaves gaps.'],
          ['Missing context:', 'no specification, no tests and no one available to answer questions all slow the first week down.'],
        ]}
      />

      <H2>How to get audited sooner</H2>
      <BulletList
        items={[
          ['Book early:', 'contact auditors when the design and scope are stable, typically four to eight weeks before you need the report. You can move the start date; you cannot create a free slot.'],
          ['Freeze a commit:', 'audit a tagged commit and keep new features on a separate branch.'],
          ['Send a short spec:', 'what each instruction does, who may call it, and the invariants that must always hold.'],
          ['Ship tests and a local setup:', 'auditors who can run your tests in an hour start finding real issues on day one.'],
          ['Cut scope:', 'leave unlaunched features out and audit them when they ship.'],
          ['Keep a developer on call:', 'answering auditor questions within hours, not days, is the cheapest way to shorten the review.'],
        ]}
      />

      <Callout>
        <b>Rush audits cost more and often find less.</b> If a firm offers to fully review a complex
        protocol in a few days, ask how many engineers, for how many days, and what is out of scope.
        Less time on your code is the most common reason audits miss bugs.
      </Callout>

      <H2>Do not forget the fix review</H2>
      <P>
        The first report is a list of findings, not a clean bill of health. Your team fixes them, and
        the auditors check every fix before the final report. Budget three to ten days for this,
        include it in the quote, and do not schedule the launch for the day the first report lands.
        Our{' '}
        <Link href="/blog/how-to-read-a-smart-contract-audit-report" className="text-blue-deep">
          guide to reading an audit report
        </Link>{' '}
        explains what to check before you call it done.
      </P>

      <H2>A realistic plan for a mainnet launch</H2>
      <P>
        Work backwards from the launch date: at least a week of buffer before launch, the fix review
        before that, your fixes before that, the review itself, and the start date the auditor gave
        you. If that puts the first call in the past, either move the launch or cut the scope. For the
        rest of the launch, go through the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>
        , and to compare firms, see{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana auditor
        </Link>
        .
      </P>
    </BlogPost>
  );
}
