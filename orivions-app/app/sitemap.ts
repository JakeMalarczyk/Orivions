import type { MetadataRoute } from 'next';
import { SITE_URL, sortedPosts } from '@/lib/blog';
import { GLOSSARY, termPath } from '@/lib/glossary';
import { listVerifiedProviders } from '@/lib/providers';

// English-only site: no language alternates by design.
// Blog posts come from lib/blog.ts and verified provider pages from Supabase,
// so both are in the sitemap automatically.
//
// lastModified must be a real date (search engines ignore a sitemap that says
// "changed now" on every fetch). For static pages: update `updated` when you
// change the page's content.
export const revalidate = 3600;

const GLOSSARY_UPDATED = '2026-10-20';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = sortedPosts();
  const newestPost = posts.reduce((max, p) => (p.dateModified > max ? p.dateModified : max), '2026-01-01');

  const pages = [
    { path: '/', updated: '2026-10-23', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/providers', updated: '2026-10-22', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/smart-match', updated: '2026-10-20', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/insights', updated: '2026-10-20', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/solana-smart-contract-audits', updated: '2026-10-23', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/solana-development-companies', updated: '2026-10-23', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/solana-marketing-growth-agencies', updated: '2026-10-18', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/blog', updated: newestPost, priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', updated: '2026-10-23', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/how-we-verify', updated: '2026-10-22', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/solana-glossary', updated: GLOSSARY_UPDATED, priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/founding-providers', updated: '2026-10-22', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/tools', updated: '2026-10-20', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/tools/solana-audit-cost-calculator', updated: '2026-10-23', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools/solana-dapp-cost-calculator', updated: '2026-10-23', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/ai-proposal-generator', updated: '2026-10-17', priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  const day = (d: string) => new Date(`${d}T00:00:00Z`);

  const staticEntries = pages.map(({ path, updated, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: day(updated),
    changeFrequency,
    priority,
  }));

  const postEntries = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: day(p.dateModified),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const termEntries = GLOSSARY.map((t) => ({
    url: `${SITE_URL}${termPath(t.id)}`,
    lastModified: day(GLOSSARY_UPDATED),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const providerEntries = (await listVerifiedProviders()).map((p) => ({
    url: `${SITE_URL}/providers/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...termEntries, ...providerEntries];
}
