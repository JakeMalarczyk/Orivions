import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { AUTHOR, FOUNDER_JSONLD, SITE_URL, isoDate, formatPostDate, getPost, ogImageUrl, postUrl, relatedPosts, type Post } from '@/lib/blog';
import { POST_SEO } from '@/lib/seoMeta';

// Shared layout for every blog post: breadcrumb, byline with dates, FAQ block,
// closing CTA and the structured data (BlogPosting, BreadcrumbList, FAQPage)
// that search engines and AI answer engines read.

export function postMetadata(slug: string): Metadata {
  const post = getPost(slug);
  const seo = POST_SEO[slug];
  return {
    title: seo?.title ?? post.title,
    description: seo?.description ?? post.description,
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
      datePublished: isoDate(post.datePublished),
      dateModified: isoDate(post.dateModified),
      inLanguage: 'en',
      keywords: post.tags.join(', '),
      articleSection: post.category,
      image: ogImageUrl(post.title, post.category),
      author: FOUNDER_JSONLD,
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
  return <h2 className="mt-12 font-heading text-[28px] font-medium leading-tight">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[17px] leading-[1.75] text-ink/90">{children}</p>;
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 border-l-2 border-blue-deep bg-bg-soft px-6 py-5 text-[15px] leading-relaxed">
      {children}
    </div>
  );
}

export function BulletList({ items }: { items: [string, ReactNode][] }) {
  return (
    <ul className="mt-3 list-disc space-y-2.5 pl-5 text-[17px] leading-[1.7] text-ink/90">
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
      <h2 className="font-heading text-[28px] font-medium">Related reading</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {related.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="block py-5 hover:text-blue-deep">
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
  answer,
  glance,
  children,
  cta,
}: {
  slug: string;
  breadcrumbLabel: string;
  /** "Key takeaways" box at the top: short, answer-first, quotable. */
  summary?: string[];
  /** Answer-first paragraph right under the H1: 40-60 words, starts with the query. */
  answer?: string;
  /** Small "at a glance" table under the answer. */
  glance?: { caption: string; head: string[]; rows: string[][]; note?: string };
  children: ReactNode;
  cta?: { title: string; text: string; href: string; label: string };
}) {
  const post = getPost(slug);
  return (
    <>
      <Header />
      <PageHero
        width="max-w-[44rem]"
        eyebrow={
          <>
            <Link href="/blog" className="hover:text-white">Blog</Link> · {post.category} · {post.readingMinutes} min read
          </>
        }
        title={post.title}
        lede={
          <span className="text-base text-white/60">
            By <span className="font-semibold text-white/80">{AUTHOR.name}</span>, {AUTHOR.role} ·{' '}
            <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
            {post.dateModified !== post.datePublished && (
              <>
                {' '}· Updated <time dateTime={post.dateModified}>{formatPostDate(post.dateModified)}</time>
              </>
            )}
          </span>
        }
      />
      <article className="mx-auto max-w-[44rem] px-8 pb-24 pt-4">
        {answer ? (
          <p className="mt-8 font-heading text-[21px] leading-[1.5] text-ink">{answer}</p>
        ) : null}

        {glance ? (
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-soft">{glance.caption}</div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
                    {glance.head.map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {glance.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-line last:border-0">
                      {row.map((cell, i) => (
                        <td key={i} className={i === 0 ? 'px-4 py-3 font-semibold' : 'px-4 py-3 tabular-nums text-gray'}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {glance.note ? <p className="mt-2 text-xs text-gray-soft">{glance.note}</p> : null}
          </div>
        ) : null}

        {summary?.length ? (
          <div className="mt-8 border-l-2 border-blue-deep pl-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-soft">Key takeaways</div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
              {summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {children}

        {post.faqs?.length ? (
          <section className="mt-12">
            <h2 className="font-heading text-[28px] font-medium">Frequently asked questions</h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {post.faqs.map(({ q, a }) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <span aria-hidden className="text-xl text-gray-soft transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {cta && (
          <div className="mt-14 rounded-xl bg-ink p-8 text-white [background-image:radial-gradient(70%_100%_at_100%_0%,rgb(var(--c-blue-light)/0.25),transparent_70%)]">
            <h2 className="font-heading text-2xl font-medium">{cta.title}</h2>
            <p className="mt-2 text-sm text-white/75">{cta.text}</p>
            <Link href={cta.href} className="mt-4 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ink">
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
         
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd(post)) }}
      />
    </>
  );
}
