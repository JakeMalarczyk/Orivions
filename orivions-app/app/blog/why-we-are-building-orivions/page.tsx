import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: "Why we're building Orivions — and why the Solana services market is broken",
  description:
    "Thousands of funded Solana teams, thousands of service companies — and the main way they find each other is asking strangers on Discord. Here's the problem we're solving and how.",
  alternates: { canonical: '/blog/why-we-are-building-orivions' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: "Why we're building Orivions — and why the Solana services market is broken",
  url: 'https://orivions.com/blog/why-we-are-building-orivions',
  author: { '@type': 'Person', name: 'Jakub Malarczyk' },
  publisher: { '@type': 'Organization', name: 'Orivions', url: 'https://orivions.com' },
};

export default function PostPage() {
  return (
    <>
      <Header />
      <article className="mx-auto max-w-2xl px-6 pb-20 pt-12">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> /{' '}
          <Link href="/blog" className="text-blue-deep">Blog</Link> / Why we&apos;re building Orivions
        </p>
        <div className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-soft">
          Building in public · 5 min read
        </div>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[34px]">
          Why we&apos;re building Orivions — and why the Solana services market is broken
        </h1>

        <p className="mt-6 text-lg text-gray">
          Thousands of funded teams. Thousands of service companies. And the main way they find
          each other in 2026 is asking strangers on Discord and hoping the recommendation
          isn&apos;t someone&apos;s friend doing them a favor.
        </p>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">The problem, concretely</h2>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          If you&apos;ve ever shipped anything on Solana, you know this moment: you need an
          auditor before mainnet, or a Rust developer for a fork, or someone who actually
          understands crypto marketing. So you post in a Discord server. You get three
          conflicting recommendations, one link to an agency with a beautiful website and no
          verifiable track record, and one DM from someone who &quot;can definitely do it&quot;
          for suspiciously little.
        </p>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          There&apos;s no place to verify who&apos;s actually good. Portfolios are unverifiable
          claims. Reviews on generic B2B directories are gameable — and worse, most of those
          directories openly sell visibility, so the &quot;top&quot; providers are simply the
          ones who paid the most.
        </p>

        <div className="mt-6 rounded-xl border border-line border-l-[3px] border-l-blue-deep bg-bg-soft p-5 text-[15px]">
          <b>We checked.</b> One of the biggest Web3 B2B directories states in its own FAQ that
          free-tier providers get &quot;limited visibility&quot; compared to paying ones. Ranking
          by invoice, not by quality, is the industry standard. We think that&apos;s exactly
          backwards.
        </div>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">What Orivions does about it</h2>
        <ul className="mt-3 list-disc space-y-2.5 pl-5 leading-relaxed text-[#27272E]">
          <li>
            <b>Describe what you need in plain English</b> — AI matches you with relevant
            verified providers in about 30 seconds, with a reason for every match. No category
            browsing, no RFQ forms, no waiting.
          </li>
          <li>
            <b>Verification means a human checked</b> — real portfolio, real services,
            transparent price ranges. Sponsored placements exist, but they&apos;re clearly
            labeled and never mixed into organic results.
          </li>
          <li>
            <b>Free for clients. Entirely.</b> Searching, matching, contacting — $0, forever.
            Providers pay a success fee only when a deal actually closes. Our incentives are
            aligned with deals happening, not with listing fees.
          </li>
        </ul>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">Why Solana specifically</h2>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          Generic Web3 directories go wide and shallow — every chain, every category, no depth
          anywhere. We&apos;re going the opposite way: one ecosystem, deeply. Solana has the
          builder density, the funding pipeline (grants, hackathons, accelerators), and the
          culture of shipping fast that makes a dedicated services layer genuinely useful rather
          than nice-to-have.
        </p>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">
          What &quot;building in public&quot; means here
        </h2>
        <p className="mt-3 leading-relaxed text-[#27272E]">
          This blog will publish real numbers — providers onboarded, deals closed, what worked,
          what didn&apos;t. Including the failures, because a launch journal that only reports
          wins is marketing pretending to be transparency. Next up: a practical guide to
          choosing a Solana auditor, and the first &quot;State of Solana Services&quot; data
          report once the platform has numbers worth publishing.
        </p>

        <div className="mt-12 rounded-2xl bg-ink p-8 text-white">
          <h2 className="font-heading text-xl font-semibold">See it working today</h2>
          <p className="mt-2 text-sm text-white/70">
            Describe your project — get matched with verified Solana providers in 30 seconds.
            Free, no account needed.
          </p>
          <Link
            href="/smart-match"
            className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink"
          >
            Try Smart Match →
          </Link>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
