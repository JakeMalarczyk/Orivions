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
  name: 'Jakub Malarczyk',
  role: 'Founder, Orivions',
  url: 'https://github.com/JakeMalarczyk',
};

export const POSTS: Post[] = [
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
    dateModified: '2026-10-17',
    tags: ['Guides', 'Security', 'Audits', 'Pricing'],
    faqs: [
      {
        q: 'How much does a Solana smart contract audit cost?',
        a: 'It depends mostly on the size and complexity of the code in scope. Small, single-purpose programs often start in the low thousands of dollars, while large DeFi protocols with several interacting programs can cost tens of thousands. Ask several verified auditors for a quote against the same frozen commit.',
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
    dateModified: '2026-10-17',
    tags: ['Guides', 'Development', 'Pricing'],
    faqs: [
      {
        q: 'How much does it cost to build a Solana dApp?',
        a: 'A simple program with a basic interface might start around $2,000-5,000, while a full protocol with several programs, a production frontend and integrations commonly runs $20,000 or more, before the audit. Scope, not the blockchain, is what moves the number.',
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
    dateModified: '2026-10-10',
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
