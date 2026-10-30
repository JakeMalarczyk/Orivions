import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-audit-readiness-checklist';

export const metadata = postMetadata(SLUG);

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Code',
    items: [
      ['Freeze a tagged commit.', 'Auditors review one exact commit. Keep new features on a separate branch until the report is final.'],
      ['Finish the features in scope.', 'Code that is half built or marked as a placeholder gets reviewed twice or not at all. Cut unlaunched features from scope.'],
      ['Clean the build.', 'The program should compile from a clean checkout with pinned Rust, Solana and Anchor versions, and no failing tests.'],
    ],
  },
  {
    title: 'Documentation',
    items: [
      ['Write a short spec.', 'For each instruction: what it does, who may call it, which accounts it touches and what it must never allow.'],
      ['List your invariants.', 'Total supply equals the sum of balances, only the authority can move funds, debt never exceeds collateral. Auditors test what you state and find what you forgot.'],
      ['Draw the trust model.', 'Which keys exist, who holds them, what the upgrade authority can do, and which off-chain services the program relies on.'],
    ],
  },
  {
    title: 'Tests',
    items: [
      ['Ship tests that run in one command.', 'Auditors who can run your suite in an hour find real issues on day one instead of fixing the setup.'],
      ['Cover the failure paths.', 'Wrong signer, wrong owner, wrong account, zero and maximum amounts. Happy-path-only tests tell the auditor little.'],
      ['Add fuzzing or property tests where money moves.', 'Even a small fuzz target on the core math raises the quality of the review.'],
    ],
  },
  {
    title: 'Process',
    items: [
      ['Agree scope and exclusions in writing.', 'Programs, commit, what is out of scope (frontend, keepers, oracles, key management) and whether the fix review is included.'],
      ['Name a developer on call.', 'Answering questions within hours is the cheapest way to shorten the review.'],
      ['Plan the fix window.', 'Reserve your engineers for the days after the first report, so fixes land quickly and the fix review can start.'],
    ],
  },
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Audit readiness checklist"
      answer="Before a Solana audit starts, freeze one tagged commit, finish the features in scope, write a short spec with your invariants, make the tests run in one command, agree the scope in writing and keep a developer on call. Teams that arrive prepared get more review time spent on real bugs and usually shorten the audit by days."
      summary={[
        'Prepare a frozen commit, a short spec, a list of invariants and tests that run in one command.',
        'Agree scope, exclusions and the fix review in writing before the start date.',
        'Keep a developer available to answer auditor questions within hours.',
        'Reserve engineering time for the fix window after the first report.',
        'Preparation does not replace the audit. It makes the audit time count.',
      ]}
      cta={{
        title: 'Find a Solana auditor',
        text: 'Describe your program, timeline and budget. Smart Match suggests verified security firms with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Find an auditor →',
      }}
    >
      <P>
        An audit is billed in engineer-days, and every day an auditor spends setting up your project
        or guessing what a function should do is a day not spent looking for bugs. The twelve items
        below are what a well-prepared team hands over before the start date.
      </P>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <H2>{g.title}</H2>
          <BulletList items={g.items} />
        </section>
      ))}

      <Callout>
        <b>Do the spec and invariants first.</b> Writing them often exposes a design problem before
        anyone is paid to find it, and it is the single most useful document you can give an
        auditor.
      </Callout>

      <H2>How preparation changes the timeline</H2>
      <P>
        Booking and the wait for a slot usually take longer than the review itself, so preparation
        cannot remove them. What it can do is keep the review from stretching: a frozen commit,
        clear spec and working tests avoid re-reading and back-and-forth. The full breakdown is in{' '}
        <Link href="/blog/how-long-does-a-solana-audit-take" className="text-blue-deep">
          how long a Solana audit takes
        </Link>
        . For what the audit costs, see{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          the audit cost guide
        </Link>{' '}
        and the{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">
          cost calculator
        </Link>
        .
      </P>
      <P>
        Once you are ready, choose the firm with{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          the auditor checklist
        </Link>
        , and plan the rest of the launch with the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          pre-launch security checklist
        </Link>
        .
      </P>
    </BlogPost>
  );
}
