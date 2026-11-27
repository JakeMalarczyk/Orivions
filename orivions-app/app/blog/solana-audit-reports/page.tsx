import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-audit-reports';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana audit reports"
      answer="Find a Solana audit report in the project's docs or repository, on the audit firm's own publications, or through the auditors listed in the program's on-chain security.txt. Then check five things: the commit it reviewed, the programs in scope, which findings were fixed, whether a fix review was done, and that the program on mainnet was built from the reviewed code."
      glance={{
        caption: 'Five checks that tie a report to the live program',
        head: ['Check', 'Where to look', 'Red flag'],
        rows: [
          ['Commit', 'The scope section of the report', 'No commit hash, only a repository name'],
          ['Programs in scope', 'Scope and out-of-scope lists', 'The program you use is not listed'],
          ['Findings', 'Findings table with statuses', 'Critical or high findings marked acknowledged, not fixed'],
          ['Fix review', 'A dated section or a second report', 'Fixes shipped after the audit with no review'],
          ['Deployed code', 'Verifiable build and upgrade authority', 'No verified build, one wallet can upgrade'],
        ],
        note: 'A report covers one commit at one point in time. Every upgrade after it is unaudited until it is reviewed.',
      }}
      summary={[
        'Look in the project docs and repository first, then the audit firm publications.',
        'The on-chain security.txt can name the auditors and link to the source code.',
        'A report is only useful if you can tie its commit to the program on mainnet.',
        'Check finding statuses and the fix review, not just the word audited.',
        'Who holds the upgrade authority decides whether the audited code can change tomorrow.',
      ]}
      cta={{
        title: 'Need your own audit?',
        text: 'Send your scope once. Up to three verified audit firms quote the same brief, usually within 72 hours, with a start within 2 weeks for small programs. Free for teams.',
        href: '/solana-audit-quotes?ref=audit-reports-guide',
        label: 'Get audit quotes →',
      }}
    >
      <P>
        Teams link to audit reports to show that their program is safe to use. Users, partners and
        investors read them to decide how much to trust it. Both only work if the report covers the
        code that actually runs on mainnet. This guide shows where to find Solana audit reports and
        how to tie one to the live program. To understand the report itself, read{' '}
        <Link href="/blog/how-to-read-a-smart-contract-audit-report" className="text-blue-deep">
          how to read a smart contract audit report
        </Link>
        .
      </P>

      <H2>Where to find a Solana audit report</H2>
      <BulletList
        items={[
          ['The project itself:', 'docs, a security page on the website, or the GitHub repository, often in a folder called audits. This is the best place, because the team chose which report applies.'],
          ['The audit firm:', 'many firms publish client reports on their own site or repository. Use it to confirm a report the project links to is real and unchanged.'],
          ['The on-chain security.txt:', 'a Solana program can embed a security.txt with contacts, a link to the source code and the auditors. Solana explorers show it on the program page when it is present.'],
          ['Ask the team:', 'if nothing is public, ask for the report and the audited commit. A team that will not share either is telling you something.'],
        ]}
      />

      <H2>Five checks that tie a report to the live program</H2>
      <P>
        Reading a report is half the work. The other half is proving it describes the program you
        are about to use or invest in.
      </P>
      <BulletList
        items={[
          ['1. The commit:', 'the report should name the exact commit it reviewed. A repository name without a commit is not enough, because the code changes every day.'],
          ['2. The scope:', 'confirm the program you care about is in scope. Reports often exclude the frontend, keepers, oracles or a second program.'],
          ['3. The findings:', 'look at the status of each critical and high finding. Fixed is good. Acknowledged means the team accepted the risk.'],
          ['4. The fix review:', 'fixes written after the audit are new code. A fix review, dated after the main report, shows the auditor checked them.'],
          ['5. The deployed code:', <>a <Link href="/blog/solana-verifiable-builds-explained" className="text-blue-deep">verifiable build</Link> proves the program on mainnet was built from a public commit. Compare that commit with the one in the report or the fix review.</>],
        ]}
      />

      <Callout>
        <b>The step most people skip:</b> check who can upgrade the program today. If one wallet holds
        the upgrade authority, the audited code can be replaced at any time. Paste the program address
        into the free{' '}
        <Link href="/tools/solana-program-check" className="text-blue-deep">upgrade authority checker</Link>{' '}
        and read{' '}
        <Link href="/blog/solana-program-upgrade-authority-multisig" className="text-blue-deep">
          why a multisig matters
        </Link>
        .
      </Callout>

      <H2>If you are the team publishing the report</H2>
      <BulletList
        items={[
          ['Publish it next to the code:', 'a link in the docs and the repository, with the audited commit in the file name or the first line.'],
          ['Fill in security.txt:', 'list the auditors and link to the source code, so anyone can find both from the program page.'],
          ['Ship a verifiable build:', 'so the link between the report and mainnet can be checked without trusting you.'],
          ['Publish the fix review too:', 'it answers the first question every reader asks about the findings.'],
          ['Plan the next review:', <>every upgrade changes the code. The <Link href="/tools/solana-audit-timeline-planner" className="text-blue-deep">audit timeline planner</Link> shows how far ahead to book it.</>],
        ]}
      />

      <P>
        Preparing for your own audit? Run the free{' '}
        <Link href="/tools/solana-audit-readiness-check" className="text-blue-deep">audit readiness check</Link>{' '}
        and estimate the price with the{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>.
      </P>
    </BlogPost>
  );
}
