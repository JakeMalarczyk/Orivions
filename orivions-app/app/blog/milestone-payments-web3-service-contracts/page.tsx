import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'milestone-payments-web3-service-contracts';

export const metadata = postMetadata(SLUG);

const EXAMPLE: [string, string][] = [
  ['Milestone 1, specification (15%):', 'written specification, account and instruction design, milestone plan. Accepted when you sign off the document.'],
  ['Milestone 2, core program (30%):', 'program deployed to devnet, passing the listed tests including failure paths. Accepted after your review.'],
  ['Milestone 3, frontend and integrations (25%):', 'all main user flows working on devnet against the deployed program.'],
  ['Milestone 4, audit fixes (15%):', 'all audit findings resolved or explicitly accepted, confirmed in the fix review.'],
  ['Milestone 5, mainnet launch (15%):', 'deployed from the audited commit with a verifiable build, authorities handed to your multisig, handover documentation delivered.'],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Milestone payments and escrow"
      summary={[
        'Pay per accepted milestone, not per month of activity and not all upfront.',
        'Every milestone needs a written acceptance criterion both sides can check.',
        'A modest deposit for the first milestone is fair; full prepayment is not.',
        'Escrow, through a neutral party or a smart contract, protects both sides when trust is still low.',
        'Agree in writing how disputes are handled before work starts.',
      ]}
      cta={{
        title: 'Hire verified Solana providers',
        text: 'Describe your project and get matched with verified teams. Free for clients; providers pay only on completed engagements.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Payment terms are where many Web3 engagements go wrong. Pay everything upfront and you carry
        all the risk; ask a provider to wait until the end and good teams will decline. Milestones
        split the risk fairly: the provider is paid as value is delivered, and you never have more
        money at stake than the next piece of work.
      </P>

      <H2>What makes a good milestone</H2>
      <BulletList
        items={[
          ['A concrete deliverable:', 'a document, a deployed program, a working flow, a report. Not "two weeks of development".'],
          ['A written acceptance criterion:', 'how you will check it, for example a program at a given devnet address passing listed tests.'],
          ['A review window:', 'how many days you have to accept or raise issues, after which it is accepted by default.'],
          ['A share of the budget:', 'proportional to the effort, so neither side is far ahead of the other at any point.'],
        ]}
      />

      <H2>An example for a Solana dApp</H2>
      <P>A typical split for a project with a program, a frontend and an external audit:</P>
      <BulletList items={EXAMPLE} />

      <H2>Deposits and escrow</H2>
      <P>
        A deposit for the first milestone, often 10 to 30 percent of it, is reasonable and protects
        the provider from clients who disappear. Beyond that, escrow can remove the need to trust
        either side: you deposit the milestone amount with a neutral party, or into a smart contract,
        and the funds are released when the milestone is accepted.
      </P>
      <P>
        On-chain escrow works well for clearly defined milestones paid in stablecoins. It still
        needs an agreed process for disagreements: who decides, how quickly, and what evidence
        counts. An escrow without a dispute process only moves the argument.
      </P>

      <Callout>
        <b>Paying in crypto?</b> Agree the currency (usually a stablecoin such as USDC), the network,
        who pays transaction fees, and the exact wallet addresses in the contract. Confirm addresses
        through a second channel before the first payment; changed payment details are a classic
        fraud pattern.
      </Callout>

      <H2>When a milestone is disputed</H2>
      <BulletList
        items={[
          ['Go back to the criterion:', 'most disputes are about vague acceptance criteria. Compare the deliverable with the written criterion, not with expectations.'],
          ['Separate defects from scope changes:', 'bugs are fixed within the milestone; new requests are new scope with their own price.'],
          ['Use partial acceptance:', 'accept and pay what works, and agree a short timeline for the rest.'],
          ['Escalate as agreed:', 'to the escrow agent, an agreed reviewer such as the auditor, or mediation.'],
        ]}
      />

      <P>
        Clear milestones start with a clear brief; use our{' '}
        <Link href="/blog/solana-project-brief-template" className="text-blue-deep">
          Solana project brief template
        </Link>
        . And before you pay anyone, run through the{' '}
        <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
          red flags when hiring Web3 providers
        </Link>
        .
      </P>
    </BlogPost>
  );
}
