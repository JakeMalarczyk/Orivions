import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-program-upgrade-authority-multisig';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Upgrade authority and multisig"
      answer="The upgrade authority of a Solana program is the key that can replace its code, so it controls everything the program does. Do not leave it in the deployer wallet. Move it to a multisig with several independent signers, rehearse an upgrade on devnet, and consider a timelock or making the program immutable once the code is stable and audited."
      glance={{
        caption: 'Who should hold the upgrade authority',
        head: ['Holder', 'Risk', 'Verdict'],
        rows: [
          ['Deployer hot wallet', 'One leaked key replaces the program', 'Avoid'],
          ['Development agency', 'You depend on a third party for your own code', 'Avoid'],
          ['Multisig (for example 3 of 5)', 'Needs several signers to be compromised', 'Good default'],
          ['Multisig plus timelock', 'Users get notice before any change', 'Best while upgradeable'],
          ['None (immutable)', 'No upgrade risk, and no bug fixes', 'When the code is final'],
        ],
      }}
      summary={[
        'Whoever holds the upgrade authority can replace your program with any code, including code that drains funds.',
        'Move it from the deployer wallet to a multisig before launch, with signers who are different people on different devices.',
        'Rehearse one full upgrade through the multisig on devnet, so the first real one is not also the first attempt.',
        'Add a timelock if users hold funds in your program, so changes are visible before they run.',
        'Making the program immutable is irreversible: do it only when the code is final and audited.',
      ]}
      cta={{
        title: 'Get your launch security reviewed',
        text: 'Describe your program and launch date. Smart Match suggests verified Solana auditors and developers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Most teams spend weeks on the code and minutes on the key that can rewrite it. On Solana, a
        program deployed with the upgradeable loader can be replaced by whoever holds its upgrade
        authority. An audit covers the code at one commit. The upgrade authority decides what the
        code will be tomorrow, which makes it one of the first things auditors, partners and
        informed users look at.
      </P>

      <H2>What the upgrade authority is</H2>
      <P>
        A deployed program has a program account and a separate program data account that holds the
        code and the address of its upgrade authority. Anyone can read that address. You can see it
        with <code>solana program show</code> and the program ID, or in a block explorer. If the
        authority is a single wallet, the safety of your whole protocol is the safety of that one
        wallet.
      </P>

      <H2>Why a single key is a problem</H2>
      <BulletList
        items={[
          ['A leaked or phished key:', 'a malicious upgrade can change every instruction in one transaction. The audited code no longer matters.'],
          ['A departing team member or agency:', 'whoever deployed the program often still holds the key long after the project moved on.'],
          ['A lost key:', 'with no one able to sign, you cannot ship a fix even for a critical bug.'],
        ]}
      />

      <H2>Move it to a multisig</H2>
      <P>
        A multisig is a wallet that needs approval from several signers before it executes a
        transaction. On Solana, teams commonly use Squads for this. The steps are the same
        whichever tool you pick:
      </P>
      <BulletList
        items={[
          ['1. Choose signers and a threshold.', 'for example 3 of 5. Pick people, not roles that one person fills, and put each key on its own hardware wallet.'],
          ['2. Create the multisig and note its vault address.', 'this vault address, not a member wallet, becomes the authority.'],
          ['3. Transfer the authority.', <>run <code>solana program set-upgrade-authority</code> with the program ID and <code>--new-upgrade-authority</code> set to the vault address. Check the result with <code>solana program show</code>.</>],
          ['4. Rehearse an upgrade.', 'write a new build to a buffer, give the multisig control of the buffer, propose the upgrade, approve it and execute it, all on devnet first.'],
          ['5. Document the procedure.', 'who proposes, who reviews the diff against the audited commit, who signs, and how a signer is replaced if a key is lost.'],
        ]}
      />

      <Callout>
        <b>Check it from the outside.</b> After the transfer, look the program up in an explorer as
        a stranger would. If it still shows a normal wallet as the authority, the change did not
        happen. Pair this with a verifiable build, as described in the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          pre-launch security checklist
        </Link>
        .
      </Callout>

      <H2>Timelocks and immutability</H2>
      <P>
        A timelock adds a delay between the approval of an upgrade and its execution. It gives
        users and monitors time to see a change and react, and it limits the damage if signers are
        compromised. It matters most when users deposit funds into the program.
      </P>
      <P>
        Making the program immutable removes the authority for good (<code>--final</code> in the
        CLI). It is the strongest guarantee for users and it cannot be undone, so you lose the
        ability to fix bugs. Many teams keep a multisig with a timelock through the first months,
        then revoke the authority once the code has run under real usage and a bug bounty.
      </P>

      <H2>Mistakes we see</H2>
      <BulletList
        items={[
          ['All signers in one place:', 'five keys held by three people who sit in one office, share a password manager, or all use the same phone are not five independent signers.'],
          ['Signers who never signed:', 'a multisig whose members have never executed a transaction is untested. Run a rehearsal.'],
          ['Ignoring other admin keys:', 'a locked upgrade authority does not help if an admin instruction lets one key drain the vault. Review every privileged role, not just the upgrade key.'],
          ['No plan for lost keys:', 'decide how a signer is rotated out before you need to.'],
        ]}
      />

      <H2>If you hired a developer</H2>
      <P>
        State in the contract that you own the code, the repository and the upgrade authority, and
        confirm the transfer on-chain at delivery. The questions in{' '}
        <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
          how to hire a Solana development company
        </Link>{' '}
        cover this, and{' '}
        <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
          milestone payments
        </Link>{' '}
        let you tie the final payment to the handover. Related terms:{' '}
        <Link href="/solana-glossary/upgrade-authority" className="text-blue-deep">upgrade authority</Link>{' '}
        and <Link href="/solana-glossary/multisig" className="text-blue-deep">multisig</Link>.
      </P>
    </BlogPost>
  );
}
