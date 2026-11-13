import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-write-an-rfp-for-a-smart-contract-audit';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="RFP for a smart contract audit"
      answer="An audit RFP is a one-to-two page brief that you send unchanged to every firm you consider. It names the code and commit to review, what is out of scope, the documents you will provide, the dates you need, and what the report must contain. With the same brief, quotes become comparable."
      glance={{
        caption: 'What an audit RFP should contain',
        head: ['Section', 'What to write', 'Why it matters'],
        rows: [
          ['Project', 'What the program does, who uses it, what funds it holds', 'Lets a firm judge risk and pick the right engineers'],
          ['Scope', 'Repository, commit hash, programs, framework, size', 'Scope is the main driver of effort and quote'],
          ['Out of scope', 'Frontend, off-chain services, third-party programs', 'Prevents surprises about what was not reviewed'],
          ['Materials', 'Spec, architecture notes, tests, earlier audits', 'Less guessing means less time and fewer findings of the wrong kind'],
          ['Timeline', 'Code freeze, preferred start, hard deadline, launch date', 'Firms are booked ahead, dates decide who can take you'],
          ['Deliverables', 'Severity-ranked report, fix review, public or private report', 'Defines what you actually receive'],
          ['Pricing format', 'Engineer-days and rate, what the fix review includes', 'Lets you compare firms on the same basis'],
        ],
        note: 'Send the same document to every firm and answer their questions in writing to all of them.',
      }}
      summary={[
        'Freeze the code and pick a commit hash before you write the RFP, so the scope cannot drift.',
        'List what is out of scope as clearly as what is in scope.',
        'Ask every firm for engineer-days, rate, named reviewers and an example report.',
        'Ask whether fix review is included and how long the firm will check your fixes.',
        'Give the real launch date and the code freeze date, because availability decides the shortlist.',
      ]}
      cta={{
        title: 'Skip the writing, get a shortlist',
        text: 'Describe your program and timeline. We read it and suggest providers that fit your scope, with a reason for each. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Asking five audit firms for a quote usually produces five different numbers, and it is hard
        to tell whether the difference is price or scope. The cause is often your own message: each
        firm saw a slightly different description. An RFP (request for proposal) fixes that. It is a
        short, structured brief that every firm gets word for word, so their answers can be placed
        side by side.
      </P>

      <H2>1. Describe the project in a few lines</H2>
      <P>
        Say what the program does, who uses it and what it controls: user funds, an admin key, an
        oracle feed, a token mint. Firms use this to judge risk and to decide which of their
        engineers fit. Keep it factual. Marketing language tells a reviewer nothing about the code.
      </P>

      <H2>2. Define the scope exactly</H2>
      <BulletList
        items={[
          ['Repository and commit:', 'link the repository and give one commit hash. Freeze the code first, because a moving target is the most common reason a quote changes later.'],
          ['Programs and files:', 'name the programs to be reviewed, the framework (for example Anchor or native Rust) and the approximate size in lines of code.'],
          ['Dependencies:', 'say which libraries or other programs you call, and whether the firm should review how you use them or only your own code.'],
          ['Out of scope:', 'list what you do not want reviewed, such as the frontend, backend services or deployment scripts, so nobody assumes otherwise.'],
        ]}
      />

      <H2>3. List the materials you will provide</H2>
      <P>
        A short specification, an architecture diagram, a list of privileged roles, test instructions
        and any earlier audit reports all save review time. If some of these do not exist yet, say so.
        The{' '}
        <Link href="/blog/solana-audit-readiness-checklist" className="text-blue-deep">
          audit readiness checklist
        </Link>{' '}
        shows what to prepare before you send the RFP.
      </P>

      <H2>4. Give real dates</H2>
      <P>
        State the code freeze date, your preferred start, the latest acceptable report date and the
        launch date if there is one. Good firms are often booked for weeks, so an honest timeline
        decides who can take the work. Do not invent urgency. If the launch date can move, say that
        too.
      </P>

      <H2>5. Say what you want to receive</H2>
      <BulletList
        items={[
          ['Report:', 'findings ranked by severity, with a description, impact and a recommended fix for each.'],
          ['Fix review:', 'ask whether checking your fixes is included, whether it is one round or more, and how long the firm will accept fixes after the report.'],
          ['Publication:', 'say whether you want the report public, and whether you need a shorter summary for users or partners.'],
          ['Communication:', 'a kickoff call, a private channel, and how critical findings are reported during the review rather than only at the end.'],
        ]}
      />

      <H2>6. Ask the same questions of every firm</H2>
      <BulletList
        items={[
          ['Team:', 'who will review the code, how many engineers, and how much Solana experience do they have?'],
          ['Method:', 'manual review only, or also testing tools such as fuzzing? What will not be covered?'],
          ['Sample:', 'an example report from similar work, with client details removed if needed.'],
          ['Effort and price:', 'engineer-days, day rate and total. A fixed price is fine if it comes with the engineer-days behind it.'],
          ['Availability:', 'earliest start and expected duration.'],
          ['Conflicts:', 'any relationship with competing projects or with the providers of your dependencies.'],
        ]}
      />

      <Callout>
        <b>A short RFP template:</b> project in three sentences; repository, commit hash and framework;
        programs in scope and out of scope; materials provided; code freeze, preferred start and latest
        report date; report format, fix review and publication; the six questions above; deadline for
        replies and the name of the person who answers questions.
      </Callout>

      <H2>How to read the responses</H2>
      <P>
        Compare engineer-days first, then rate. Two quotes with the same total can hide very
        different effort. Check that each firm describes the same scope you wrote, and be careful
        with a quote that is much lower than the rest: it may cover less. Then look at the named
        team, the sample report and the dates. The full process is in{' '}
        <Link href="/blog/how-to-compare-solana-audit-firms" className="text-blue-deep">
          how to compare audit firms
        </Link>
        , and what to check about the firm itself is in{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          choosing a Solana auditor
        </Link>
        .
      </P>

      <H2>Mistakes to avoid</H2>
      <BulletList
        items={[
          ['Changing the code after quotes arrive:', 'it invalidates every quote. Freeze first.'],
          ['Sending different briefs to different firms:', 'you lose the main benefit of an RFP.'],
          ['Choosing on price alone:', 'a cheaper quote often reviews less or uses less senior time.'],
          ['Leaving fix review unspecified:', 'ask about it before you sign, not after the report arrives.'],
          ['Starting too late:', 'asking three weeks before launch limits you to whoever has a free slot.'],
        ]}
      />

      <P>
        For an idea of the range, use the{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">
          audit cost calculator
        </Link>{' '}
        and read{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          what a Solana audit costs
        </Link>
        . The glossary has a short definition of an{' '}
        <Link href="/solana-glossary/audit" className="text-blue-deep">audit</Link>, and the{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">
          Solana smart contract audit providers
        </Link>{' '}
        page lists firms we have checked.
      </P>
    </BlogPost>
  );
}
