import type { MetadataRoute } from 'next';
import { SITE_URL, sortedPosts } from '@/lib/blog';
import { GLOSSARY, termPath } from '@/lib/glossary';

// English-only site: no language alternates by design.
// Blog posts come from lib/blog.ts, so a new post is in the sitemap automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/providers', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/smart-match', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/insights', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/solana-smart-contract-audits', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/solana-development-companies', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/solana-marketing-growth-agencies', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/solana-glossary', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/tools', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/tools/solana-audit-cost-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools/solana-dapp-cost-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/ai-proposal-generator', priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  const now = new Date();
  const staticEntries = pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const postEntries = sortedPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.dateModified}T00:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const termEntries = GLOSSARY.map((t) => ({
    url: `${SITE_URL}${termPath(t.id)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...postEntries, ...termEntries];
}
