import type { MetadataRoute } from 'next';

const base = 'https://orivions.com';

// English-only site: no language alternates by design.
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
    { path: '/blog/why-we-are-building-orivions', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/ai-proposal-generator', priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
