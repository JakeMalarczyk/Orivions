import { AUTHOR, SITE_URL, postUrl, sortedPosts } from '@/lib/blog';

// RSS 2.0 feed for the blog, generated at build time from lib/blog.ts.
export const dynamic = 'force-static';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = sortedPosts();
  const lastModified = posts[0]?.dateModified ?? '2026-10-10';
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${postUrl(p.slug)}</link>
      <guid isPermaLink="true">${postUrl(p.slug)}</guid>
      <description>${escapeXml(p.description)}</description>
      <category>${escapeXml(p.category)}</category>
      <dc:creator>${escapeXml(AUTHOR.name)}</dc:creator>
      <pubDate>${new Date(`${p.datePublished}T09:00:00Z`).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Orivions Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Guides for hiring auditors and development teams in the Solana ecosystem, plus building-in-public updates from Orivions.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date(`${lastModified}T09:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
