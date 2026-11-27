import Link from 'next/link';
import ChecklistGuide from '@/components/ChecklistGuide';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';
import { READINESS_GROUPS } from '@/lib/auditReadiness';

const SLUG = 'solana-audit-readiness-checklist';

export const metadata = postMetadata(SLUG);

const GROUPS = READINESS_GROUPS;

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
        When the code is frozen, send every firm the same brief: see{' '}
        <Link href="/blog/how-to-write-an-rfp-for-a-smart-contract-audit" className="text-blue-deep">
          how to write an RFP for a smart contract audit
        </Link>
        . Then choose the firm with{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          the auditor checklist
        </Link>
        , and plan the rest of the launch with the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          pre-launch security checklist
        </Link>
        .
      </P>

      <ChecklistGuide current={SLUG} />

      <P>
        Want a score? Run the free <Link href="/tools/solana-audit-readiness-check" className="text-blue-deep">audit readiness check</Link>: the same twelve items, two minutes, and a list of what to fix first. Related: see <Link href="/blog/how-to-compare-solana-audit-firms" className="text-blue-deep">how to compare audit firms</Link>.
      </P>
    </BlogPost>
  );
}
