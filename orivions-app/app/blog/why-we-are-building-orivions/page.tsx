import Link from 'next/link';
import BlogPost, { postMetadata } from '@/components/BlogPost';

const SLUG = 'why-we-are-building-orivions';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Why we're building Orivions"
      cta={{
        title: 'See it working today',
        text: 'Describe your project and get matched with verified Solana providers in 30 seconds. Free, no account needed.',
        href: '/smart-match',
        label: 'Try Smart Match →',
      }}
    >
        <p className="mt-6 text-lg text-gray">
          Thousands of funded teams. Thousands of service companies. And the main way they find
          each other in 2026 is asking strangers on Discord and hoping the recommendation
          isn&apos;t someone&apos;s friend doing them a favor.
        </p>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">The problem, concretely</h2>
        <p className="mt-3 leading-relaxed text-ink/90">
          If you&apos;ve ever shipped anything on Solana, you know this moment: you need an
          auditor before mainnet, or a Rust developer for a fork, or someone who actually
          understands crypto marketing. So you post in a Discord server. You get three
          conflicting recommendations, one link to an agency with a beautiful website and no
          verifiable track record, and one DM from someone who &quot;can definitely do it&quot;
          for suspiciously little.
        </p>
        <p className="mt-3 leading-relaxed text-ink/90">
          There&apos;s no place to verify who&apos;s actually good. Portfolios are unverifiable
          claims. Reviews on generic B2B directories are gameable, and worse, most of those
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
        <ul className="mt-3 list-disc space-y-2.5 pl-5 leading-relaxed text-ink/90">
          <li>
            <b>Describe what you need in plain English</b>: AI matches you with relevant
            verified providers in about 30 seconds, with a reason for every match. No category
            browsing, no RFQ forms, no waiting.
          </li>
          <li>
            <b>Verification means a human checked</b>: real portfolio, real services,
            transparent price ranges. No paid placements: ranking and matches are
            never for sale.
          </li>
          <li>
            <b>Free for clients. Entirely.</b> Searching, matching, contacting: $0, forever.
            Providers pay a success fee only when a deal actually closes. Our incentives are
            aligned with deals happening, not with listing fees.
          </li>
        </ul>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">Why Solana specifically</h2>
        <p className="mt-3 leading-relaxed text-ink/90">
          Generic Web3 directories go wide and shallow: every chain, every category, no depth
          anywhere. We&apos;re going the opposite way: one ecosystem, deeply. Solana has the
          builder density, the funding pipeline (grants, hackathons, accelerators), and the
          culture of shipping fast that makes a dedicated services layer genuinely useful rather
          than nice-to-have.
        </p>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">
          What &quot;building in public&quot; means here
        </h2>
        <p className="mt-3 leading-relaxed text-ink/90">
          This blog will publish real numbers: providers onboarded, deals closed, what worked,
          what didn&apos;t. Including the failures, because a launch journal that only reports
          wins is marketing pretending to be transparency. Our first practical guide is out:{' '}
          <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">how to choose a Solana smart contract auditor</Link>. Next up: the first &quot;State of Solana Services&quot; data
          report once the platform has numbers worth publishing.
        </p>

    </BlogPost>
  );
}
