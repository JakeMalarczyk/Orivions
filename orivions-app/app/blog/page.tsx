import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { SITE_URL, UPCOMING, formatPostDate, isoDate, postUrl, sortedPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog: Building the business layer for Solana',
  description:
    'Building in public: practical guides for hiring auditors and development teams in the Solana ecosystem, product updates with real numbers, and market data.',
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
};

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full border border-line bg-bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-gray">
          {t}
        </span>
      ))}
    </div>
  );
}

export default function BlogIndexPage() {
  const posts = sortedPosts();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    name: 'Orivions Blog',
    url: `${SITE_URL}/blog`,
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: postUrl(p.slug),
      datePublished: isoDate(p.datePublished),
      dateModified: isoDate(p.dateModified),
    })),
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <h1 className="font-heading text-[36px] font-medium leading-[1.1] tracking-tight md:text-[52px]">
          Building the business layer for Solana, in public.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray">
          Guides for hiring in the Solana ecosystem, and notes from building Orivions.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/solana-glossary" className="text-blue-deep">
            Solana glossary
          </Link>
        </p>

        <div className="mt-12 divide-y divide-line border-y border-line">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block py-7"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-soft">
                {p.category} · <time dateTime={p.datePublished}>{formatPostDate(p.datePublished)}</time> ·{' '}
                {p.readingMinutes} min read
              </div>
              <h2 className="mt-2 font-heading text-[26px] font-medium leading-snug group-hover:text-blue-deep">{p.title}</h2>
              <p className="mt-2 max-w-2xl text-gray">{p.excerpt}</p>
              <Tags tags={p.tags} />
            </Link>
          ))}

          {UPCOMING.map((p) => (
            <div key={p.title} className="py-7">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-soft">Coming soon</div>
              <h2 className="mt-2 font-heading text-[26px] font-medium leading-snug text-gray">{p.title}</h2>
              <p className="mt-2 max-w-2xl text-gray">{p.excerpt}</p>
              <Tags tags={p.tags} />
            </div>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
    </>
  );
}
