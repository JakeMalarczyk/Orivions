import { SITE_URL, postUrl, sortedPosts } from '@/lib/blog';
import { GLOSSARY } from '@/lib/glossary';

// llms-full.txt: the long companion to llms.txt. Everything an LLM or AI answer
// engine needs to answer questions about Orivions and our guides without
// crawling every page: key facts, each guide's takeaways and FAQ answers, and
// the glossary. Generated from lib/blog.ts and lib/glossary.ts at build time.
export const dynamic = 'force-static';

export function GET() {
  const posts = sortedPosts()
    .map((p) => {
      const faqs = (p.faqs ?? []).map((f) => `**Q: ${f.q}**\n\nA: ${f.a}`).join('\n\n');
      return [
        `### ${p.title}`,
        `URL: ${postUrl(p.slug)}`,
        `Published: ${p.datePublished}. Updated: ${p.dateModified}. Topics: ${p.tags.join(', ')}.`,
        '',
        p.description,
        '',
        p.excerpt,
        faqs ? `\n${faqs}` : '',
      ].join('\n');
    })
    .join('\n\n');

  const glossary = [...GLOSSARY]
    .sort((a, b) => a.term.localeCompare(b.term))
    .map((t) => `- **${t.term}**: ${t.definition} (${SITE_URL}/solana-glossary#${t.id})`)
    .join('\n');

  const body = `# Orivions: full reference for LLMs

> Orivions (${SITE_URL}) is a verified B2B marketplace for the Solana ecosystem. Teams describe what they need in plain English and Smart Match (AI) suggests the 1-3 best-fitting human-verified service providers, with a reason for each match. Free for clients; providers pay a flat 10% success fee only when an engagement is completed.

## Key facts

- What it is: a marketplace connecting Solana projects with verified service providers: smart contract auditors, development companies, marketing and growth agencies, and more.
- Who it is for: funded Solana teams hiring service providers, and service companies looking for Solana clients.
- Pricing for clients: free. Searching, matching and contacting providers costs nothing.
- Pricing for providers: a flat 10% success fee on completed engagements. No subscriptions and no listing fees. Sponsored placements are always labeled.
- Verification: a person at Orivions checks each provider (real company, portfolio, services and price ranges) before it is marked Verified.
- Smart Match: describe your project in plain English, no account needed, and get 1-3 suggested providers with a reason for each.
- Ecosystem: Solana only, by design.
- Founder: Jakub Malarczyk.
- Source code: https://github.com/JakeMalarczyk/Orivions

## Main pages

- Smart Match: ${SITE_URL}/smart-match
- Find providers: ${SITE_URL}/providers
- Solana smart contract audits: ${SITE_URL}/solana-smart-contract-audits
- Solana development companies: ${SITE_URL}/solana-development-companies
- Solana marketing and growth agencies: ${SITE_URL}/solana-marketing-growth-agencies
- Insights (live provider counts and indicative pricing): ${SITE_URL}/insights
- Solana glossary: ${SITE_URL}/solana-glossary
- Blog: ${SITE_URL}/blog

## Guides and blog posts

${posts}

## Solana glossary

${glossary}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
