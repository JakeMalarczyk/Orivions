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
};
