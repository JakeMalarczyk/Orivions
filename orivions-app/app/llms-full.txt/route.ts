import { CONTACT_EMAIL } from '@/lib/contact';
import { SITE_URL, postUrl, sortedPosts } from '@/lib/blog';
import { GLOSSARY, termPath } from '@/lib/glossary';

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
    .map((t) => `- **${t.term}**: ${t.definition} (${SITE_URL}${termPath(t.id)})`)
    .join('\n');

  const body = `# Orivions: full reference for LLMs

> Orivions is the verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies. Free for clients; providers pay a 10% success fee only on completed work. (${SITE_URL})

Teams describe what they need in plain English and Smart Match (AI) suggests the 1-3 best-fitting human-verified service providers, with a reason for each match.

## Key facts

- What it is: a marketplace connecting onchain teams with verified service providers: smart contract auditors, development companies, marketing and growth agencies, and more.
- Who it is for: funded onchain teams hiring service providers, and service companies looking for onchain clients.
- Pricing for clients: free. Searching, matching and contacting providers costs nothing.
- Pricing for providers: a flat 10% success fee on completed engagements. No subscriptions and no listing fees. No paid placements: ranking and matches are never for sale.
- Verification: four checks by a person, all required: the company is real, at least one portfolio project is confirmed independently, a client reference, and a 15-minute call. Process: ${SITE_URL}/how-we-verify
- Smart Match: describe your project in plain English, no account needed, and get 1-3 suggested providers with a reason for each.
- Coverage: Orivions serves onchain teams. Guides, tools and the glossary currently cover Solana.
- Ranking: Smart Match ranks providers by fit to the stated need, not by payment. No paid placements: ranking and matches are never for sale. The Verified badge cannot be bought either.
- Contact: ${CONTACT_EMAIL} (Orivions team). Contact page: ${SITE_URL}/contact

## Main pages

- About (verification process, business model): ${SITE_URL}/about
- How we verify providers: ${SITE_URL}/how-we-verify
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
