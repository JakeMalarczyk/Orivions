import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-token-launch-checklist';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Token launch checklist"
      summary={[
        'Decide the mint and freeze authorities before launch, and make the choice visible on-chain.',
        'Set metadata (name, symbol, image, links) once, and lock the update authority when it is final.',
        'Publish supply, allocation and vesting, and hold team and treasury tokens in multisigs or vesting programs.',
        'Plan liquidity: where, how much, and what happens to the LP position.',
        'Audit every custom program around the token, and get legal advice for your jurisdictions.',
      ]}
      cta={{
        title: 'Need help with your launch?',
        text: 'Describe your token and timeline. Smart Match suggests verified Solana developers, auditors and marketing agencies that fit. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Creating a token on Solana takes minutes. Launching one that buyers, exchanges and wallets
        trust takes weeks of preparation. Most launch-day problems, such as an active freeze
        authority, missing metadata or unexplained wallets holding half the supply, are decided
        long before the token goes live. Work through this checklist in order.
      </P>

      <H2>1. Token program and extensions</H2>
      <P>
        Choose between the original SPL Token program and Token-2022 (Token Extensions).
        Token-2022 adds features such as transfer fees, transfer hooks, interest-bearing balances
        and on-mint metadata. Extensions are powerful, but some wallets, exchanges and DeFi
        protocols support them only partly, so check that the venues you need accept the
        extensions you choose. If you do not need an extension, the simpler option is usually the
        safer one.
      </P>

      <H2>2. Authorities</H2>
      <BulletList
        items={[
          ['Mint authority:', 'revoke it for a fixed supply. If you need future minting, keep it under a multisig and publish the schedule.'],
          ['Freeze authority:', 'revoke it unless you have a specific compliance reason. Buyers and screening tools often flag an active freeze authority.'],
          ['Metadata update authority:', 'keep it while you finalize name, symbol and image, then revoke it or move it to a multisig.'],
          ['Extension authorities (Token-2022):', 'fee, hook and other extension authorities need the same treatment. Each one is power someone can still use.'],
        ]}
      />
      <Callout>
        <b>Make it checkable.</b> Every authority decision is visible on-chain. Link to the mint
        address on an explorer from your website so anyone can confirm what you claim.
      </Callout>

      <H2>3. Metadata</H2>
      <P>
        Name, symbol, decimals, image and links are what wallets and explorers show. Host the image
        and metadata file on durable storage, keep the symbol short and unique, and test how the
        token looks in the main wallets before launch. Decimals cannot be changed after the mint is
        created.
      </P>

      <H2>4. Supply, allocation and vesting</H2>
      <BulletList
        items={[
          ['Publish the allocation:', 'how much goes to the team, investors, treasury, community and liquidity.'],
          ['Use vesting programs or multisigs:', 'team and investor tokens should not sit in a single wallet one person controls.'],
          ['Label the wallets:', 'list the addresses that hold large allocations so holders can follow them.'],
        ]}
      />

      <H2>5. Liquidity</H2>
      <P>
        Decide where the token will trade, how much liquidity you will provide, at what starting
        price, and what happens to the LP position afterwards. Locking or burning LP tokens, or
        holding them in a multisig with a published policy, tells buyers that liquidity cannot be
        pulled overnight. Plan for price volatility in the first hours, and avoid launching with
        very thin liquidity.
      </P>

      <H2>6. Audits and security</H2>
      <P>
        A plain token created with the standard programs does not need its own audit. Staking,
        vesting, claim and airdrop programs, bonding curves and launchpads do. Get them reviewed
        before launch, and run through the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>
        . For choosing a reviewer, see{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana smart contract auditor
        </Link>
        .
      </P>

      <H2>7. Legal review</H2>
      <P>
        Token rules depend on where your team, company and buyers are. A lawyer who works with
        crypto projects can tell you whether your token or sale could be treated as a regulated
        product, which countries to restrict, and what your terms and disclosures must say. Do
        this before you announce a sale date, not after.
      </P>

      <H2>8. Launch-day communication</H2>
      <BulletList
        items={[
          ['One official mint address:', 'publish it on your website and social accounts, and warn about fake tokens with the same name.'],
          ['A clear launch post:', 'time, venue, supply, authorities, allocation and links to audits.'],
          ['Support ready:', 'moderators and answers for the questions everyone will ask in the first hour.'],
        ]}
      />
      <P>
        If you are working with an agency on the launch, read{' '}
        <Link href="/blog/how-to-choose-a-solana-marketing-agency" className="text-blue-deep">
          how to choose a Solana marketing agency
        </Link>{' '}
        and the{' '}
        <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
          red flags when hiring Web3 service providers
        </Link>
        . Paid promises of listings or guaranteed volume are a warning sign.
      </P>
    </BlogPost>
  );
}
