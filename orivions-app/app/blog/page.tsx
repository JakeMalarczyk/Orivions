import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Blog — Building the business layer for Solana',
  description:
    'Building in public: product updates with real numbers, market data, and practical guides for hiring (and being hired) in the Solana ecosystem.',
  alternates: { canonical: '/blog' },
};

// Post registry. Adding a post = one entry here + one folder under app/blog/.
// Deliberately a plain array, not a CMS — at this stage simplicity beats tooling.
const POSTS = [
  {
    slug: 'why-we-are-building-orivions',
    meta: 'Building in public · 5 min read',
    title: "Why we're building Orivions — and why the Solana services market is broken",
    excerpt:
      "Thousands of funded teams, thousands of service companies, and the main way they find each other is asking strangers on Discord. Here's the problem we're solving, how, and what we'll share along the way.",
    tags: ['Building in public', 'Announcement'],
  },
];

const UPCOMING = [
  {
    title: 'How to choose a Solana smart contract auditor (a practical checklist)',
    excerpt: 'What actually matters when your mainnet date depends on it: Anchor experience, methodology, red flags in quotes, and realistic timelines.',
    tags: ['Guides', 'Security'],
  },
  {
    title: 'State of Solana Services — first data from the platform',
    excerpt: 'Supply by category, indicative pricing, and what funded teams are actually looking for. Published when we have real numbers worth sharing.',
    tags: ['Market data', 'Insights'],
  },
];

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full border border-line bg-bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-gray">
          {t}
        </span>
      ))}
    </div>
  );
}

export default function BlogIndexPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-14">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Building the business layer for Solana — in public.
        </h1>
        <p className="mt-3 text-gray">
          Product updates with real numbers, market data from the platform, and practical guides
          for hiring (and being hired) in the Solana ecosystem. No hype, no filler.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block rounded-2xl border border-line p-6 transition hover:border-blue-deep hover:shadow-md"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-gray-soft">{p.meta}</div>
              <h2 className="mt-2 font-heading text-xl font-semibold leading-snug">{p.title}</h2>
              <p className="mt-2 text-sm text-gray">{p.excerpt}</p>
              <Tags tags={p.tags} />
            </Link>
          ))}

          {UPCOMING.map((p) => (
            <div key={p.title} className="rounded-2xl border border-dashed border-line p-6 opacity-75">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-soft">Coming soon</div>
              <h2 className="mt-2 font-heading text-xl font-semibold leading-snug">{p.title}</h2>
              <p className="mt-2 text-sm text-gray">{p.excerpt}</p>
              <Tags tags={p.tags} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
