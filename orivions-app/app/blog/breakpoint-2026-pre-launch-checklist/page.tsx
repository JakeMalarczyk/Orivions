import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'breakpoint-2026-pre-launch-checklist';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Breakpoint 2026 pre-launch checklist"
      summary={[
        'Breakpoint 2026 runs 15-17 November at Olympia London. Many teams time launches and announcements around it.',
        'Anything that needs an outside team (audit, fix review, legal review, market making) has to be booked weeks before, not at the event.',
        'Security first: frozen commit, audit with fix review, upgrade authority in a multisig, verifiable build.',
        'Token launches need authorities, metadata, vesting and a legal view sorted before announcement day.',
        'Use the event to meet providers you have already checked, not to pick one on the spot.',
      ]}
      cta={{
        title: 'Need an auditor or a dev team before Breakpoint?',
        text: 'Describe what you need and when. We hand-pick verified Solana providers who can fit your timeline. Free for teams.',
        href: '/smart-match',
        label: 'Start Smart Match →',
      }}
    >
      <P>
        Breakpoint, the Solana Foundation&apos;s yearly conference, takes place on 15-17 November 2026
        at Olympia London. For many teams it is a deadline: a mainnet launch, a token, a big
        announcement. The work that decides whether that launch goes well happens in the weeks before,
        and much of it depends on outside teams with their own calendars.
      </P>

      <H2>The short answer</H2>
      <P>
        If you plan to launch around Breakpoint, sort out four things now: the security of your
        programs (audit and fix review), control of upgrade and token authorities, the legal view on
        your token or product, and who runs liquidity and launch communication. Book every outside
        provider before the event. During Breakpoint, use the time to meet people, not to start
        vendor searches.
      </P>

      <H2>1. Security: the longest lead time</H2>
      <BulletList
        items={[
          ['Is the audit booked?', <>Good Solana auditors are often booked weeks ahead, and the whole process usually takes longer than the review itself. See <Link href="/blog/how-long-does-a-solana-audit-take" className="text-blue-deep">how long a Solana audit takes</Link>.</>],
          ['Frozen commit:', 'the code you launch should be the code that was audited, plus reviewed fixes.'],
          ['Fix review in the schedule:', 'do not plan the launch for the day the first report arrives.'],
          ['Pre-launch checks:', <>Run the <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">pre-launch security checklist</Link> and, for Anchor programs, the <Link href="/blog/anchor-security-checklist" className="text-blue-deep">Anchor security checklist</Link>.</>],
        ]}
      />

      <H2>2. Authorities and keys</H2>
      <BulletList
        items={[
          ['Upgrade authority:', 'held by a multisig, or deliberately removed, with the decision written down.'],
          ['Verifiable build:', 'so anyone can check that the deployed program matches your public source.'],
          ['Token authorities:', 'mint and freeze authority set or revoked on purpose, not by default.'],
          ['Incident plan:', 'who can pause what, who gets called first, and how you tell users.'],
        ]}
      />

      <H2>3. Token launch</H2>
      <P>
        If a token is part of the launch, go through the{' '}
        <Link href="/blog/solana-token-launch-checklist" className="text-blue-deep">
          Solana token launch checklist
        </Link>
        : authorities, metadata, Token-2022 extensions, supply and vesting, liquidity, legal review
        and launch-day communication. Market making and exchange conversations take time; if you need
        a market maker, start now and read the contract terms carefully.
      </P>

      <H2>4. Legal and contracts</H2>
      <BulletList
        items={[
          ['Legal view on the token or product:', 'especially if you have users in the EU, UK or US.'],
          ['Terms and privacy policy:', 'live before users arrive, not after.'],
          ['Provider contracts:', <>milestones with acceptance criteria and clear ownership of code. See <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">milestone payments for Web3 service contracts</Link>.</>],
        ]}
      />

      <H2>5. Growth and launch communication</H2>
      <BulletList
        items={[
          ['One message:', 'what you launch, for whom, and the one action you want people to take.'],
          ['Agency or in-house:', <>if you hire help, read <Link href="/blog/how-to-choose-a-solana-marketing-agency" className="text-blue-deep">how to choose a Solana marketing agency</Link> first. Guaranteed followers or volume are a red flag.</>],
          ['Event plan:', 'which side events matter for your audience, and who on the team goes to which.'],
        ]}
      />

      <Callout>
        <b>Do not pick a vendor on the event floor.</b> Breakpoint is a good place to meet providers in
        person, but a booth and a good conversation are not due diligence. Shortlist and check them
        before you go, using{' '}
        <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">
          our 30-minute verification routine
        </Link>
        , then use the meeting to confirm fit and timing.
      </Callout>

      <H2>Budget and timeline</H2>
      <P>
        For a first estimate of cost and calendar time, use the{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">
          audit cost calculator
        </Link>{' '}
        and the{' '}
        <Link href="/tools/solana-dapp-cost-calculator" className="text-blue-deep">
          dApp development cost calculator
        </Link>
        . If the numbers or the dates do not fit, cut scope or move the launch. Launching after
        Breakpoint with audited code is better than launching at Breakpoint without it.
      </P>
    </BlogPost>
  );
}
