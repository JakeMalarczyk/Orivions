import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-read-a-smart-contract-audit-report';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Reading an audit report"
      summary={[
        'Start with the scope: which programs, at which commit, and what was out of scope.',
        'Severity levels rank impact and likelihood; read the auditor’s own definitions.',
        '"Resolved", "acknowledged" and "partially resolved" mean very different things.',
        'A fix review confirms the fixes; without it, the report describes code that no longer exists.',
        'Audited means this commit, this scope, this time. Check that it matches what is deployed.',
      ]}
      cta={{
        title: 'Need an audit you can rely on?',
        text: 'Describe your program and timeline. Smart Match suggests verified Solana security firms with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Find an auditor →',
      }}
    >
      <P>
        &quot;Audited by a reputable firm&quot; appears on many landing pages. Whether that means
        much depends on what is inside the report. You do not need to be an auditor to read one
        well; you need to know where to look. This guide walks through a typical Solana audit
        report from top to bottom.
      </P>

      <H2>1. Scope and commit</H2>
      <P>
        The first pages say what was reviewed: which programs, at which commit hash, over which
        dates, and what was explicitly out of scope. This is the most important section. Anything
        not listed, such as the frontend, off-chain keepers, oracles or later upgrades, was not
        audited, however the report is marketed.
      </P>

      <H2>2. Severity levels</H2>
      <BulletList
        items={[
          ['Critical:', 'funds can be stolen or permanently locked, or the protocol can be taken over, usually with little effort.'],
          ['High:', 'serious loss or breakage under realistic conditions.'],
          ['Medium:', 'real but limited impact, or requiring unusual conditions.'],
          ['Low and informational:', 'hardening, best practices and code quality. Worth fixing, rarely urgent.'],
        ]}
      />
      <P>
        Every auditor defines these levels slightly differently, and most include their
        definitions in the report. Read them before comparing reports from different firms.
      </P>

      <H2>3. Finding statuses</H2>
      <BulletList
        items={[
          ['Resolved:', 'fixed, and the fix was checked by the auditor.'],
          ['Partially resolved:', 'the risk was reduced but not removed. Read the remaining risk.'],
          ['Acknowledged:', 'the team chose not to fix it, usually with an explanation. Not the same as resolved.'],
          ['Unresolved or open:', 'no fix and no accepted explanation at the time of the report.'],
        ]}
      />

      <Callout>
        <b>The fastest useful check:</b> scroll to the summary table and look for any critical or
        high finding that is not &quot;resolved&quot;. If there is one, read it and the team&apos;s
        response before you rely on the code.
      </Callout>

      <H2>4. The fix review</H2>
      <P>
        Findings are fixed after the main review, so a good report includes a fix review: the
        auditor checks the fixes at a later commit and updates the statuses. A report without one
        describes code that has since changed. Ask which commit the final version of the report
        covers.
      </P>

      <H2>5. Does it match what is deployed?</H2>
      <P>
        The last step connects the report to reality. The deployed program should come from the
        audited (and fix-reviewed) commit, ideally through a verifiable build that anyone can check.
        Changes after that commit, including upgrades, are not covered unless they were reviewed
        too. More on this in the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>
        .
      </P>

      <H2>Red flags in a report</H2>
      <BulletList
        items={[
          ['No commit hash:', 'there is no way to tell what was actually reviewed.'],
          ['Only generic findings:', 'a list of best practices with nothing specific to the program suggests a shallow review.'],
          ['Very short review for complex code:', 'a large DeFi protocol reviewed in a couple of days deserves questions.'],
          ['The report is not on the project’s or auditor’s own channels:', 'reports should be verifiable at the source.'],
        ]}
      />
      <P>
        Choosing an auditor? Read{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana smart contract auditor
        </Link>{' '}
        and{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          what drives audit cost
        </Link>
        .
      </P>
    </BlogPost>
  );
}
