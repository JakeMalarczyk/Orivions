import Link from 'next/link';
import BlogPost, { Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-pre-launch-security-checklist';

export const metadata = postMetadata(SLUG);

const GROUPS: { title: string; checks: { check: string; why: string }[] }[] = [
  {
    title: 'Keys and authorities',
    checks: [
      {
        check: 'Move the program upgrade authority to a multisig.',
        why: 'A single hot wallet holding the upgrade authority is a single point of failure. Use a multisig (Squads is the common choice on Solana) with signers on separate devices, and never leave the authority with your development agency.',
      },
      {
        check: 'Decide your upgrade policy in public.',
        why: 'Will the program stay upgradeable, sit behind a timelock or become immutable? Users and integrators will ask. Write the answer down before launch.',
      },
      {
        check: 'Review token mint and freeze authorities.',
        why: 'If your token is meant to have a fixed supply, revoke the mint authority. If nobody should be able to freeze user balances, revoke the freeze authority. Document whatever you keep and why.',
      },
      {
        check: 'Audit every admin instruction.',
        why: 'List every instruction that only an admin can call (fees, pauses, parameter changes, withdrawals) and confirm each one checks the right signer and is controlled by the multisig.',
      },
    ],
  },
  {
    title: 'Code and deployment',
    checks: [
      {
        check: 'Deploy exactly the audited commit.',
        why: 'Tag the audited commit, confirm all fixes were reviewed, and deploy from that tag. Anything changed after the audit is unaudited code.',
      },
      {
        check: 'Publish a verifiable build.',
        why: 'A verifiable build lets anyone confirm the on-chain program matches your public source code. It turns "trust us" into something users and auditors can check.',
      },
      {
        check: 'Test failure paths, not just happy paths.',
        why: 'Wrong signer, wrong owner, duplicated accounts, zero amounts, maximum values. Most exploited bugs live in the paths nobody tested.',
      },
      {
        check: 'Rehearse the launch on devnet with production settings.',
        why: 'Run the full deployment and initialisation script, including multisig steps, on devnet first. Launch-day mistakes are usually in scripts, not in programs.',
      },
      {
        check: 'Plan account migrations before you need them.',
        why: 'If a future upgrade changes an account layout, you need a migration path. Reserve space or version your accounts now; it is far harder later.',
      },
    ],
  },
  {
    title: 'Operations',
    checks: [
      {
        check: 'Set up monitoring and alerts.',
        why: 'Alert on unusual outflows, failed transaction spikes, admin instructions and authority changes. You want to know about an incident before your users tell you on X.',
      },
      {
        check: 'Use more than one RPC provider.',
        why: 'A single RPC endpoint is an availability risk for your frontend and your keepers. Configure a fallback and rate limits.',
      },
      {
        check: 'Protect the frontend and domain.',
        why: 'Many drains start with a compromised frontend or DNS, not the program. Enable registrar lock and two-factor authentication, restrict who can deploy the site, and pin third-party scripts.',
      },
      {
        check: 'Write an incident response plan.',
        why: 'Who can pause the protocol, how do they reach each other at 3 a.m., who talks to users, and which partners (exchanges, bridges, auditors) need to be called. Decide this while calm.',
      },
      {
        check: 'Launch a bug bounty.',
        why: 'An audit covers one commit at one point in time. A public bounty gives researchers a reason to report issues instead of exploiting them. Size rewards relative to the funds at risk.',
      },
      {
        check: 'Cap risk at launch.',
        why: 'Deposit caps, rate limits or a guarded launch period limit the damage of an unknown bug while real usage tests your assumptions. Raise limits as confidence grows.',
      },
    ],
  },
];

export default function PostPage() {
  let n = 0;
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Pre-launch security checklist"
      summary={[
        'Put the upgrade authority and every admin role behind a multisig, never a single hot wallet.',
        'Deploy exactly the audited commit and publish a verifiable build.',
        'Revoke token mint and freeze authorities you do not need, and document the ones you keep.',
        'Set up monitoring, RPC redundancy and an incident response plan before launch day.',
        'Launch a bug bounty and cap deposits while real usage tests your assumptions.',
      ]}
      cta={{
        title: 'Need an audit or a security review before mainnet?',
        text: 'Describe your program and launch date. Smart Match suggests verified Solana security firms with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Find a security partner →',
      }}
    >
      <P>
        An audit is necessary, but it is not a launch plan. Many incidents in crypto have nothing
        to do with a clever exploit in the program itself: a leaked key that held the upgrade
        authority, a compromised frontend, an unaudited last-minute change, or nobody noticing a
        drain for hours. These fifteen checks cover what usually goes wrong around the code.
      </P>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <H2>{g.title}</H2>
          {g.checks.map(({ check, why }) => {
            n += 1;
            return (
              <div key={check} className="mt-4 rounded-2xl border border-line p-5">
                <h3 className="font-semibold">
                  {n}. {check}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#27272E]">{why}</p>
              </div>
            );
          })}
        </section>
      ))}

      <Callout>
        <b>Print this list</b> and assign a name to each line. A check without an owner is a
        check nobody did.
      </Callout>

      <P>
        Still choosing an auditor? Start with{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana smart contract auditor
        </Link>{' '}
        and{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          what drives audit cost
        </Link>
        . Terms used here are explained in our{' '}
        <Link href="/solana-glossary" className="text-blue-deep">
          Solana glossary
        </Link>
        .
      </P>
    </BlogPost>
  );
}
