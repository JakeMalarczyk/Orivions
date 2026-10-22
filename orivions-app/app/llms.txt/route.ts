import { SITE_URL, postUrl, sortedPosts } from '@/lib/blog';
import { listVerifiedProviders } from '@/lib/providers';

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for LLMs and
// AI answer engines (GEO). Blog posts are pulled from lib/blog.ts so the file
// never goes stale. Verified providers come from Supabase, refreshed hourly.
export const revalidate = 3600;

export async function GET() {
  const posts = sortedPosts()
    .map((p) => `- [${p.title}](${postUrl(p.slug)}): ${p.description}`)
    .join('\n');

  const verified = (await listVerifiedProviders())
    .map((p) => `- [${p.name}](${SITE_URL}/providers/${p.slug}): ${p.category}${p.founding_provider ? ', Founding Provider' : ''}.`)
    .join('\n');

  const body = `# Orivions

> Orivions is the verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies. Free for clients; providers pay a 10% success fee only on completed work.

Teams describe what they need in plain English and Smart Match suggests the 1-3 best-fitting human-verified service providers (smart contract auditors, development companies, marketing and growth agencies and more) with a reason for each match. No subscriptions, no listing fees. No paid placements: ranking and matches are never for sale.

Key facts:
- Who it is for: onchain teams hiring service providers. Guides and tools currently cover Solana.
- Pricing: free for clients; providers pay a flat 10% success fee on completed engagements.
- Verification: four checks by a person, all required: the company is real, at least one portfolio project is confirmed independently, a client reference, and a 15-minute call. Process: ${SITE_URL}/how-we-verify
- Website: ${SITE_URL}

## Product

- [About Orivions](${SITE_URL}/about): who builds Orivions, how provider verification works and how Orivions makes money.
- [Smart Match](${SITE_URL}/smart-match): describe your project and get matched with verified providers, no account needed. During early access, the Orivions team hand-picks every shortlist.
- [Find providers](${SITE_URL}/providers): browse verified companies by category. Each verified provider has a profile page at ${SITE_URL}/providers/<slug>.
- [How we verify providers](${SITE_URL}/how-we-verify): the four checks every provider must pass before it is marked Verified, and the red flags that lead to a rejection.
- [Founding Providers](${SITE_URL}/founding-providers): how onchain service companies join the first 20 verified providers on Orivions, what verification checks and what it costs (free profile, 10% success fee on completed work).
- [Insights](${SITE_URL}/insights): live provider counts and indicative pricing by category.
- [Solana glossary](${SITE_URL}/solana-glossary): plain-English definitions of Solana terms (PDA, CPI, Anchor, compute units, upgrade authority, verifiable builds and more). Each term has its own page at ${SITE_URL}/solana-glossary/<term>, for example [PDA](${SITE_URL}/solana-glossary/pda).

## Tools

- [Solana smart contract audit cost calculator](${SITE_URL}/tools/solana-audit-cost-calculator): free estimate of audit cost and duration from lines of code, complexity, framework and integrations, with the full method and worked examples.
- [Solana dApp development cost calculator](${SITE_URL}/tools/solana-dapp-cost-calculator): free estimate of build cost, timeline and yearly maintenance from programs, frontend, backend, extras and team type (freelancer or agency), with the full method and worked examples.
- [All free tools](${SITE_URL}/tools)

## Categories

- [Solana smart contract audits](${SITE_URL}/solana-smart-contract-audits): verified auditors for Anchor and native Rust programs, what to look for and typical pricing.
- [Solana development companies](${SITE_URL}/solana-development-companies): verified teams for programs, dApps and infrastructure.
- [Solana marketing and growth agencies](${SITE_URL}/solana-marketing-growth-agencies): verified agencies for launches, community and growth.

${verified ? `## Verified providers\n\n${verified}\n\n` : ''}## Guides and blog

${posts}

## Optional

- [Full text for LLMs](${SITE_URL}/llms-full.txt): key facts, every guide's summary and FAQ answers, and the full glossary in one file.
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
