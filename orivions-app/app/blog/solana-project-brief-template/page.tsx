import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-project-brief-template';

export const metadata = postMetadata(SLUG);

const TEMPLATE = `PROJECT BRIEF

1. One-line summary
   What are you building, for whom?

2. Goal and success metric
   What should be true 3 months after launch? (users, volume, partners)

3. Users and main flows
   Who uses it, and the 3-5 things they must be able to do.

4. On-chain scope
   Programs, accounts and instructions you expect. Tokens or NFTs involved.
   Anchor, native Rust, or "you recommend".

5. Off-chain scope
   Frontend, wallets to support, backend, indexer, keepers, admin tools.

6. Integrations
   Protocols, oracles, bridges, APIs you must connect to.

7. Constraints
   Launch date and why. Audit needed (yes/no). Compliance limits.
   Who will own the code, repo and upgrade authority (should be you).

8. What already exists
   Designs, code, specification, previous audits, team members.

9. Budget range
   e.g. $15,000-25,000 for the first release, audit budgeted separately.

10. How to respond
    Deadline for proposals, what you want in them, who decides.`;

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana project brief template"
      summary={[
        'A good brief fits on one or two pages and answers what, for whom, by when and for how much.',
        'Separate on-chain scope (programs, accounts, tokens) from off-chain scope (frontend, indexers, keepers).',
        'State constraints upfront: launch date, audit, integrations and who owns the keys and code.',
        'Share a budget range; it makes quotes realistic and comparable.',
        'Send the same brief to every team so you compare like with like.',
      ]}
      cta={{
        title: 'Turn your brief into matches',
        text: 'Paste the summary of your brief into Smart Match and get verified Solana teams that fit, with a reason for each. Free for teams.',
        href: '/smart-match',
        label: 'Try Smart Match →',
      }}
    >
      <P>
        The quality of the quotes you receive depends on the quality of the brief you send. A
        two-line message produces guesses; a clear one-page brief produces estimates you can
        compare. This guide explains what to include, and ends with a template you can copy.
      </P>

      <H2>Why the brief matters more on Solana</H2>
      <P>
        On Solana, the expensive decisions happen early: how accounts are laid out, which parts run
        on-chain, how the program will be upgraded and audited. A team that has to guess these
        things will either pad its estimate or underquote and renegotiate later. A brief that
        answers them upfront saves both sides time and money.
      </P>

      <H2>What to include</H2>
      <BulletList
        items={[
          ['Goal and success metric:', 'what should be true three months after launch. Teams design differently for a demo than for a protocol expecting real volume.'],
          ['Users and main flows:', 'who uses it and the three to five things they must be able to do. This drives most of the scope.'],
          ['On-chain scope:', 'programs, accounts, instructions, tokens or NFTs you expect. If you do not know, say so and ask the team to propose a design.'],
          ['Off-chain scope:', 'frontend, supported wallets, backend services, indexers, keepers and admin tools. Often half of the work.'],
          ['Integrations:', 'every external protocol, oracle, bridge or API. Each one adds code, testing and audit scope.'],
          ['Constraints:', 'launch date and why it matters, whether an audit is required, and that you will own the code, repository and upgrade authority.'],
          ['What exists:', 'designs, code, a specification, previous audits, or people on your side who will review the work.'],
          ['Budget range:', 'a range for the first release, with the audit budgeted separately.'],
        ]}
      />

      <Callout>
        <b>Not sure about the technical parts?</b> That is fine. Describe the outcome and ask each
        team to propose an architecture. Their proposals are a useful test of how well they
        understand Solana. See also{' '}
        <Link href="/blog/anchor-vs-native-rust-solana" className="text-blue-deep">
          Anchor vs native Rust
        </Link>
        .
      </Callout>

      <H2>Template</H2>
      <P>Copy this into a document, fill in what you know, and mark the rest as open questions.</P>
      <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-bg-soft p-5 text-[13px] leading-relaxed text-[#27272E]">
        {TEMPLATE}
      </pre>

      <H2>After you send it</H2>
      <P>
        Send the same brief to three to five teams and ask each for scope, milestones, team
        members, timeline and price. Compare the answers with{' '}
        <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
          the twelve questions to ask a Solana development company
        </Link>
        , and check typical costs in{' '}
        <Link href="/blog/how-much-does-it-cost-to-build-a-solana-dapp" className="text-blue-deep">
          how much a Solana dApp costs
        </Link>
        . When you sign, structure payments around milestones as described in{' '}
        <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
          milestone payments for Web3 contracts
        </Link>
        .
      </P>
    </BlogPost>
  );
}
