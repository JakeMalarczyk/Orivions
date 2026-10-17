import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { AUTHOR, SITE_URL, formatPostDate, getPost, ogImageUrl, postUrl, relatedPosts, type Post } from '@/lib/blog';

// Shared layout for every blog post: breadcrumb, byline with dates, FAQ block,
// closing CTA and the structured data (BlogPosting, BreadcrumbList, FAQPage)
// that search engines and AI answer engines read.

export function postMetadata(slug: string): Metadata {
  const post = getPost(slug);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [AUTHOR.name],
      tags: post.tags,
      images: [{ url: ogImageUrl(post.title, post.category), width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImageUrl(post.title, post.category)],
    },
  };
}

function jsonLd(post: Post) {
  const url = postUrl(post.slug);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      inLanguage: 'en',
      keywords: post.tags.join(', '),
      articleSection: post.category,
      image: ogImageUrl(post.title, post.category),
      author: { '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role, url: AUTHOR.url },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: post.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 font-heading text-[22px] font-semibold">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 leading-relaxed text-[#27272E]">{children}</p>;
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-line border-l-[3px] border-l-blue-deep bg-bg-soft p-5 text-[15px]">
      {children}
    </div>
  );
}

export function BulletList({ items }: { items: [string, ReactNode][] }) {
  return (
    <ul className="mt-3 list-disc space-y-2.5 pl-5 leading-relaxed text-[#27272E]">
      {items.map(([lead, rest]) => (
        <li key={lead}>
          <b>{lead}</b> {rest}
        </li>
      ))}
    </ul>
  );
}

function RelatedPosts({ slug }: { slug: string }) {
  const related = relatedPosts(slug);
  if (!related.length) return null;
  return (
    <section className="mt-12">
      <h2 className="font-heading text-[22px] font-semibold">Related reading</h2>
      <ul className="mt-4 space-y-3">
        {related.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="block rounded-2xl border border-line p-5 hover:border-blue-deep">
              <span className="font-semibold">{p.title}</span>
              <span className="mt-1 block text-sm text-gray">{p.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BlogPost({
  slug,
  breadcrumbLabel,
  summary,
  children,
  cta,
}: {
  slug: string;
  breadcrumbLabel: string;
  /** "Key takeaways" box at the top: short, answer-first, quotable. */
  summary?: string[];
  children: ReactNode;
  cta?: { title: string; text: string; href: string; label: string };
}) {
  const post = getPost(slug);
  return (
    <>
      <Header />
      <article className="mx-auto max-w-2xl px-6 pb-20 pt-12">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> /{' '}
          <Link href="/blog" className="text-blue-deep">Blog</Link> / {breadcrumbLabel}
        </p>
        <div className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-soft">
          {post.category} · {post.readingMinutes} min read
        </div>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[34px]">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-gray-soft">
          By <span className="font-semibold text-gray">{AUTHOR.name}</span>, {AUTHOR.role} ·{' '}
          <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
          {post.dateModified !== post.datePublished && (
            <>
              {' '}· Updated <time dateTime={post.dateModified}>{formatPostDate(post.dateModified)}</time>
            </>
          )}
        </p>

        {summary?.length ? (
          <div className="mt-8 rounded-2xl border border-line bg-bg-soft p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">Key takeaways</div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#27272E]">
              {summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {children}

        {post.faqs?.length ? (
          <section className="mt-12">
            <h2 className="font-heading text-[22px] font-semibold">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {post.faqs.map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-line p-5">
                  <h3 className="font-semibold">{q}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray">{a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {cta && (
          <div className="mt-12 rounded-2xl bg-ink p-7 text-white">
            <h2 className="font-heading text-xl font-semibold">{cta.title}</h2>
            <p className="mt-2 text-sm text-white/75">{cta.text}</p>
            <Link href={cta.href} className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink">
              {cta.label}
            </Link>
          </div>
        )}

        <RelatedPosts slug={post.slug} />

        <p className="mt-10 text-sm">
          <Link href="/blog" className="text-blue-deep">← All posts</Link>
        </p>
      </article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)) }}
      />
    </>
  );
}
