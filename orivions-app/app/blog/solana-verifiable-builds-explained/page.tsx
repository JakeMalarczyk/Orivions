import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-verifiable-builds-explained';

export const metadata = postMetadata(SLUG);

const PRE = 'mt-4 overflow-x-auto rounded-2xl border border-line bg-bg-soft p-5 text-[13px] leading-relaxed text-ink/90';

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana verifiable builds explained"
      answer="A Solana verifiable build proves that the program running on-chain was compiled from a specific commit of a public repository: anyone can rebuild that commit in the same Docker environment and get the same hash. It does not prove the code is secure, so treat it as the link between your audit and your deployment, not as a replacement for the audit."
      glance={{
        caption: 'Verifiable build in five steps',
        head: ['Step', 'What you do', 'Command or check'],
        rows: [
          ['1. Public repo', 'Push the exact commit you will deploy to a public repository', 'Pin the Solana version and commit Cargo.lock'],
          ['2. Build', 'Build inside the official Docker image, not with your local toolchain', 'solana-verify build'],
          ['3. Deploy', 'Deploy the .so file from that build, unchanged', 'solana program deploy'],
          ['4. Compare', 'Check that the on-chain hash matches a fresh build of the commit', 'solana-verify verify-from-repo'],
          ['5. Publish', 'Store the verification data on-chain and request a remote check', 'solana-verify remote submit-job'],
        ],
        note: 'Repeat steps 2 to 5 after every upgrade. An upgrade marks the program as unverified until the new version is verified.',
      }}
      summary={[
        'A verifiable build links the on-chain program to one commit of public source code.',
        'It proves where the code came from, not that the code is safe. Verified is not audited.',
        'Build in Docker with solana-verify, deploy that exact file, then verify and publish the result.',
        'Only the upgrade authority can publish the verification data, so a multisig signs it too.',
        'Every upgrade needs a new verification, tied to the new commit.',
      ]}
      cta={{
        title: 'Need an audit that ends in a verified deployment?',
        text: 'Tell us what you are launching. We suggest audit providers we checked by hand, with a reason for each. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        An audit report names a commit. Users interact with bytes on-chain. Without a{' '}
        <Link href="/solana-glossary/verifiable-build" className="text-blue-deep">
          verifiable build
        </Link>
        , nobody outside your team can confirm that those two are the same code. Solana program
        builds are not deterministic across machines, so building on a laptop and comparing hashes
        usually fails even when nothing is wrong. Verifiable builds fix that by building in a fixed
        Docker environment.
      </P>

      <H2>What a verifiable build proves, and what it does not</H2>
      <BulletList
        items={[
          ['It proves:', 'the on-chain program matches a build of a named repository at a named commit, with the build arguments stored on-chain so anyone can repeat it.'],
          ['It does not prove:', 'that the code is secure, that it was audited, or that the repository belongs to the team you think it does. Check the repository and commit yourself.'],
          ['It is a point in time:', 'if the program is upgradeable, the code can change later. An upgrade removes the verified status until the new version is verified.'],
        ]}
      />
      <P>
        That is why a verifiable build is most useful next to an audit: the report says which commit
        was reviewed, and the verification shows that commit, or a later reviewed one, is what runs
        on mainnet. Our guide on{' '}
        <Link href="/blog/how-to-read-a-smart-contract-audit-report" className="text-blue-deep">
          how to read a smart contract audit report
        </Link>{' '}
        shows where to find the commit in a report.
      </P>

      <H2>How to set one up</H2>
      <P>
        You need Docker, Cargo and the solana-verify CLI, and the source must be in a public
        repository. Private repositories cannot be verified, because the whole point is that anyone
        can rebuild the code.
      </P>
      <pre className={PRE}>{`cargo install solana-verify --locked

# build in the Docker image that matches your Solana version
solana-verify build --library-name $PROGRAM_LIB_NAME
solana-verify get-executable-hash target/deploy/$PROGRAM_LIB_NAME.so

# deploy that exact file, then compare with the on-chain program
solana-verify get-program-hash -u $NETWORK_URL $PROGRAM_ID
solana-verify verify-from-repo -u $NETWORK_URL --program-id $PROGRAM_ID \\
  https://github.com/$REPO_PATH --commit-hash $COMMIT_HASH --library-name $PROGRAM_LIB_NAME

# after uploading the verification data, request the remote check
solana-verify remote submit-job -u $NETWORK_URL --program-id $PROGRAM_ID --uploader $UPLOADER`}</pre>
      <P>
        Set the Solana version in the root Cargo.toml so the tool can pick the right build image. Use
        the library name, not the package name. Do not rebuild with <code>anchor build</code> or{' '}
        <code>cargo build-sbf</code> after <code>solana-verify build</code>, since that overwrites the
        file with one that will not match. Add <code>--mount-path</code> when the program lives in a
        subfolder of the repository.
      </P>
      <P>
        At the end, <code>verify-from-repo</code> asks whether to upload the verification data
        on-chain. That data sits in an account derived from your program address and holds the
        repository URL, the commit and the build arguments. Then <code>remote submit-job</code> asks
        a public verification service to rebuild and compare. Once it succeeds, explorers such as
        Solana Explorer, SolanaFM and Solscan show the program as verified. The service re-checks
        verified programs every 24 hours.
      </P>

      <H2>If the upgrade authority is a multisig</H2>
      <P>
        Only the{' '}
        <Link href="/solana-glossary/upgrade-authority" className="text-blue-deep">
          upgrade authority
        </Link>{' '}
        can publish the verification data. This stops someone else from attaching a different
        repository to your program. If the authority sits in a{' '}
        <Link href="/solana-glossary/multisig" className="text-blue-deep">multisig</Link>, export the
        transaction with <code>solana-verify export-pda-tx</code>, have the signers approve it in the
        multisig, and pass the multisig address as <code>--uploader</code> when you submit the remote
        job. Do this again after each upgrade. Our guide on{' '}
        <Link href="/blog/solana-program-upgrade-authority-multisig" className="text-blue-deep">
          moving the upgrade authority to a multisig
        </Link>{' '}
        covers the authority setup itself.
      </P>

      <Callout>
        <b>Why the hash does not match:</b> a different Rust or Solana toolchain, dependencies that
        changed between builds, a build outside Docker, or the wrong commit checked out. Build with{' '}
        <code>solana-verify build</code> from the exact commit you deployed and compare again.
      </Callout>

      <H2>How to check a program you depend on or paid for</H2>
      <BulletList
        items={[
          ['Look it up in an explorer:', 'a verified program shows its repository and commit. Unverified or missing data is a question to ask the team.'],
          ['Read the commit:', 'confirm the repository belongs to the team and the commit matches the audit report or a reviewed fix.'],
          ['Check the authority:', 'paste the address into the free upgrade authority checker. If one wallet can upgrade, the verified code can be replaced tomorrow.'],
          ['Repeat it yourself if it matters:', <>run <code>solana-verify list-program-pdas</code> for the program, then <code>verify-from-repo</code> with the stored arguments. You do not need to trust the remote service.</>],
        ]}
      />
      <P>
        If a development company is deploying for you, write the verifiable build into the final
        milestone, next to handing the authority to your multisig. Then the deployment you pay for
        can be checked by anyone.
      </P>

      <H2>Where it fits before launch</H2>
      <P>
        A verifiable build is one item in the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>
        , after the audit and the fix review and before monitoring. Plan it into your{' '}
        <Link href="/blog/solana-incident-response-plan" className="text-blue-deep">
          incident response plan
        </Link>{' '}
        too, so an emergency fix is verified once the dust settles. To find a reviewer for the
        commit you will verify, browse the{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">
          Solana smart contract audit providers
        </Link>{' '}
        we have checked.
      </P>

      <P>
        Want to see who can upgrade a program right now? Paste its address into the free{' '}
        <Link href="/tools/solana-program-check" className="text-blue-deep">
          upgrade authority checker
        </Link>
        .
      </P>
    </BlogPost>
  );
}
