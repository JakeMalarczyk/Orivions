// Search-result title and description for pages whose on-page headline or intro is
// longer than Google shows. Titles stay within 54 characters (the layout adds
// " | Orivions", keeping the full title under 65) and descriptions within 160.
// The on-page h1 and the OpenGraph title keep the full wording.

export const POST_SEO: Record<string, { title: string; description: string }> = {
  'where-to-find-solana-service-providers': {
    title: 'Where to find Solana service providers',
    description: 'Is there a marketplace for Solana service providers? Ecosystem directories, bounty boards, audit contests, freelance sites and vetted marketplaces compared.',
  },
  'how-to-evaluate-a-crypto-market-maker': {
    title: 'How to evaluate a crypto market maker',
    description: 'Evaluate a crypto market maker: loan and option vs retainer deals, spread and depth commitments, end-of-loan terms, reporting and red flags.',
  },
  'how-to-compare-solana-audit-firms': {
    title: 'How to compare Solana audit firms',
    description: 'Compare Solana audit firms on evidence you can check: public reports, Anchor or native Rust experience, engineer-days, fix review and timing.',
  },
  'breakpoint-2026-pre-launch-checklist': {
    title: 'Breakpoint 2026 pre-launch checklist for Solana teams',
    description: 'Launching around Solana Breakpoint 2026 in London? A checklist for security, authorities, token launch, legal and growth, and what to book first.',
  },
  'how-long-does-a-solana-audit-take': {
    title: 'How long does a Solana audit take?',
    description: 'How long a Solana audit takes: booking, waiting for a slot, the review, fixes and the fix review. Typical timelines and how to get audited sooner.',
  },
  'anchor-security-checklist': {
    title: 'Anchor security checklist: 16 checks',
    description: 'A practical Anchor security checklist: signers, has_one, UncheckedAccount, PDA seeds, init_if_needed, token constraints, CPIs, math and remaining_accounts.',
  },
  'solana-token-launch-checklist': {
    title: 'Solana token launch checklist',
    description: 'A Solana token launch checklist: mint and freeze authority, metadata, Token-2022 extensions, supply and vesting, liquidity, audits and legal review.',
  },
  'smart-contract-audit-vs-bug-bounty': {
    title: 'Smart contract audit vs bug bounty',
    description: 'Audits and bug bounties catch different bugs at different times. How each works on Solana, what they cost, and how to combine them around launch.',
  },
  'how-to-read-a-smart-contract-audit-report': {
    title: 'How to read a smart contract audit report',
    description: 'What the parts of a Solana audit report mean: scope and commit, severity levels, finding statuses, the fix review, and questions to ask before launch.',
  },
  'freelancer-vs-agency-solana-development': {
    title: 'Freelancer or agency for Solana development?',
    description: 'When to hire a Solana freelancer and when an agency or development company is better: scope, risk, cost, speed, continuity and how to combine both.',
  },
  'solana-project-brief-template': {
    title: 'Solana project brief template (free)',
    description: 'A one-page brief that gets accurate quotes from Solana development teams: goals, scope, on-chain parts, constraints, budget and timeline, with a template.',
  },
  'milestone-payments-web3-service-contracts': {
    title: 'Milestone payments and escrow for Web3 contracts',
    description: 'How to pay Web3 agencies, developers and auditors safely: milestones with acceptance criteria, deposits, escrow, stablecoins and disputed milestones.',
  },
  'red-flags-hiring-web3-service-providers': {
    title: '15 red flags when hiring a Web3 agency',
    description: 'Warning signs when hiring Web3 service providers: unverifiable portfolios, guaranteed results, upfront payment, key custody, anonymous teams, contract tricks.',
  },
  'how-to-verify-a-web3-agency': {
    title: 'How to verify a Web3 agency in 30 minutes',
    description: 'A 30-minute due-diligence routine for Web3 service providers: on-chain work, repositories, audit reports, references, company details and the people behind it.',
  },
  'solana-smart-contract-audit-cost': {
    title: 'How much does a Solana audit cost?',
    description: 'What a Solana smart contract audit costs, why quotes for the same project differ, and how to get a better audit for the same budget.',
  },
  'anchor-vs-native-rust-solana': {
    title: 'Anchor vs native Rust for Solana programs',
    description: 'Anchor or native Rust for your Solana program? The trade-offs in safety, development speed, compute usage, tooling and hiring, and when each makes sense.',
  },
  'solana-pre-launch-security-checklist': {
    title: 'Solana pre-launch security checklist',
    description: 'A checklist for launching a Solana program on mainnet: upgrade authority, multisig, verifiable builds, token authorities, monitoring and the audit.',
  },
  'how-to-choose-a-solana-marketing-agency': {
    title: 'How to choose a Solana marketing agency',
    description: 'How to evaluate crypto and Solana marketing agencies: what to ask, metrics that matter, KOL campaigns, red flags like guaranteed followers, and contracts.',
  },
  'how-much-does-it-cost-to-build-a-solana-dapp': {
    title: 'How much does it cost to build a Solana dApp?',
    description: 'What a Solana dApp costs to build: on-chain programs, frontend, indexing, audit and maintenance, plus the scope decisions that move the budget most.',
  },
  'how-to-hire-a-solana-development-company': {
    title: 'How to hire a Solana development company',
    description: 'A guide to hiring a Solana development team: Rust and Anchor experience, scoping, testing, audits, code ownership and how to compare quotes.',
  },
  'how-to-choose-a-solana-smart-contract-auditor': {
    title: 'How to choose a Solana smart contract auditor',
    description: 'What matters when picking a Solana auditor: Anchor and native Rust experience, methodology, scope, timelines, red flags in quotes and a good report.',
  },
  'why-we-are-building-orivions': {
    title: 'Why we are building Orivions',
    description: 'Why Orivions exists: finding a trustworthy Solana auditor, developer or agency is slow and risky, so we are building a verified marketplace for onchain teams.',
  },
};
