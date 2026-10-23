// Blog registry: the single source of truth for the blog index, sitemap, RSS
// feed, llms.txt links and each post's metadata + JSON-LD.
// Adding a post = one entry here + one folder under app/blog/<slug>/.

export const SITE_URL = 'https://orivions.com';

export interface PostFaq {
  q: string;
  a: string;
}

export interface Post {
  slug: string;
  title: string;
  /** Meta description / RSS summary (~150-160 chars). */
  description: string;
  /** Longer teaser shown on the blog index. */
  excerpt: string;
  category: string;
  readingMinutes: number;
  /** ISO dates (YYYY-MM-DD). */
  datePublished: string;
  dateModified: string;
  tags: string[];
  /** Rendered as an FAQ section and FAQPage JSON-LD. */
  faqs?: PostFaq[];
}

export const AUTHOR = {
  name: 'Orivions Team',
  role: 'Editorial team',
  url: `${SITE_URL}/about`,
};

export const POSTS: Post[] = [
  {
    slug: 'how-to-evaluate-a-crypto-market-maker',
    title: 'How to evaluate a crypto market maker before you sign',
    description:
      'How to evaluate a crypto market maker: loan and option vs retainer deals, spread, depth and uptime commitments, end-of-loan terms, verifiable reporting and red flags.',
    excerpt:
      'The costly terms in a market making deal hide in the option schedule and the end-of-loan clause. What to check, what to put in the contract, and the pitches to walk away from.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-22',
    dateModified: '2026-10-22',
    tags: ['Guides', 'Market making', 'Launch', 'Hiring'],
    faqs: [
      {
        q: 'What does a crypto market maker do?',
        a: 'A market maker quotes buy and sell orders for your token continuously, so people can trade it without moving the price too much. Good market making shows up as a tighter spread and more depth near the mid price, not as price support or high volume.',
      },
      {
        q: 'What is the difference between a loan and option deal and a retainer?',
        a: 'In a loan and option deal you lend tokens to the market maker, who gets the option to buy them later at agreed strike prices. In a retainer you pay a fee and usually keep the inventory in accounts you control. The first ties the market maker to your token price; the second keeps control with you but costs cash.',
      },
      {
        q: 'What should be in a market making contract?',
        a: 'The venues and pairs covered, the maximum spread, the depth on each side of the book, the uptime for those commitments, reporting you can verify, consequences when commitments are missed, and clear terms for the end of any token loan.',
      },
      {
        q: 'How do I spot a bad market maker?',
        a: 'Walk away from anyone who guarantees a price, a volume number or a listing, offers "volume support", will not name the legal entity that signs, or sends reports you cannot check against exchange or onchain data.',
      },
    ],
  },
  {
    slug: 'how-to-compare-solana-audit-firms',
    title: 'How to compare Solana audit firms: a neutral framework',
    description:
      'Compare Solana smart contract audit firms on evidence you can check yourself: public Solana reports, Anchor or native Rust experience, engineer-days, fix review and timing.',
    excerpt:
      'Most "best audit firm" lists are written by firms with a stake in the order. Six criteria, a portfolio check you can do in an afternoon, and the questions to put in every scoping call.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-22',
    dateModified: '2026-10-22',
    tags: ['Guides', 'Audits', 'Security'],
    faqs: [
      {
        q: 'What is the best Solana smart contract audit firm?',
        a: 'There is no single best firm for every project. The right auditor is one with recent public reports for Solana programs similar to yours, experience with your framework (Anchor or native Rust), named engineers and enough engineer-days in the quote, a fix review included, and a start date that fits your launch.',
      },
      {
        q: 'How do I check a Solana auditor\'s experience?',
        a: 'Open three of their published reports for Solana programs. Check the date, commit and scope, and look for Solana-specific findings such as missing signer or owner checks, unvalidated PDAs or unsafe CPIs. Confirm that the audited project links the same report, and ask for one client reference.',
      },
      {
        q: 'How do I compare audit quotes?',
        a: 'Make every firm quote the same commit, programs and exclusions, convert each quote to engineer-days, then compare price per engineer-day, start date and whether the fix review is included.',
      },
      {
        q: 'Are audit firm rankings trustworthy?',
        a: 'Treat them with care. Many rankings are published by audit firms, infrastructure providers or agencies with commercial relationships. Ask how the order was chosen and verify the evidence yourself.',
      },
    ],
  },
  {
    slug: 'breakpoint-2026-pre-launch-checklist',
    title: 'Breakpoint 2026: what Solana teams should sort out before launch',
    description:
      'Launching around Solana Breakpoint 2026 (15-17 November, Olympia London)? A checklist for security, authorities, token launch, legal and growth, and what to book before the event.',
    excerpt:
      'Breakpoint is a deadline for many Solana teams. The work that decides whether a launch goes well happens weeks before and depends on outside teams. What to sort out now.',
    category: 'Guides',
    readingMinutes: 5,
    datePublished: '2026-10-22',
    dateModified: '2026-10-22',
    tags: ['Guides', 'Launch', 'Security', 'Audits'],
    faqs: [
      {
        q: 'When and where is Solana Breakpoint 2026?',
        a: 'Breakpoint 2026 takes place on 15-17 November 2026 at Olympia London, with official side events around the main conference.',
      },
      {
        q: 'Can I get a Solana audit done before Breakpoint?',
        a: 'Only if you book now. Established Solana auditors are often booked weeks ahead, and the full process including fixes and the fix review usually takes longer than the review itself. If the dates do not fit, cut scope or launch after the event with audited code.',
      },
      {
        q: 'What should a Solana team check before a mainnet launch?',
        a: 'An audit with a completed fix review on a frozen commit, upgrade authority in a multisig or removed on purpose, a verifiable build, token authorities set deliberately, an incident plan, a legal view on the token or product, and one clear launch message.',
      },
    ],
  },
  {
    slug: 'how-long-does-a-solana-audit-take',
    title: 'How long does a Solana audit take? Timeline from first call to final report',
    description:
      'How long a Solana smart contract audit takes: booking, waiting for a slot, the review, fixes and the fix review. Typical timelines and how to get audited sooner.',
    excerpt:
      'The review itself takes one to four weeks, but the whole process usually takes six to twelve. Where the time goes, what makes it longer, and how to plan an audit around a launch date.',
    category: 'Guides',
    readingMinutes: 5,
    datePublished: '2026-10-20',
    dateModified: '2026-10-20',
    tags: ['Guides', 'Audits', 'Security', 'Launch'],
    faqs: [
      {
        q: 'How long does a Solana smart contract audit take?',
        a: 'The review of a single Anchor program of a few thousand lines typically takes one to three weeks with two engineers; large DeFi protocols can take a month or more. Including booking, waiting for a slot and the fix review, plan six to twelve weeks from first call to final report.',
      },
      {
        q: 'How far in advance should I book a Solana auditor?',
        a: 'Contact auditors four to eight weeks before you need the report, as soon as the scope is stable. Established Solana security firms are often booked several weeks ahead.',
      },
      {
        q: 'Can a Solana audit be done in a week?',
        a: 'For a small, simple program with a clear spec and tests, sometimes. For complex protocols, a one-week review usually means less engineer time on your code; ask how many engineers, for how many days, and what is out of scope.',
      },
      {
        q: 'How long does the fix review take?',
        a: 'Usually three to ten days after your team has fixed the findings. Include it in the quote and the schedule; the first report is not the end of the audit.',
      },
    ],
  },
  {
    slug: 'anchor-security-checklist',
    title: 'Anchor security checklist: 16 checks before your Solana audit',
    description:
      'A practical Anchor security checklist: signers, has_one, UncheckedAccount, PDA seeds, init_if_needed, closing accounts, token constraints, CPIs, math and remaining_accounts.',
    excerpt:
      'Anchor prevents many Solana bugs, but only the checks you declare. Sixteen checks on signers, PDAs, tokens, CPIs and math to run on any Anchor program before it goes to an auditor.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-20',
    dateModified: '2026-10-20',
    tags: ['Guides', 'Security', 'Audits', 'Development', 'Anchor'],
    faqs: [
      {
        q: 'Is Anchor secure by default?',
        a: 'Anchor removes whole classes of bugs, such as missing owner checks on typed accounts and type confusion through discriminators, but only for what you declare. Missing signer, authority and token constraints are still the most common critical findings in Anchor programs.',
      },
      {
        q: 'What is the most common vulnerability in Anchor programs?',
        a: 'Missing authorization: an authority that is not a Signer, or a signer that is never compared to the authority stored in the state account. has_one or an explicit constraint fixes it.',
      },
      {
        q: 'Is init_if_needed dangerous?',
        a: 'It can be. If the instruction can run on an account that already exists, make sure it cannot reset state such as balances or owners. Anchor puts it behind a feature flag for this reason.',
      },
      {
        q: 'Does Anchor validate remaining_accounts?',
        a: 'No. Accounts in ctx.remaining_accounts are not validated at all; check owner, key and type for each one you use.',
      },
    ],
  },
  {
    slug: 'solana-token-launch-checklist',
    title: 'Solana token launch checklist: authorities, metadata, liquidity and legal',
    description:
      'A practical Solana token launch checklist: mint and freeze authority, metadata, Token-2022 extensions, supply and vesting, liquidity, audits, legal review and launch-day communication.',
    excerpt:
      'Most token launch problems are decided before launch day. A step-by-step checklist for the on-chain settings, liquidity, legal and communication work that has to be done first.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    tags: ['Guides', 'Launch', 'Security', 'Marketing'],
    faqs: [
      {
        q: 'Should I revoke the mint authority on my Solana token?',
        a: 'If the supply is meant to be fixed, yes: revoking the mint authority proves no more tokens can be created, and many buyers and listing tools check for it. If you need to mint later, for example for emissions, keep it under a multisig and say so publicly.',
      },
      {
        q: 'What is the freeze authority and should I keep it?',
        a: 'The freeze authority can freeze any token account for that mint. Unless you have a clear compliance reason, revoke it before launch. Many traders and tools treat an active freeze authority as a red flag.',
      },
      {
        q: 'Do I need an audit to launch a token on Solana?',
        a: 'A plain SPL token created with the standard token program does not need its own audit. Any custom program around it, such as staking, vesting, a launchpad or a bonding curve, should be audited before real money touches it.',
      },
    ],
  },
  {
    slug: 'smart-contract-audit-vs-bug-bounty',
    title: 'Smart contract audit vs bug bounty: which do you need, and when?',
    description:
      'Audits and bug bounties catch different bugs at different times. How each works on Solana, what they cost, and how to combine them before and after mainnet launch.',
    excerpt:
      'An audit is a focused review before launch; a bug bounty is a standing reward for anyone who finds a bug later. Most protocols holding real value need both, in that order.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    tags: ['Guides', 'Security', 'Audits'],
    faqs: [
      {
        q: 'Can a bug bounty replace a smart contract audit?',
        a: 'No. A bounty only pays when someone chooses to look, usually after launch when funds are already at risk. An audit is a guaranteed, structured review of a fixed scope before launch. A bounty complements an audit; it does not replace it.',
      },
      {
        q: 'How big should a bug bounty reward be?',
        a: 'Large enough that reporting is clearly better than exploiting. A common approach is to scale critical rewards with the value at risk, often a percentage of funds that could be lost, with a fixed maximum. Smaller rewards apply to high and medium findings.',
      },
      {
        q: 'When should a Solana project launch a bug bounty?',
        a: 'After the audit and fix review, at or shortly after mainnet launch, and before total value locked grows. Keep it running for as long as the programs hold value, and update the scope when the code changes.',
      },
    ],
  },
  {
    slug: 'how-to-read-a-smart-contract-audit-report',
    title: 'How to read a smart contract audit report (without being an auditor)',
    description:
      'What the parts of a Solana smart contract audit report mean: scope and commit, severity levels, finding statuses, the fix review, and the questions to ask before you call the code audited.',
    excerpt:
      'An audit report is only useful if you can read it. A plain-English walkthrough of scope, severities, statuses and the small print that decides what "audited" really means.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    tags: ['Guides', 'Security', 'Audits'],
    faqs: [
      {
        q: 'What do critical, high, medium and low mean in an audit report?',
        a: 'They rank findings by impact and likelihood. Critical and high usually mean funds can be stolen or locked, or the protocol broken; medium means real but limited damage; low and informational are hardening and code-quality notes. Each auditor defines the levels in the report, so read their definitions.',
      },
      {
        q: 'What does "acknowledged" mean on an audit finding?',
        a: 'The team saw the finding and chose not to fix it, usually with an explanation. It is not the same as "resolved". Acknowledged critical or high findings deserve a careful look before you rely on the code.',
      },
      {
        q: 'How do I know the deployed program is the audited code?',
        a: 'Check that the report names the commit, that every finding is resolved or explained in a fix review, and that the deployed program has a verifiable build pointing at that commit or a later reviewed one.',
      },
    ],
  },
  {
    slug: 'freelancer-vs-agency-solana-development',
    title: 'Freelancer or agency for Solana development? How to decide',
    description:
      'When to hire a Solana freelancer and when an agency or development company is the better choice: scope, risk, cost, speed, continuity and how to combine both.',
    excerpt:
      'Freelancers can be faster and cheaper; agencies bring more roles and continuity. The right choice depends on your scope and risk, not on price alone. A practical comparison.',
    category: 'Guides',
    readingMinutes: 5,
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    tags: ['Guides', 'Development', 'Hiring'],
    faqs: [
      {
        q: 'Is it cheaper to hire a Solana freelancer than an agency?',
        a: 'Per hour, usually yes. Per finished outcome, not always: on larger projects you also need design, frontend, DevOps and project management, which an agency includes and you would otherwise coordinate yourself.',
      },
      {
        q: 'When is a freelancer the better choice?',
        a: 'For a well-scoped task one person can own: a single program or feature, a code review, a prototype, or extra capacity next to your own engineers who can review the work.',
      },
      {
        q: 'When should I hire an agency instead?',
        a: 'When you need several roles at once, a fixed deadline, one accountable contract, and continuity if someone leaves, for example a full dApp with programs, frontend and infrastructure.',
      },
    ],
  },
  {
    slug: 'solana-project-brief-template',
    title: 'How to write a project brief for a Solana development team (free template)',
    description:
      'A one-page brief that gets you accurate quotes from Solana development teams: goals, scope, on-chain and off-chain parts, constraints, budget and timeline, with a copyable template.',
    excerpt:
      'Vague briefs get vague quotes. A one-page structure that lets any Solana team estimate your project properly, and makes their quotes comparable.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    tags: ['Guides', 'Development', 'Hiring'],
    faqs: [
      {
        q: 'What should a brief for a Solana development project include?',
        a: 'The problem and the outcome you want, who the users are, what must happen on-chain versus off-chain, integrations with other protocols, constraints such as deadlines and audits, a budget range, and what you already have (designs, code, a specification).',
      },
      {
        q: 'Should I share my budget in a project brief?',
        a: 'Yes, a range. It lets teams propose a scope that fits instead of guessing, and it filters out teams that are far outside your budget before anyone spends time on a detailed estimate.',
      },
      {
        q: 'How long should a project brief be?',
        a: 'One to two pages is usually enough to get a first estimate. Detailed specifications come later, ideally in a short paid discovery phase with the team you choose.',
      },
    ],
  },
  {
    slug: 'milestone-payments-web3-service-contracts',
    title: 'Milestone payments and escrow for Web3 service contracts: how to structure them',
    description:
      'How to pay Web3 agencies, developers and auditors safely: milestones with acceptance criteria, deposits, escrow options, payment in stablecoins, and what to do when a milestone is disputed.',
    excerpt:
      'Paying a whole project upfront puts all the risk on you; paying everything at the end puts it on the provider. Milestones split the risk fairly. How to set them up for Web3 work.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    tags: ['Guides', 'Hiring', 'Payments'],
    faqs: [
      {
        q: 'How should I pay a Web3 development agency?',
        a: 'Split the work into milestones with written acceptance criteria and pay per accepted milestone. A modest deposit for the first milestone is common; paying the full project upfront is not.',
      },
      {
        q: 'What is a milestone escrow?',
        a: 'An arrangement where the client deposits funds for a milestone with a neutral party or smart contract, and the funds are released to the provider when the milestone is accepted, or handled by an agreed dispute process if it is not.',
      },
      {
        q: 'What makes a good acceptance criterion?',
        a: 'Something both sides can check without arguing: a deployed program at a given address passing listed tests, a report delivered at a stated commit, or a feature working on devnet as described in the specification.',
      },
    ],
  },
  {
    slug: 'red-flags-hiring-web3-service-providers',
    title: '15 red flags when hiring a Web3 agency, developer or auditor',
    description:
      'Warning signs to watch for when hiring Web3 service providers: unverifiable portfolios, guaranteed results, upfront payment, key custody, anonymous teams and contract tricks.',
    excerpt:
      'Most bad Web3 hires announce themselves early. Fifteen warning signs, grouped by stage, that are worth walking away from, or at least asking hard questions about.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    tags: ['Guides', 'Hiring', 'Security'],
    faqs: [
      {
        q: 'What is the biggest red flag when hiring a Web3 developer?',
        a: 'Asking to hold your program upgrade authority, treasury keys or deployment keys. Your team, ideally through a multisig, should control every key that can change or move what you own.',
      },
      {
        q: 'Is an anonymous Web3 team always a red flag?',
        a: 'Not always; some reputable contributors are pseudonymous with long public track records. It is a red flag when a team is anonymous and also has no verifiable history, no references and wants large payments upfront.',
      },
      {
        q: 'How can I check a Web3 provider before hiring?',
        a: 'Verify their work on-chain or in public repositories, speak to past clients, check that the people on the call are the people doing the work, and prefer providers whose identity and portfolio were verified by a third party.',
      },
    ],
  },
  {
    slug: 'how-to-verify-a-web3-agency',
    title: 'How to verify a Web3 agency or development company in 30 minutes',
    description:
      'A practical 30-minute due-diligence routine for Web3 service providers: checking on-chain work, repositories, audit reports, references, company details and the people behind it.',
    excerpt:
      'Logos on a landing page prove nothing. A fast, repeatable routine to check whether a Web3 agency really did the work it shows, using public, verifiable sources.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    tags: ['Guides', 'Hiring', 'Verification'],
    faqs: [
      {
        q: 'How do I check if a Web3 agency actually built what it claims?',
        a: 'Ask for program addresses, repositories and named contacts at past clients. Check deployments in an explorer, commit history in the repositories, and confirm with the client that the agency did the work.',
      },
      {
        q: 'How can I verify a smart contract auditor?',
        a: 'Read their published reports, confirm the reports appear on the audited project’s own site or repository, and check that the findings are specific and technical rather than generic.',
      },
      {
        q: 'What does "verified" mean on Orivions?',
        a: 'A person at Orivions checked that the provider is a real company, that its portfolio and services hold up, and that its price ranges are specific, before the Verified badge was granted. It lowers risk but does not replace your own checks.',
      },
    ],
  },
  {
    slug: 'solana-smart-contract-audit-cost',
    title: 'How much does a Solana smart contract audit cost? What drives the price',
    description:
      'What a Solana smart contract audit costs, why quotes for the same project differ, and how to get a better audit for the same budget: scope, complexity, timing and fix reviews.',
    excerpt:
      'Two auditors can quote very different prices for the same program, and both can be reasonable. Here is what actually drives the cost of a Solana audit, and how to spend the budget well.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-17',
    dateModified: '2026-10-23',
    tags: ['Guides', 'Security', 'Audits', 'Pricing'],
    faqs: [
      {
        q: 'How much does a Solana smart contract audit cost?',
        a: 'It depends mostly on the size and complexity of the code in scope. Small, single-purpose programs start at around $5,000, while large DeFi protocols with several interacting programs can cost tens of thousands. Ask several verified auditors for a quote against the same frozen commit.',
      },
      {
        q: 'Why do audit quotes for the same project differ so much?',
        a: 'Auditors estimate effort differently: how many engineers, how many days, whether a fix review is included, how much time goes to economic design versus code, and how busy they are. Compare quotes by scope, engineer-days and deliverables, not only by the total.',
      },
      {
        q: 'How can I reduce the cost of an audit?',
        a: 'Freeze the code before the audit starts, cut unnecessary code from scope, write a short specification, ship good tests and fix the obvious issues yourself first. Auditors then spend their time on the hard problems instead of on understanding the code.',
      },
    ],
  },
  {
    slug: 'anchor-vs-native-rust-solana',
    title: 'Anchor vs native Rust for Solana programs: how to choose',
    description:
      'Anchor or native Rust for your Solana program? The real trade-offs in safety, speed of development, compute usage, tooling and hiring, and when each choice makes sense.',
    excerpt:
      'Most Solana programs are written with Anchor, but not all of them should be. A practical comparison of Anchor and native Rust, and the questions that decide it for your project.',
    category: 'Guides',
    readingMinutes: 6,
    datePublished: '2026-10-17',
    dateModified: '2026-10-17',
    tags: ['Guides', 'Development', 'Anchor', 'Rust'],
    faqs: [
      {
        q: 'Is Anchor or native Rust better for Solana development?',
        a: 'Neither is better in general. Anchor is the default for most applications because it removes boilerplate and prevents many account-validation mistakes. Native Rust makes sense when compute units, account size or binary size matter more than development speed, for example in high-throughput DeFi primitives.',
      },
      {
        q: 'Is Anchor less secure than native Rust?',
        a: 'No. Anchor makes several common mistakes harder, such as missing owner or discriminator checks. Native programs can be equally secure, but every check must be written by hand, so they depend more on the experience of the team and the quality of the audit.',
      },
      {
        q: 'Can I switch from Anchor to native Rust later?',
        a: 'Yes, but it is a rewrite of the program logic, and the account layout and client code may change. If you expect to need native performance, decide early or isolate the hot paths in a separate program.',
      },
    ],
  },
  {
    slug: 'solana-pre-launch-security-checklist',
    title: 'Solana pre-launch security checklist: 15 checks before mainnet',
    description:
      'A practical checklist for launching a Solana program on mainnet: upgrade authority, multisig, verifiable builds, token authorities, monitoring, incident response and the audit.',
    excerpt:
      'Most incidents at launch are not clever exploits. They are a hot wallet holding the upgrade authority, a missing alert or an untested migration. Fifteen checks to run before you go live.',
    category: 'Guides',
    readingMinutes: 8,
    datePublished: '2026-10-17',
    dateModified: '2026-10-17',
    tags: ['Guides', 'Security', 'Launch'],
    faqs: [
      {
        q: 'Who should hold the upgrade authority of a Solana program?',
        a: 'A multisig controlled by several people from your team, not a single hot wallet and never the development agency. When the program is stable, many teams make it immutable or put upgrades behind a timelock.',
      },
      {
        q: 'What is a verifiable build on Solana?',
        a: 'A verifiable build lets anyone confirm that the program deployed on-chain was compiled from a specific public commit of your source code. It builds trust with users and lets auditors confirm that the audited code is the code running on mainnet.',
      },
      {
        q: 'Do I still need a bug bounty after an audit?',
        a: 'For anything holding meaningful user funds, yes. An audit covers one commit at one point in time; a bug bounty gives independent researchers a reason to report issues to you instead of exploiting them.',
      },
    ],
  },
  {
    slug: 'how-to-choose-a-solana-marketing-agency',
    title: 'How to choose a Solana marketing agency without paying for fake growth',
    description:
      'How to evaluate crypto and Solana marketing agencies: what to ask, which metrics matter, KOL campaigns, red flags like guaranteed followers, and how to structure the contract.',
    excerpt:
      'Crypto marketing is full of vanity metrics that look great in a report and do nothing for your product. How to pick a Solana marketing agency that moves the numbers that matter.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-17',
    dateModified: '2026-10-17',
    tags: ['Guides', 'Marketing', 'Hiring'],
    faqs: [
      {
        q: 'How much does a Solana marketing agency cost?',
        a: 'It depends on scope. A single campaign push often starts around $2,000-5,000, while ongoing growth or community management retainers commonly run $3,000-10,000 or more per month. KOL budgets are usually on top of the agency fee.',
      },
      {
        q: 'Are KOL campaigns worth it for Solana projects?',
        a: 'They can be, when the creators genuinely fit your audience, disclose paid promotion and are measured on outcomes such as wallet connects, deposits or retained users rather than impressions alone. Spreading budget across many unvetted accounts rarely works.',
      },
      {
        q: 'What are red flags when hiring a crypto marketing agency?',
        a: 'Guaranteed follower or price outcomes, reports built only on impressions, no named team, unwillingness to share past client results you can verify, and any suggestion of undisclosed paid promotion or bot activity.',
      },
    ],
  },
  {
    slug: 'how-much-does-it-cost-to-build-a-solana-dapp',
    title: 'How much does it cost to build a Solana dApp? A breakdown by component',
    description:
      'What a Solana dApp costs to build: on-chain programs, frontend, indexing and infrastructure, audit and maintenance, plus the scope decisions that move the budget most.',
    excerpt:
      'A Solana dApp is not one thing to price. It is programs, a frontend, off-chain infrastructure, an audit and maintenance. A breakdown of where the money goes and how to keep scope under control.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-17',
    dateModified: '2026-10-23',
    tags: ['Guides', 'Development', 'Pricing'],
    faqs: [
      {
        q: 'How much does it cost to build a Solana dApp?',
        a: 'A simple program with a basic interface might start around $3,000-5,500, while a full protocol with several programs, a production frontend and integrations commonly runs $20,000 or more, before the audit. Scope, not the blockchain, is what moves the number.',
      },
      {
        q: 'How long does it take to build a Solana dApp?',
        a: 'A small, well-scoped MVP can take a few weeks. A production protocol with multiple programs, an audit and fixes usually takes several months, and the audit slot itself often has a waiting list.',
      },
      {
        q: 'What costs do teams forget when budgeting a Solana dApp?',
        a: 'The independent audit and fix review, RPC and indexing infrastructure, monitoring, post-launch maintenance, and the time your own team spends on reviews and decisions.',
      },
    ],
  },
  {
    slug: 'how-to-hire-a-solana-development-company',
    title: 'How to hire a Solana development company: 12 questions to ask before you sign',
    description:
      'A practical guide to hiring a Solana development team: what to ask about Rust and Anchor experience, scoping, testing, audits, ownership of code and how to compare quotes.',
    excerpt:
      'Most bad outsourcing outcomes are visible in the first call if you ask the right questions. Here are the twelve we would ask any team before letting them write a Solana program for us.',
    category: 'Guides',
    readingMinutes: 8,
    datePublished: '2026-10-16',
    dateModified: '2026-10-16',
    tags: ['Guides', 'Development', 'Hiring'],
    faqs: [
      {
        q: 'Should I hire a Solana development company or freelancers?',
        a: 'A company is usually the safer choice when you need several roles at once (on-chain Rust, frontend, DevOps), a single accountable contract and continuity if one engineer leaves. Experienced freelancers can be faster and cheaper for a well-scoped, single-person task.',
      },
      {
        q: 'Do I need a separate audit if my development company tests its code?',
        a: 'Yes. Internal testing and an independent audit catch different problems. A team reviewing its own code shares the same assumptions; an external auditor does not. For any program that holds user funds, budget for an independent audit before mainnet.',
      },
      {
        q: 'Who should own the code and the program upgrade authority?',
        a: 'You should. The contract should state that all code and IP transfer to you, the repository should live in your organisation, and the program upgrade authority should be a wallet or multisig you control, not the developer.',
      },
    ],
  },
  {
    slug: 'how-to-choose-a-solana-smart-contract-auditor',
    title: 'How to choose a Solana smart contract auditor: a practical checklist',
    description:
      'What actually matters when picking a Solana auditor: Anchor and native Rust experience, methodology, scope, timelines, red flags in quotes and what a good report looks like.',
    excerpt:
      'When your mainnet date depends on it, "who do you know?" is not a selection process. A checklist for comparing Solana auditors on what actually predicts a useful audit.',
    category: 'Guides',
    readingMinutes: 7,
    datePublished: '2026-10-16',
    dateModified: '2026-10-16',
    tags: ['Guides', 'Security', 'Audits'],
    faqs: [
      {
        q: 'When should I book a Solana smart contract audit?',
        a: 'Contact auditors as soon as your scope is stable, typically several weeks before you want to launch. Reputable firms are often booked out, and the code should be feature-complete and frozen when the audit starts.',
      },
      {
        q: 'Is one audit enough?',
        a: 'For a small, simple program, one thorough audit plus a fix review is often enough. For complex or high-value protocols, many teams use more than one auditor, add a bug bounty after launch and re-audit significant upgrades.',
      },
      {
        q: 'Does a clean audit report mean my program is secure?',
        a: 'No. An audit reduces risk for the code and commit that were reviewed, within the agreed scope and time. It is not a guarantee, and any change after the audited commit is not covered.',
      },
    ],
  },
  {
    slug: 'why-we-are-building-orivions',
    title: "Why we're building Orivions, and why the Solana services market is broken",
    description:
      "Thousands of funded Solana teams, thousands of service companies, yet the main way they find each other is asking strangers on Discord. Here's the problem we're solving and how.",
    excerpt:
      "Thousands of funded teams, thousands of service companies, yet the main way they find each other is asking strangers on Discord. Here's the problem we're solving, how, and what we'll share along the way.",
    category: 'Building in public',
    readingMinutes: 5,
    datePublished: '2026-10-10',
    dateModified: '2026-10-22',
    tags: ['Building in public', 'Announcement'],
  },
];

export const UPCOMING = [
  {
    title: 'State of Solana Services: first data from the platform',
    excerpt:
      'Supply by category, indicative pricing, and what funded teams are actually looking for. Published when we have real numbers worth sharing.',
    tags: ['Market data', 'Insights'],
  },
];

/** Newest first. */
export function sortedPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

/** Up to `limit` other posts, ranked by shared tags (ignoring the generic "Guides"), then by recency. */
export function relatedPosts(slug: string, limit = 3): Post[] {
  const post = getPost(slug);
  const tags = new Set(post.tags.filter((t) => t !== 'Guides'));
  return sortedPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);
}

/** Per-post social card, rendered by app/og/route.tsx. */
export function ogImageUrl(title: string, label = 'Orivions Blog'): string {
  return `${SITE_URL}/og?title=${encodeURIComponent(title)}&label=${encodeURIComponent(label)}`;
}

export function getPost(slug: string): Post {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown blog post: ${slug}`);
  return post;
}

export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
