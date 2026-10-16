import { SITE_URL, postUrl, sortedPosts } from '@/lib/blog';

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for LLMs and
// AI answer engines (GEO). Blog posts are pulled from lib/blog.ts so the file
// never goes stale.
export const dynamic = 'force-static';

export function GET() {
  const posts = sortedPosts()
    .map((p) => `- [${p.title}](${postUrl(p.slug)}): ${p.description}`)
    .join('\n');

  const body = `# Orivions

> Orivions is a verified B2B marketplace for the Solana ecosystem. Solana teams describe what they need in plain English and Smart Match (AI) suggests the 1-3 best-fitting human-verified service providers — smart contract auditors, development companies, marketing and growth agencies and more — with a reason for each match. Free for clients; providers pay a flat 10% success fee only when an engagement is completed. No subscriptions, no listing fees, and sponsored placements are always labeled.

Key facts:
- Ecosystem: Solana only, by design.
- Pricing: free for clients; providers pay a flat 10% success fee on completed engagements.
- Verification: a person at Orivions checks each provider (real company, portfolio, services and price ranges) before it is marked Verified.
- Website: ${SITE_URL}
- Source code: https://github.com/JakeMalarczyk/Orivions

## Product

- [Smart Match](${SITE_URL}/smart-match): describe your project and get matched with verified Solana providers, no account needed.
- [Find providers](${SITE_URL}/providers): browse verified companies by category.
- [Insights](${SITE_URL}/insights): live provider counts and indicative pricing by category.

## Categories

- [Solana smart contract audits](${SITE_URL}/solana-smart-contract-audits): verified auditors for Anchor and native Rust programs, what to look for and typical pricing.
- [Solana development companies](${SITE_URL}/solana-development-companies): verified teams for programs, dApps and infrastructure.
- [Solana marketing and growth agencies](${SITE_URL}/solana-marketing-growth-agencies): verified agencies for launches, community and growth.

## Guides and blog

${posts}

## Optional

- [Blog RSS feed](${SITE_URL}/blog/rss.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
