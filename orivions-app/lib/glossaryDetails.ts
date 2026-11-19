// Extra content for the per-term pages at /solana-glossary/<id>. The short
// definition stays in lib/glossary.ts; this adds why the term matters to a team
// that builds or hires on Solana, what to check, and related terms (by id).

export interface GlossaryDetail {
  why: string;
  check: string[];
  related: string[];
}

export const GLOSSARY_DETAILS: Record<string, GlossaryDetail> = {
  account: {
    why: 'Almost every Solana security bug is about accounts: a program accepting an account it should have rejected. When you hire developers or auditors, how they validate account owners, signers and types tells you more about their quality than their portfolio.',
    check: [
      'Ask how every instruction validates the owner, signer and type of each account it receives.',
      'Ask whether account sizes and rent were planned for growth, since resizing accounts later is awkward.',
    ],
    related: ['program', 'pda', 'rent', 'discriminator'],
  },
  anchor: {
    why: 'Most Solana teams and auditors work in Anchor, so it is the default when hiring. It removes boilerplate and prevents many account validation mistakes, but its constraints still have to be written correctly, and auditors review them closely.',
    check: [
      'Ask which Anchor version the team uses and how they handle upgrades between versions.',
      'Ask whether they have also shipped native Rust for compute-heavy parts.',
    ],
    related: ['native-rust', 'idl', 'discriminator', 'program'],
  },
  audit: {
    why: 'An audit is the main independent check before users deposit funds, and partners, exchanges and investors often ask for the report. Its value depends on the scope, the auditors’ Solana experience, and whether findings are fixed and re-checked.',
    check: [
      'Ask for the exact scope and commit, the number of engineer-days, and whether a fix review is included.',
      'Ask for previous public reports on Solana programs similar to yours.',
    ],
    related: ['bug-bounty', 'verifiable-build', 'upgrade-authority', 'multisig'],
  },
  'bug-bounty': {
    why: 'A bounty keeps working after launch, when the audit is over and the code keeps changing. Rewards must be high enough that reporting a critical bug is clearly more attractive than exploiting it.',
    check: [
      'Define the scope, severity levels, reward ranges and safe harbor before announcing it.',
      'Launch it after the audit, not instead of it.',
    ],
    related: ['audit', 'upgrade-authority', 'multisig'],
  },
  'compute-units': {
    why: 'Programs that use too many compute units hit limits in complex transactions, cost users more in priority fees and compose badly with other protocols. Compute efficiency is a common reason teams write hot paths in native Rust.',
    check: [
      'Ask developers to report compute usage per instruction in their tests.',
      'Ask how they would handle a transaction that runs over its compute budget.',
    ],
    related: ['priority-fee', 'native-rust', 'cpi'],
  },
  cpi: {
    why: 'Composability on Solana runs through CPIs, and so do many exploits: calling an unchecked program ID, or passing signer privileges further than intended. Auditors spend a large share of their time on CPI paths.',
    check: [
      'Ask how program IDs passed into CPIs are verified.',
      'Ask how PDA signer seeds are scoped so they cannot be reused elsewhere.',
    ],
    related: ['program', 'pda', 'compute-units', 'account'],
  },
  discriminator: {
    why: 'Without a type check, an attacker can pass an account of one type where another is expected, a bug known as type cosplay. Anchor handles this by default; native programs must implement it themselves.',
    check: [
      'In native Rust code, ask how account types are told apart.',
      'Ask how discriminators are handled when account layouts change in an upgrade.',
    ],
    related: ['account', 'anchor', 'native-rust'],
  },
  escrow: {
    why: 'Escrow lowers the risk for both sides of a service engagement: the client knows money is only released for accepted work, and the provider knows the money exists. The terms matter as much as the mechanism, in particular acceptance criteria and dispute handling.',
    check: [
      'Write down what “accepted” means for each deliverable.',
      'Agree on who resolves a dispute and how long it may take.',
    ],
    related: ['milestone-payment', 'success-fee', 'multisig'],
  },
  'freeze-authority': {
    why: 'Many wallets, launchpads and buyers treat an active freeze authority as a red flag, because its holder can stop any account from moving the token. Keep it only for a clear compliance reason, and say so publicly.',
    check: [
      'Confirm the freeze authority status on an explorer before launch.',
      'If you keep it, hold it in a multisig rather than a single wallet.',
    ],
    related: ['mint-authority', 'spl-token', 'token-2022', 'multisig'],
  },
  idl: {
    why: 'The IDL is what frontends, indexers, explorers and integrators use to talk to your program. An accurate, published IDL makes integrations faster and lets explorers decode your transactions.',
    check: ['Ask whether the IDL is published on-chain or in the repository, and kept in sync with every deployment.'],
    related: ['anchor', 'program', 'indexer'],
  },
  indexer: {
    why: 'Solana RPC is not built for history queries or aggregates, so most production dApps need an indexer for dashboards, activity feeds and analytics. Teams choose between hosted indexing services and running their own.',
    check: [
      'Ask how the indexer handles missed slots and backfills.',
      'Ask what the app shows users when the indexer lags behind the chain.',
    ],
    related: ['rpc', 'idl', 'account'],
  },
  kol: {
    why: 'KOL campaigns can move attention quickly, but quality varies widely: fake followers, undisclosed paid posts and audiences outside your market are common. Good agencies show verifiable past results and disclose paid promotion.',
    check: [
      'Ask for past campaign results backed by on-chain or analytics data, not just impressions.',
      'Make sure paid posts are disclosed as paid.',
    ],
    related: ['milestone-payment', 'success-fee', 'verified-provider'],
  },
  lamport: {
    why: 'Programs and transactions work in lamports, not SOL, so fees, rent and balances in code are integers of lamports. Mixing up the two units is a classic source of bugs in client code.',
    check: ['Make sure client code converts between SOL and lamports in one place only.'],
    related: ['rent', 'priority-fee', 'account'],
  },
  'milestone-payment': {
    why: 'Milestones tie payment to progress and limit what either side can lose if an engagement goes wrong. They work best with specific deliverables and written acceptance criteria.',
    check: [
      'Tie each milestone to something you can verify, such as a deployed program or a delivered report.',
      'Keep the first milestone small, so both sides can build trust.',
    ],
    related: ['escrow', 'success-fee', 'verified-provider'],
  },
  'mint-authority': {
    why: 'As long as a mint authority exists, someone can create more tokens and dilute holders. Revoking it, or explaining who holds it and why, is one of the first things buyers and listing partners check.',
    check: [
      'Revoke it after the final mint if the supply is meant to be fixed.',
      'If inflation is planned, put it behind a multisig or program logic.',
    ],
    related: ['freeze-authority', 'spl-token', 'token-2022', 'multisig'],
  },
  multisig: {
    why: 'A single private key controlling upgrades or treasury funds is a single point of failure. A multisig spreads that control across people and devices, which is why auditors and investors look for one.',
    check: [
      'Ask who the signers are, what the threshold is, and whether keys sit on separate hardware wallets.',
      'Ask how signers are replaced if someone leaves the team.',
    ],
    related: ['upgrade-authority', 'mint-authority', 'freeze-authority'],
  },
  'native-rust': {
    why: 'Native Rust gives full control over compute and account layout, which matters for high-throughput or compute-heavy protocols. It also means more hand-written validation code, so audits usually take longer per line.',
    check: [
      'Ask why native was chosen over Anchor and what it buys your project.',
      'Expect a higher audit estimate for the same functionality.',
    ],
    related: ['anchor', 'compute-units', 'discriminator'],
  },
  pda: {
    why: 'PDAs are how Solana programs own state and assets without private keys. A poor seed design can let users collide with each other’s accounts, or let an attacker substitute an account they control.',
    check: [
      'Ask how seeds are chosen and whether the canonical bump is stored and checked.',
      'Ask how PDAs are validated in every instruction that uses them.',
    ],
    related: ['account', 'cpi', 'program'],
  },
  'priority-fee': {
    why: 'During congestion, transactions without a sensible priority fee can fail or stall, which users experience as a broken app. Good frontends estimate fees dynamically instead of hard-coding them.',
    check: ['Ask how the frontend sets priority fees and compute unit limits.'],
    related: ['compute-units', 'rpc', 'lamport'],
  },
  program: {
    why: 'Because Solana programs are stateless, a program’s security depends on how it validates the accounts passed to it. That is the main thing auditors check.',
    check: [
      'Ask who holds the upgrade authority.',
      'Ask whether a verifiable build is published for the mainnet deployment.',
    ],
    related: ['account', 'upgrade-authority', 'verifiable-build', 'anchor'],
  },
  rent: {
    why: 'Rent-exempt deposits are a real cost for apps that create many accounts, for example one per user or per order. Closing unused accounts returns the deposit; leaving them open locks SOL indefinitely.',
    check: [
      'Ask who pays for account creation: the user or the protocol.',
      'Ask whether accounts can be closed to reclaim rent.',
    ],
    related: ['account', 'lamport'],
  },
  rpc: {
    why: 'RPC quality directly affects how fast and reliable your app feels. Public endpoints are rate-limited and not meant for production traffic.',
    check: [
      'Ask which RPC provider the team uses and what the fallback is.',
      'Ask how RPC errors are monitored in production.',
    ],
    related: ['indexer', 'priority-fee'],
  },
  'spl-token': {
    why: 'The choice between the original Token Program and Token-2022 decides which wallets, exchanges and DeFi protocols support your token on day one.',
    check: ['Confirm that your target exchanges and protocols support the token program and extensions you choose.'],
    related: ['token-2022', 'mint-authority', 'freeze-authority'],
  },
  'token-2022': {
    why: 'Extensions add features without custom programs, but each one changes how integrators must handle your token, and not every extension is supported everywhere. Transfer hooks in particular run code on every transfer, and that code needs an audit.',
    check: [
      'List the extensions you need and confirm support with your key integrations.',
      'Audit transfer hook programs like any other program.',
    ],
    related: ['spl-token', 'mint-authority', 'freeze-authority'],
  },
  'success-fee': {
    why: 'A success fee aligns a marketplace with completed work rather than with signups or listings. For clients it means there is no fee to search for or contact providers.',
    check: ['Agree on what counts as a completed engagement before the work starts.'],
    related: ['milestone-payment', 'escrow', 'verified-provider'],
  },
  'upgrade-authority': {
    why: 'Whoever holds the upgrade authority can change the program’s code, and with it what happens to user funds. It is one of the first things auditors, integrators and careful users check.',
    check: [
      'Confirm the authority on an explorer and check that it is a multisig.',
      'Decide and publish your upgrade policy before launch.',
    ],
    related: ['multisig', 'program', 'verifiable-build'],
  },
  'verifiable-build': {
    why: 'Without a verifiable build, users and auditors cannot be sure the audited source is what is actually deployed. Explorers can show a verified badge when the build matches.',
    check: ['Ask for a verifiable build of every mainnet deployment and the commit it maps to.'],
    related: ['program', 'audit', 'upgrade-authority'],
  },
  'verified-provider': {
    why: 'Verification filters out anonymous or unproven providers before you spend time on calls. It is a starting point for your own due diligence, not a guarantee of the work.',
    check: ['Still ask for references and recent work in your exact category.'],
    related: ['success-fee', 'milestone-payment', 'escrow'],
  },
  'address-lookup-table': {
    why: 'A transaction has a size limit, and every account address costs 32 bytes. Lookup tables are how programs with many accounts, such as swaps across several pools, stay within it. If your team builds that kind of instruction, they need to know how to create, extend and use tables.',
    check: [
      'Ask whether the program needs lookup tables and who creates and maintains them.',
      'Ask how the client falls back when a table is missing or not yet active.',
    ],
    related: ['versioned-transaction', 'program', 'account', 'cpi'],
  },
  'versioned-transaction': {
    why: 'Versioned transactions are the only way to use address lookup tables, so any app with large transactions depends on them. Wallets, RPC providers and indexers have to handle the format, and some older tooling does not.',
    check: [
      'Ask which transaction version the app sends and whether every wallet and RPC provider you rely on supports it.',
      'Ask how the indexer reads version 0 transactions.',
    ],
    related: ['address-lookup-table', 'rpc', 'indexer', 'compute-units'],
  },
  'durable-nonce': {
    why: 'A normal transaction expires if it is not included within about a minute or two. A durable nonce removes that limit, which suits offline signing, custody workflows and multisig approvals that take time. The trade-off is that whoever holds the signed transaction can submit it whenever they like until it is used.',
    check: [
      'Ask who controls the nonce account authority and how signed transactions are stored.',
      'Ask how the team prevents a signed nonce transaction from being replayed or held back.',
    ],
    related: ['multisig', 'account', 'program', 'rpc'],
  },
  'bonding-curve': {
    why: 'A bonding curve is common in token launches, so the quality of its code decides whether buyers get a fair price. The curve formula, rounding, fees and what happens at the end of the curve are all places where bugs and abuse show up.',
    check: [
      'Ask for the curve formula in writing and for test cases at the edges, such as the first and last purchase.',
      'Ask who can change parameters or withdraw the reserve, and under which conditions.',
    ],
    related: ['spl-token', 'token-2022', 'mint-authority', 'upgrade-authority'],
  },
  'jito-bundle': {
    why: 'Bundles are how some teams and traders make several transactions land together or not at all. They matter if your protocol depends on ordering, for example liquidations or arbitrage, and they involve paying a tip to validators.',
    check: [
      'Ask whether the protocol or its keepers rely on bundles, and what happens when a bundle does not land.',
      'Ask how tips are budgeted and who pays them.',
    ],
    related: ['priority-fee', 'compute-units', 'rpc', 'program'],
  },
  'commitment-level': {
    why: 'Reading or acting on data that is not yet final is a common source of wrong balances and double actions. The right level depends on the action: a fast UI preview can use a lower level, a payout or a withdrawal should wait for a higher one.',
    check: [
      'Ask which commitment level the app uses for reads and for sending, and why.',
      'Ask how the backend reacts when a transaction seen at a lower level is later dropped.',
    ],
    related: ['rpc', 'indexer', 'geyser-plugin', 'priority-fee'],
  },
  'compressed-nft': {
    why: 'Compression makes very large mints affordable, for example for loyalty items or game assets. The trade-off is that the data is not in ordinary accounts, so wallets, marketplaces and your own app depend on indexers to show and transfer it.',
    check: [
      'Ask which indexer or API the app uses to read compressed assets, and what happens if it is unavailable.',
      'Ask who controls the tree and whether the tree authority can be changed.',
    ],
    related: ['indexer', 'account', 'spl-token', 'merkle-distributor'],
  },
  'geyser-plugin': {
    why: 'A Geyser stream delivers chain data with lower delay than polling RPC, which matters for trading tools, alerts and live dashboards. It also means you depend on a validator or a provider that runs the plugin.',
    check: [
      'Ask whether the stream is self-hosted or from a provider, and what the reconnect and backfill plan is.',
      'Ask which commitment level the consumer reads, and how it handles rolled-back slots.',
    ],
    related: ['indexer', 'rpc', 'commitment-level', 'account'],
  },
  'merkle-distributor': {
    why: 'Airdrops and reward programs with many recipients are cheaper and simpler when recipients claim themselves. The contract holds the funds, so the allocation list, the claim logic and the admin rights all need review.',
    check: [
      'Ask how the Merkle root is produced and who can change it after launch.',
      'Ask how the program records claims, so one allocation cannot be claimed twice.',
      'Ask what happens to unclaimed tokens and who can withdraw them.',
    ],
    related: ['spl-token', 'compressed-nft', 'upgrade-authority', 'audit'],
  },
  timelock: {
    why: 'A timelock limits what a compromised or careless admin key can do, because every sensitive change becomes visible before it takes effect. Users and partners treat it as a sign of mature operations.',
    check: [
      'Ask which actions go through the timelock and how long the delay is.',
      'Ask who can cancel a queued change, and whether the timelock itself can be bypassed or upgraded.',
    ],
    related: ['upgrade-authority', 'multisig', 'program', 'audit'],
  },
};

// Longer practical notes for the terms that teams and auditors ask about most.
// Rendered on /solana-glossary/<id> after "What to check".
export interface GlossaryExtra {
  inPractice: string[];
  mistakes: string[];
}

export const GLOSSARY_EXTRA: Record<string, GlossaryExtra> = {
  account: {
    inPractice: [
      'Every account has one owner program. Only that program can change the account data or take lamports out of it, while anyone can send lamports in. Wallets are accounts owned by the System Program.',
      'An account must hold a minimum balance to stay alive (rent exemption), and its size is chosen when it is created. The owning program can grow it later, within limits, so plan sizes with future fields in mind.',
    ],
    mistakes: [
      'Not checking the owner of an account passed in by the client, so an attacker supplies a lookalike account with fake data.',
      'Not checking that the right account signed, or that an account is the type the instruction expects.',
      'Closing an account without clearing it, which can let it be revived within the same transaction.',
    ],
  },
  pda: {
    inPractice: [
      'A program derived address (PDA) is derived from seeds and a program ID and has no private key. Only the program it was derived for can sign for it, by passing the seeds, so programs use PDAs as vaults and authorities.',
      'Derivation searches for a bump value so the address falls off the signing curve. The canonical bump is the first valid one found counting down from 255, and programs should store and check it.',
    ],
    mistakes: [
      'Accepting a PDA without re-deriving it from the expected seeds, so a different account passes the check.',
      'Using a non-canonical bump, which can produce several valid addresses for the same seeds.',
      'Joining user-controlled seeds without a separator, so two different inputs derive the same address.',
    ],
  },
  'upgrade-authority': {
    inPractice: [
      'A program deployed with the upgradeable loader keeps its code in a program data account, and that account stores the upgrade authority. Run solana program show with the program ID to see the current authority.',
      'solana program set-upgrade-authority moves it to a new address, and the --final option removes it for good, which makes the program immutable and cannot be undone.',
    ],
    mistakes: [
      'Leaving the authority in the deployer wallet, or with the development agency, after launch.',
      'Moving it to a multisig but never rehearsing an upgrade, so the first real one is also the first attempt.',
      'Locking the upgrade key while another admin instruction still lets one key drain the vault.',
    ],
  },
  multisig: {
    inPractice: [
      'A multisig is set up as m of n: for example, three of five signers must approve a transaction. Squads is a common choice on Solana, and it can add a timelock between approval and execution.',
      'The address that holds assets or authorities is the multisig vault, not any member wallet. Members propose, review and approve, and the vault executes.',
    ],
    mistakes: [
      'Signers who are not independent: several keys held by one person, on one device or behind one password manager.',
      'A threshold of one, which is a single key with extra steps.',
      'No rehearsal and no plan for replacing a signer who loses a key.',
    ],
  },
  'verifiable-build': {
    inPractice: [
      'A verifiable build compiles the program in a fixed, reproducible environment, so anyone can rebuild it from a public commit and get the same bytes. The solana-verify tool compares the hash of the on-chain program with the hash built from the repository.',
      'After a successful verification, explorers can show the program as verified, and an auditor can confirm the code on mainnet is the code they reviewed.',
    ],
    mistakes: [
      'Building with a different toolchain than the one used for verification, which gives a different hash.',
      'Deploying a commit that is not the audited one, or not tagging the audited commit.',
      'Keeping the repository private, which makes outside verification impossible.',
    ],
  },
  rpc: {
    inPractice: [
      'Apps read accounts and send transactions through RPC nodes. Reads take a commitment level: processed is fastest but can roll back, confirmed is voted on by most of the cluster, and finalized is the safest.',
      'The public Solana endpoints are rate limited and are not meant for production. Production apps use a paid provider with documented limits and a fallback.',
    ],
    mistakes: [
      'Showing balances or confirming payments at the processed commitment level.',
      'Relying on one provider with no fallback, or putting an unrestricted API key in frontend code.',
      'Calling getProgramAccounts with no filters on a large program, which is slow and often limited.',
    ],
  },
  'priority-fee': {
    inPractice: [
      'Every transaction pays a base fee per signature. A priority fee is extra, set as a price per compute unit with the compute budget instructions, and it raises the chance of being included when the network is busy.',
      'The priority fee is the compute unit price multiplied by the compute unit limit. The default limit is 200,000 compute units per instruction, so setting a limit close to the real usage keeps the fee lower.',
    ],
    mistakes: [
      'Not setting a compute unit limit and paying for far more than the transaction uses.',
      'Using one fixed price at all times instead of reading recent fees.',
      'Treating a failed or expired transaction as final without retrying with a fresh blockhash.',
    ],
  },
  'mint-authority': {
    inPractice: [
      'The mint authority is the only key that can create new units of an SPL token. Setting it to none fixes the supply, and that cannot be undone.',
      'Token-2022 adds further authorities for extensions such as transfer fees or a permanent delegate. Check every authority on a token, not only the mint and freeze ones.',
    ],
    mistakes: [
      'Leaving the mint authority with the deployer wallet, where a leaked key lets anyone inflate the supply.',
      'Revoking it before planned emissions or vesting are in place.',
      'Confusing the mint authority with the freeze authority, or ignoring extension authorities on Token-2022 mints.',
    ],
  },
  anchor: {
    inPractice: [
      'Anchor is a Rust framework for Solana programs. You describe accounts in a struct with constraints, and Anchor generates the checks, the instruction routing and an IDL that clients use to talk to the program.',
      'Anchor adds an 8 byte discriminator to every account type and instruction, which helps stop one account type from being passed in place of another. Many teams start with anchor test and a local validator for fast checks.',
    ],
    mistakes: [
      'Using UncheckedAccount or remaining accounts without writing the checks by hand.',
      'Forgetting constraints such as has_one, owner or seeds, so an account passes that should not.',
      'Using init_if_needed without thinking through what happens when the account already exists.',
    ],
  },
  cpi: {
    inPractice: [
      'A cross-program invocation (CPI) is one program calling another inside the same transaction. A program signs for its own PDAs during a CPI by passing the seeds, which is what invoke_signed does.',
      'Account data held in memory before a CPI can be out of date afterwards, because the called program may have changed it. Reload accounts after a CPI if you read them again.',
    ],
    mistakes: [
      'Not checking the program ID of the program being called, so an attacker substitutes a different one.',
      'Passing along signer or writable privileges to a program that does not need them.',
      'Reading stale account data after a CPI and acting on old balances.',
    ],
  },
  discriminator: {
    inPractice: [
      'A discriminator is a short tag at the start of account data or instruction data that says what type it is. Anchor uses 8 bytes derived from the name of the account or instruction.',
      'When a program reads an account it checks the discriminator first, so data of one type is not read as another.',
    ],
    mistakes: [
      'Writing a native program that reads account bytes without checking a type tag, so a different account type is accepted.',
      'Renaming an account or instruction in Anchor without planning for the discriminator change on existing accounts.',
      'Assuming the discriminator also proves who owns the account, which is a separate check.',
    ],
  },
  'compute-units': {
    inPractice: [
      'Compute units measure how much work a transaction does. The default limit is 200,000 per instruction, there is a larger cap per transaction, and you can request a specific limit with the compute budget program.',
      'A transaction that runs out of compute units fails. Setting the limit close to real usage keeps priority fees lower, because the fee is the price per unit times the limit.',
    ],
    mistakes: [
      'Leaving the default limit when the program uses far less, or far more.',
      'Logging a lot inside a program, which spends compute units.',
      'Writing loops over data whose size a user can grow, so a transaction can become too expensive to run.',
    ],
  },
  rent: {
    inPractice: [
      'An account must hold a minimum balance of lamports based on its size to stay on chain. Accounts that meet it are rent exempt, and the RPC method getMinimumBalanceForRentExemption returns the amount for a given size.',
      'When a program closes an account, the lamports go to an account the program chooses, so check where they are sent.',
    ],
    mistakes: [
      'Creating accounts larger than needed, which locks up more lamports for every user.',
      'Closing an account and sending the lamports to an address a user can choose without checking.',
      'Forgetting that the payer of an account creation must have enough lamports for the rent as well as fees.',
    ],
  },
  'spl-token': {
    inPractice: [
      'The SPL Token program holds token balances. A mint account defines the token, and each holder has a token account for that mint. The usual address for a wallet and a mint is the associated token account.',
      'Amounts are stored as integers and the mint sets the number of decimals, so a balance of 1,000,000 with six decimals is one token.',
    ],
    mistakes: [
      'Sending tokens to the wallet address instead of the associated token account.',
      'Not checking that a token account belongs to the expected mint and owner.',
      'Assuming every token has the same decimals and doing the math with floating point numbers.',
    ],
  },
  'token-2022': {
    inPractice: [
      'Token-2022, also called Token Extensions, is a second token program with a different program ID. It supports extensions such as transfer fees, transfer hooks, confidential transfers, a permanent delegate and an interest bearing display.',
      'Not every wallet, exchange or protocol supports every extension, so check support before choosing extensions for a token you plan to list.',
    ],
    mistakes: [
      'Hard-coding the classic Token program ID in a program that must also accept Token-2022 tokens.',
      'Adding an extension that a key partner or exchange does not support.',
      'Leaving a powerful authority such as a permanent delegate set without telling users.',
    ],
  },
  idl: {
    inPractice: [
      'An IDL is a JSON file that describes a program: its instructions, accounts, arguments and errors. Clients and tools use it to build transactions and decode accounts without reading the source code.',
      'Anchor generates the IDL at build time and can publish it on chain next to the program so explorers and wallets can read it.',
    ],
    mistakes: [
      'Publishing an IDL that no longer matches the deployed program after an upgrade.',
      'Treating the IDL as proof of what the program does, when only the deployed code decides that.',
      'Changing the order of accounts or arguments without updating clients that depend on them.',
    ],
  },
  'freeze-authority': {
    inPractice: [
      'The freeze authority of a token mint can freeze and unfreeze individual token accounts, which blocks transfers from that account. It is set when the mint is created and can be removed.',
      'A token that claims to be fully permissionless should have no freeze authority. Anyone can check it by reading the mint account.',
    ],
    mistakes: [
      'Leaving a freeze authority on a token that is presented as decentralized.',
      'Keeping the freeze authority in a single hot wallet.',
      'Not telling users and exchanges when the freeze authority is part of a compliance design.',
    ],
  },
  lamport: {
    inPractice: [
      'A lamport is the smallest unit of SOL: one SOL is 1,000,000,000 lamports. Balances, fees and rent on chain are counted in lamports as whole numbers.',
      'Programs and clients should do money math in lamports with integer types and convert to SOL only to display a value.',
    ],
    mistakes: [
      'Using floating point numbers for balances, which can introduce rounding errors.',
      'Mixing up SOL and lamports in one calculation, so an amount is off by a factor of a billion.',
      'Not checking for overflow when adding or multiplying large lamport amounts.',
    ],
  },
  audit: {
    inPractice: [
      'An audit is fixed to one commit. Code that changes after the review is not covered, so teams freeze the scope, agree the commit hash with the auditors and re-review anything that changes afterwards.',
      'A typical engagement ends with a report that lists findings by severity, followed by a fix review where the auditors check that each reported issue was actually resolved. Publish the final report, not only a badge or a logo.',
    ],
    mistakes: [
      'Booking the audit late, so findings arrive days before launch and there is no time to fix them properly.',
      'Auditing a moving target, then shipping code that differs from the reviewed commit.',
      'Treating a passed audit as a guarantee. It lowers risk but cannot prove that no bugs remain.',
      'Skipping the fix review and assuming reported issues were closed correctly.',
    ],
  },
  'bug-bounty': {
    inPractice: [
      'A bounty program publishes the scope (which programs and contracts), the severity levels, the reward range for each level and the rules for reporting. Researchers report privately, the team confirms and fixes the issue, then pays the reward.',
      'Programs are usually run through a platform or published on the project site. Safe harbor wording tells researchers that good-faith testing within the rules will not be treated as an attack.',
    ],
    mistakes: [
      'Setting rewards so low that selling or exploiting a critical bug looks more attractive than reporting it.',
      'Launching a bounty with a vague scope, which leads to disputes about what is eligible.',
      'Using a bounty as a replacement for an audit instead of a layer that runs after it.',
      'Leaving reports unanswered, which discourages researchers from reporting again.',
    ],
  },
  program: {
    inPractice: [
      'A Solana program is stateless. It holds no data of its own: every piece of state lives in separate accounts, and a transaction passes in the accounts that the program is allowed to read or write.',
      'Programs are commonly written in Rust, often with the Anchor framework. A deployed program lives in an executable account, and with the upgradeable loader its code can be replaced by whoever holds the upgrade authority.',
    ],
    mistakes: [
      'Assuming a program remembers values between calls, instead of storing them in an account.',
      'Trusting any account the client passes in without checking its owner, type and signer status.',
      'Leaving the upgrade authority with one person after launch, so users depend on a single key.',
    ],
  },
  'native-rust': {
    inPractice: [
      'In a native Rust program there is no framework to parse accounts. The program reads the account list and the instruction data itself, so every owner, signer and size check is code the team wrote and an auditor has to read.',
      'Teams choose native Rust for tight control over compute usage and account layout, and often keep the compute-heavy part native while the rest uses Anchor.',
    ],
    mistakes: [
      'Skipping a check that Anchor would have added automatically, such as the account owner or the discriminator.',
      'Writing instruction parsing by hand without tests for malformed or truncated input.',
      'Choosing native Rust for speed without measuring compute units, so the extra complexity buys nothing.',
    ],
  },
  indexer: {
    inPractice: [
      'An indexer follows the chain, decodes the programs you care about and writes the result to a database. The app then answers questions such as history, rankings or totals with one query instead of many RPC calls.',
      'Many indexers consume a validator stream (Geyser) so data arrives as it happens, and they need a backfill to cover what happened before they started.',
    ],
    mistakes: [
      'Treating processed slots as final, so rolled-back data ends up in the database.',
      'Having no alert when the indexer falls behind the chain, so users see stale numbers.',
      'Forgetting that a program upgrade can change an account layout and break the old decoder.',
    ],
  },
  kol: {
    inPractice: [
      'KOL stands for key opinion leader. In crypto it means a creator whose audience trusts their picks, and campaigns usually pay them to post, thread or stream about a project.',
      'Good campaigns match the creator to the project audience, use tracked links so results can be measured in actions, and make the paid nature of the post clear.',
    ],
    mistakes: [
      'Judging a campaign by impressions only, without wallet connects, sign-ups or deposits.',
      'Hiring many unvetted accounts instead of a few that fit the audience.',
      'Skipping disclosure of paid promotion, which can create legal and reputation problems.',
      'Paying only in tokens without a written agreement on what is delivered.',
    ],
  },
  escrow: {
    inPractice: [
      'In an escrow, the client puts the agreed amount with a neutral holder, which can be a regulated third party or a smart contract. The holder releases it when the agreed condition is met, for example an accepted deliverable.',
      'Escrow is usually paired with milestones: the amount is split by stage and each part is released after review, so neither side carries all the risk.',
    ],
    mistakes: [
      'Agreeing to escrow without written acceptance criteria, which turns release into an argument.',
      'Not defining what happens in a dispute, who decides and how long it takes.',
      'Assuming a smart contract escrow needs no legal agreement around it.',
    ],
  },
  'milestone-payment': {
    inPractice: [
      'A milestone is a defined deliverable with written acceptance criteria and a set amount. Work on the next stage starts after the previous one is accepted or the parties agree otherwise.',
      'Typical splits follow the project stages, for example discovery, build and handover. Sizes should match the real effort, not just a round number.',
    ],
    mistakes: [
      'Writing milestones as dates instead of deliverables, so there is nothing to accept.',
      'Making the last payment so small that the provider has no reason to finish the handover.',
      'Leaving out how long the client has to review before a milestone counts as accepted.',
    ],
  },
  'success-fee': {
    inPractice: [
      'A success fee is charged only when the work is completed, so the party paying it takes no cost upfront. On Orivions the fee is a flat 10% paid by the provider on a completed engagement, and the client pays nothing.',
      'The fee is tied to completion, which is why scope, milestones and acceptance criteria should be written down before the work starts.',
    ],
    mistakes: [
      'Not asking who pays the fee and when it is due.',
      'Leaving the definition of completed vague, so the parties disagree on when the fee is due.',
      'Comparing two quotes without checking whether one of them includes a success fee and the other a fixed price.',
    ],
  },
  'verified-provider': {
    inPractice: [
      'On Orivions, a person checks a provider before it is marked Verified: that the company is real and reachable, that the portfolio holds up, and that services and price ranges are specific.',
      'Verified providers get a public profile with their services, indicative prices and portfolio, so a client can compare them before making contact.',
    ],
    mistakes: [
      'Treating Verified as a guarantee of the work. It lowers risk, but you should still ask for references and recent work in your category.',
      'Skipping your own check of the portfolio because a badge is shown.',
      'Not asking what exactly was checked and when.',
    ],
  },
  'address-lookup-table': {
    inPractice: [
      'A lookup table is created and filled with an on-chain instruction, and a table can hold up to 256 addresses. An address added to a table can be used from a later slot, not in the same slot it was added.',
      'A table has an authority that can extend or close it. Tables that many users rely on are usually controlled by the team that runs the app.',
    ],
    mistakes: [
      'Building the transaction with a table that is not active yet, so it fails right after creation.',
      'Leaving the table authority on a single key with no plan for rotation.',
      'Assuming every wallet will accept a transaction that uses a table.',
    ],
  },
  'versioned-transaction': {
    inPractice: [
      'Legacy transactions list every account in the message. Version 0 transactions can also load accounts through lookup tables, which makes room for more accounts in the same size limit.',
      'Code that reads transactions has to ask for version 0 support explicitly. A client that does not do so can miss or reject these transactions.',
    ],
    mistakes: [
      'Reading transactions with a client that does not request version 0, so some transactions seem to be missing.',
      'Building a version 0 transaction for a wallet that only signs legacy ones.',
      'Not testing the largest realistic transaction before launch.',
    ],
  },
  'durable-nonce': {
    inPractice: [
      'A durable nonce lives in a nonce account owned by the System Program. The transaction uses the stored nonce value instead of a recent blockhash, and its first instruction must advance the nonce.',
      'Each use advances the nonce, so one signed transaction can be used only once. The nonce account also has an authority that you should protect.',
    ],
    mistakes: [
      'Forgetting to advance the nonce, so the transaction is rejected.',
      'Keeping signed nonce transactions in an unprotected place, where anyone who finds them can submit them.',
      'Sharing one nonce account between several pending transactions.',
    ],
  },
  'bonding-curve': {
    inPractice: [
      'The curve is a formula, for example price rising linearly or exponentially with supply. The contract holds a reserve and mints or burns tokens as people buy and sell.',
      'Launches often move to an ordinary liquidity pool after a target is reached. That migration step is where many issues appear, so it needs its own review.',
    ],
    mistakes: [
      'Leaving out slippage limits, so a buyer pays a very different price than quoted.',
      'Rounding errors in the formula that favor one side and can be repeated many times.',
      'Giving an admin key control over the reserve or the curve parameters without a timelock or multisig.',
    ],
  },
  'jito-bundle': {
    inPractice: [
      'A bundle groups up to five transactions that run in order and atomically in the same block: either all of them succeed or none is included.',
      'The sender attaches a tip, paid in a transfer to a designated tip account, to get the bundle considered by validators running the Jito software.',
    ],
    mistakes: [
      'Assuming a bundle always lands. Without the right tip and timing it can be dropped, so the caller needs a retry plan.',
      'Putting more than five transactions in one bundle.',
      'Overpaying tips because the budget was never set against the expected profit.',
    ],
  },
  'commitment-level': {
    inPractice: [
      'Processed means a node has seen the transaction, confirmed means a supermajority of stake has voted on its block, and finalized means it is very unlikely to be rolled back. Higher levels are safer and slower.',
      'The level is set on each RPC request, for both reads and for the checks done while sending a transaction.',
    ],
    mistakes: [
      'Crediting a user after a processed confirmation, so a dropped transaction leaves a wrong balance.',
      'Mixing levels, for example sending at one level and reading the result at a lower one.',
      'Using the highest level for every UI read and making the app feel slow.',
    ],
  },
  'compressed-nft': {
    inPractice: [
      'A compressed NFT is a leaf in a Merkle tree kept on-chain with the account compression program. Only the tree root is stored in an account, which is why a mint costs a small fraction of a regular NFT.',
      'To read or transfer an asset, a client needs the leaf data and a proof. Most apps get them from an indexer that supports the Digital Asset Standard (DAS) API.',
    ],
    mistakes: [
      'Assuming ordinary RPC calls can list the assets of a wallet.',
      'Choosing the tree size too small and running out of capacity, since a tree cannot grow after creation.',
      'Relying on a single indexer without a fallback.',
    ],
  },
  'geyser-plugin': {
    inPractice: [
      'A Geyser plugin runs inside a validator and pushes account updates, transactions, slot status and block data to another system, such as a message queue, a database or a gRPC stream.',
      'Consumers still need a backfill for the period before they connected, and a plan for slots that are rolled back.',
    ],
    mistakes: [
      'Building an indexer on a stream without any backfill, so history starts at the moment it was switched on.',
      'Ignoring slot status and writing data from forks that never finalize.',
      'Running a plugin on a validator that also has to vote, without checking the performance impact.',
    ],
  },
  'merkle-distributor': {
    inPractice: [
      'The team builds a Merkle tree from the list of recipients and amounts and stores the root in the program. A claimant sends their amount and a proof, the program verifies it against the root and pays out.',
      'The program records each claim, for example in a per-claimant account or a bitmap, so the same allocation cannot be claimed twice.',
    ],
    mistakes: [
      'Publishing a wrong or unreviewed allocation list, which cannot be fixed without a new root.',
      'Leaving an admin able to replace the root or drain the vault with no delay or multisig.',
      'Not setting a claim deadline and a plan for unclaimed tokens.',
    ],
  },
  timelock: {
    inPractice: [
      'A change is first queued with a time, then anyone can see it, and only after the delay has passed can it be executed. A cancel path lets the owners stop a change that was queued by mistake.',
      'On Solana a timelock is usually part of a governance or multisig setup that controls the upgrade authority and key parameters.',
    ],
    mistakes: [
      'Setting a delay so short that users cannot react in time.',
      'Leaving a second admin path that skips the timelock.',
      'Queuing changes without telling the community where to watch for them.',
    ],
  },
};
