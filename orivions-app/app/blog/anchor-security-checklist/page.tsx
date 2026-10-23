import Link from 'next/link';
import BlogPost, { Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'anchor-security-checklist';

export const metadata = postMetadata(SLUG);

const GROUPS: { title: string; checks: { check: string; why: string }[] }[] = [
  {
    title: 'Accounts and signers',
    checks: [
      {
        check: 'Use Signer for every account that must authorize the instruction.',
        why: 'An authority passed as a plain account or UncheckedAccount is not checked for a signature. Missing signer checks are still one of the most common critical findings.',
      },
      {
        check: 'Tie stored authorities to the signer with has_one or an explicit constraint.',
        why: 'Checking that someone signed is not enough; you must also check that the signer is the authority stored in the state account, for example #[account(mut, has_one = authority)].',
      },
      {
        check: 'Justify every UncheckedAccount and AccountInfo.',
        why: 'Anchor requires a /// CHECK: comment for a reason. Treat each one as a place where Anchor does no validation, and validate owner, key or data yourself.',
      },
      {
        check: 'Prevent the same account being passed twice.',
        why: 'Anchor does not stop the caller from passing one account into two mutable slots, such as from and to. Add a constraint like from.key() != to.key() where it matters.',
      },
    ],
  },
  {
    title: 'PDAs and initialization',
    checks: [
      {
        check: 'Validate PDAs with seeds and bump in the account constraint.',
        why: 'seeds = [...] with bump makes Anchor re-derive the address and reject anything else. Store the canonical bump in the account and reuse it instead of recalculating.',
      },
      {
        check: 'Design seeds so users cannot collide.',
        why: 'Include the user or the parent account in the seeds. Seeds built only from user-controlled strings or numbers can let one user occupy or overwrite another user’s account.',
      },
      {
        check: 'Avoid init_if_needed unless you have a reason.',
        why: 'It is behind a feature flag for a reason: if the instruction can run on an already initialized account, check that it cannot reset state such as balances or owners.',
      },
      {
        check: 'Close accounts with the close constraint.',
        why: 'close = receiver moves the lamports and marks the account closed. Manually draining lamports can leave an account that is reused or revived later in the same transaction.',
      },
    ],
  },
  {
    title: 'Tokens and CPIs',
    checks: [
      {
        check: 'Constrain token accounts by mint and authority.',
        why: 'A TokenAccount type only proves it is a token account. Add token::mint and token::authority (or associated_token constraints) so a user cannot pass an account for a different mint.',
      },
      {
        check: 'Use Program<> or Interface<> types for programs you call.',
        why: 'Typed program accounts check the program ID. Calling a program ID the user passed in, without a check, lets an attacker substitute their own program.',
      },
      {
        check: 'Decide on Token-2022 support explicitly.',
        why: 'If you accept Token-2022 mints via InterfaceAccount, review extensions such as transfer fees and transfer hooks: received amounts can differ from sent amounts, and hooks run extra code.',
      },
      {
        check: 'Scope PDA signer seeds tightly in CPIs.',
        why: 'A PDA that signs for many purposes can be tricked into signing for the wrong one. Use separate PDAs for vaults, authorities and configuration.',
      },
    ],
  },
  {
    title: 'Math, upgrades and testing',
    checks: [
      {
        check: 'Use checked arithmetic and keep overflow-checks on.',
        why: 'Use checked_add, checked_mul and friends in financial logic, and make sure overflow-checks = true is set for the release profile. Watch rounding direction: round in the protocol’s favour.',
      },
      {
        check: 'Validate remaining_accounts by hand.',
        why: 'Anchor does no validation at all on ctx.remaining_accounts. Check owner, key and type for every account you read from it.',
      },
      {
        check: 'Plan account layout changes before upgrades.',
        why: 'Changing a struct changes how existing accounts deserialize. Version accounts or reserve space, and use realloc carefully when growing accounts.',
      },
      {
        check: 'Test the failure paths and fuzz the rest.',
        why: 'Wrong signer, wrong mint, duplicated accounts, zero and maximum amounts. Fuzzing with a tool like Trident finds the edge cases nobody thought to write a test for.',
      },
    ],
  },
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Anchor security checklist"
      answer="An Anchor security checklist covers what Anchor does not check for you: Signer and has_one on every authority, a reason for each UncheckedAccount, seeds and bump on PDAs, careful init_if_needed, the close constraint, mint and authority constraints on token accounts, typed program accounts for CPIs, checked math and hand-validated remaining_accounts. Run all 16 checks before your audit."
      glance={{
        caption: 'Anchor security checklist at a glance',
        head: ['Area', 'Checks', 'Most common miss'],
        rows: [
          ['Accounts and signers', '4', 'Authority not a Signer, or not tied to state with has_one'],
          ['PDAs and initialization', '4', 'PDA without seeds and bump, init_if_needed resetting state'],
          ['Tokens and CPIs', '4', 'Token account not constrained by mint and authority'],
          ['Math, upgrades and testing', '4', 'Unchecked arithmetic, unvalidated remaining_accounts'],
        ],
      }}
      summary={[
        'Anchor prevents many classic Solana bugs, but only for the checks you actually declare in account constraints.',
        'Most critical findings in Anchor programs are still missing signer, owner or authority checks.',
        'Treat every UncheckedAccount, AccountInfo and remaining_accounts entry as unvalidated input.',
        'Constrain token accounts by mint and authority, and call other programs through typed Program accounts.',
        'This checklist is preparation for an audit, not a replacement for one.',
      ]}
      cta={{
        title: 'Ready for an audit?',
        text: 'Estimate what auditing your Anchor programs costs and how long it takes, then get a hand-picked shortlist of Solana auditors. Free for teams.',
        href: '/tools/solana-audit-cost-calculator',
        label: 'Estimate your audit →',
      }}
    >
      <P>
        Anchor is the default way to write Solana programs because it turns account validation into
        declarations: types and constraints instead of hand-written checks. That removes whole classes
        of bugs, but it also creates a false sense of safety. Anchor only checks what you tell it to
        check. These are the sixteen checks we would run on any Anchor program before sending it to
        an auditor.
      </P>

      {GROUPS.map((group) => (
        <section key={group.title}>
          <H2>{group.title}</H2>
          <ol className="mt-4 space-y-3">
            {group.checks.map(({ check, why }) => (
              <li key={check} className="rounded-2xl border border-line p-5">
                <div className="font-semibold">{check}</div>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#27272E]">{why}</p>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Callout>
        <b>Anchor or native?</b> Native Rust programs need every one of these checks written by hand,
        which is why their audits usually take longer. See{' '}
        <Link href="/blog/anchor-vs-native-rust-solana" className="text-blue-deep">
          Anchor vs native Rust
        </Link>{' '}
        for when each makes sense.
      </Callout>

      <H2>What to do with the results</H2>
      <P>
        Fix what you find, then write down the invariants your program must always keep, and send
        both to your auditor with a frozen commit. A team that arrives with this work done gets more
        of the audit spent on deep issues instead of missing checks. Before mainnet, go through the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>{' '}
        for keys, upgrades and monitoring, which this list does not cover. Terms such as{' '}
        <Link href="/solana-glossary/pda" className="text-blue-deep">PDA</Link>,{' '}
        <Link href="/solana-glossary/cpi" className="text-blue-deep">CPI</Link> and{' '}
        <Link href="/solana-glossary/discriminator" className="text-blue-deep">discriminator</Link> are
        explained in our glossary.
      </P>
    </BlogPost>
  );
}
