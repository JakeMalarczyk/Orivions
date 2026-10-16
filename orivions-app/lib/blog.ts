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
    title: "Why we're building Orivions — and why the Solana services market is broken",
    description:
      "Thousands of funded Solana teams, thousands of service companies — and the main way they find each other is asking strangers on Discord. Here's the problem we're solving and how.",
    excerpt:
      "Thousands of funded teams, thousands of service companies, and the main way they find each other is asking strangers on Discord. Here's the problem we're solving, how, and what we'll share along the way.",
    category: 'Building in public',
    readingMinutes: 5,
    datePublished: '2026-10-10',
    dateModified: '2026-10-10',
    tags: ['Building in public', 'Announcement'],
  },
];

export const UPCOMING = [
  {
    title: 'State of Solana Services — first data from the platform',
    excerpt:
      'Supply by category, indicative pricing, and what funded teams are actually looking for. Published when we have real numbers worth sharing.',
    tags: ['Market data', 'Insights'],
  },
];

/** Newest first. */
export function sortedPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
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
