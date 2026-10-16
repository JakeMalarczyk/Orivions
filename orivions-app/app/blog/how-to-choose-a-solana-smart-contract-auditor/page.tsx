import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-choose-a-solana-smart-contract-auditor';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Choosing a Solana auditor"
      summary={[
        'Pick an auditor for Solana-specific experience (Anchor or native Rust programs), not general "Web3 security" branding.',
        'Read their past public reports before you read their quote: the quality of findings is the best predictor of what you will get.',
        'Agree the scope in writing: programs, exact commit, what is out of scope, and whether a fix review is included.',
        'Treat guaranteed results, very short turnarounds for complex protocols and price quotes given without looking at the code as red flags.',
        'Freeze the code, write down your invariants and threat model, and book early. Audits reduce risk; they do not certify that code is safe.',
      ]}
      cta={{
        title: 'Compare verified Solana auditors',
        text: 'Describe your program, timeline and budget. Smart Match suggests verified security firms with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Find an auditor →',
      }}
    >
      <P>
        An audit is one of the few purchases where choosing on price or on who answered first in
        Discord can cost you everything you raised. Solana programs that hold user funds usually
        cannot be quietly patched after an exploit, and a bad audit is worse than none because it
        creates false confidence. This is the checklist we would use to compare auditors.
      </P>

      <H2>1. Solana-specific experience, not just &quot;smart contract security&quot;</H2>
      <P>
        Auditing a Solana program is a different job from auditing an EVM contract. The account
        model, cross-program invocations and program-derived addresses create their own classes of
        bugs. Ask which Solana programs the firm has reviewed, whether they were Anchor or native
        Rust, and who on the team did the work. A firm with dozens of Solidity audits and two
        Solana reports is still a junior Solana auditor.
      </P>
      <P>A good Solana auditor should be fluent in issues like:</P>
      <BulletList
        items={[
          ['Missing signer and owner checks', '— accepting an account without verifying who signed or which program owns it.'],
          ['Account substitution', '— passing a different account of the same shape (sometimes called type cosplay) where the program does not check the discriminator or address.'],
          ['PDA mistakes', '— non-canonical bumps, seeds that collide, or authorities derived in a way an attacker can reproduce.'],
          ['Arbitrary CPI', '— invoking a program whose ID was supplied by the caller and never checked.'],
          ['Arithmetic and precision', '— overflow, rounding direction and unit mismatches in token amounts and decimals.'],
          ['Account lifecycle bugs', '— re-initialisation, improperly closed accounts and duplicate mutable accounts in one instruction.'],
        ]}
      />

      <H2>2. Read their public reports first</H2>
      <P>
        Most established firms publish reports. Read two or three for programs similar to yours.
        Look for findings that show the auditor understood the protocol&apos;s logic, not just
        lint-style notes; clear severity ratings; reproduction steps; and concrete recommendations.
        A report that is mostly informational findings about naming and comments tells you what
        the auditor was able to find.
      </P>

      <H2>3. Methodology: how the code will actually be reviewed</H2>
      <P>
        Ask them to walk you through the engagement. Strong answers include manual line-by-line
        review by more than one person, a threat model built from your design documents, testing
        or fuzzing of the invariants that matter (who can move funds, what must always balance),
        and automated tooling as a supplement rather than the main product. Ask how many
        auditor-days or auditor-weeks the quote includes and who exactly is assigned.
      </P>

      <H2>4. Agree the scope in writing</H2>
      <BulletList
        items={[
          ['Programs and commit', '— which programs, at which exact commit hash. Anything merged after that commit is not audited.'],
          ['Out of scope', '— frontend, off-chain keepers, oracles, deployment scripts and admin key management are often excluded. Know what is not covered.'],
          ['Design and economics', '— a code audit may not review whether your incentive or liquidation design can be gamed. Ask explicitly if that matters for you.'],
          ['Fix review', '— confirm that reviewing your fixes is included, and at which commit the final report will be issued.'],
          ['Publication', '— agree whether and when the report will be published. Users and partners will ask for it.'],
        ]}
      />

      <H2>5. Red flags in quotes and conversations</H2>
      <Callout>
        <b>Walk away or dig deeper if you hear:</b> a guarantee that the code will be &quot;100%
        secure&quot;; a fixed price before anyone has looked at the repository; a full review of a
        complex multi-program protocol promised in a day or two; no public reports or no names
        behind the work; or an offer to sell you a badge or certificate rather than a review.
      </Callout>

      <H2>6. Prepare so the audit time goes into your logic</H2>
      <P>
        Auditor time is expensive, so do not spend it on things you could have fixed yourself.
        Freeze the code and stop adding features. Share a short spec of what each instruction
        should do, the invariants that must always hold, known issues and the roles and keys that
        exist (upgrade authority, admins, fee recipients). Make sure tests run with one command.
        Teams that prepare this way usually get deeper findings from the same budget.
      </P>

      <H2>7. After the report</H2>
      <P>
        Fix the findings, get the fixes reviewed, and deploy the exact commit that was reviewed.
        Move the program upgrade authority to a multisig you control, consider a bug bounty once
        you are live, and plan a new review for significant upgrades. An audit reduces risk for one
        version of your code within one scope; it is not a permanent certificate.
      </P>
      <P>
        For indicative pricing and a list of verified security firms, see{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">
          Solana smart contract audits
        </Link>{' '}
        and the live data on{' '}
        <Link href="/insights" className="text-blue-deep">
          Insights
        </Link>
        .
      </P>
    </BlogPost>
  );
}
