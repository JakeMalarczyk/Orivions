import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { POSTS, SITE_URL, ogImageUrl } from '@/lib/blog';
import { GLOSSARY, getTerm, shortTerm, termPath, type GlossaryTerm } from '@/lib/glossary';
import { GLOSSARY_DETAILS } from '@/lib/glossaryDetails';

// One page per glossary term. Answer-first (the definition is the first thing
// on the page and in the FAQ answer), so search snippets and AI answer engines
// can quote it, then why it matters, what to check, related terms and guides.

export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ id: t.id }));
}

function firstSentence(text: string): string {
  const first = text.split('. ')[0] ?? text;
  return first.endsWith('.') ? first : `${first}.`;
}

function question(t: GlossaryTerm): string {
  return t.term.includes('(Orivions)')
    ? `What is a verified provider on Orivions?`
    : `What does “${shortTerm(t)}” mean on Solana?`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = getTerm(id);
  if (!t) return {};
  const title = `${shortTerm(t)}: meaning on Solana`;
  return {
    title,
    description: t.definition.slice(0, 160),
    alternates: { canonical: termPath(t.id) },
    openGraph: {
      title: `${t.term}: Solana glossary`,
      description: t.definition,
      url: termPath(t.id),
      images: [{ url: ogImageUrl(question(t), 'Solana glossary'), width: 1200, height: 630 }],
    },
  };
}

type CtaLink = { href: string; label: string; text: string };

const SECURITY_TERMS = new Set(['audit', 'bug-bounty', 'cpi', 'pda', 'discriminator', 'upgrade-authority', 'verifiable-build', 'multisig', 'native-rust', 'account', 'program']);
const TOKEN_TERMS = new Set(['mint-authority', 'freeze-authority', 'spl-token', 'token-2022']);

function ctaFor(id: string): CtaLink {
  if (SECURITY_TERMS.has(id)) {
    return {
      href: '/tools/solana-audit-cost-calculator',
      label: 'Estimate your audit cost →',
      text: 'Get an indicative price range and timeline for auditing your Solana programs, then compare verified auditors.',
    };
  }
  if (TOKEN_TERMS.has(id)) {
    return {
      href: '/blog/solana-token-launch-checklist',
      label: 'Read the token launch checklist →',
      text: 'Authorities, metadata, liquidity and announcements: everything to check before a Solana token goes live.',
    };
  }
  if (id === 'kol') {
    return {
      href: '/solana-marketing-growth-agencies',
      label: 'See verified marketing agencies →',
      text: 'Compare verified Solana marketing and growth agencies, with what to ask before you sign.',
    };
  }
  return {
    href: '/smart-match',
    label: 'Get matched →',
    text: 'Describe your project in plain English. Smart Match suggests verified Solana providers with a reason for each match. Free for teams.',
  };
}

/** Guides linked from this term and its related terms, deduplicated. */
function guidesFor(t: GlossaryTerm, related: GlossaryTerm[]) {
  const seen = new Set<string>();
  const out: { href: string; title: string; description?: string }[] = [];
  for (const term of [t, ...related]) {
    if (!term.link || seen.has(term.link.href)) continue;
    seen.add(term.link.href);
    const post = POSTS.find((p) => `/blog/${p.slug}` === term.link?.href);
    out.push({ href: term.link.href, title: post?.title ?? term.link.label, description: post?.description });
  }
  return out.slice(0, 3);
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTerm(id);
  const detail = GLOSSARY_DETAILS[id];
  if (!t || !detail) notFound();

  const related = detail.related.map(getTerm).filter((r): r is GlossaryTerm => Boolean(r));
  const guides = guidesFor(t, related);
  const cta = ctaFor(t.id);
  const url = `${SITE_URL}${termPath(t.id)}`;
  const setUrl = `${SITE_URL}/solana-glossary`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        name: t.term,
        description: t.definition,
        url,
        inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${setUrl}#set`, name: 'Solana glossary', url: setUrl },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: question(t), acceptedAnswer: { '@type': 'Answer', text: t.definition } },
          { '@type': 'Question', name: `Why does ${shortTerm(t)} matter for Solana teams?`, acceptedAnswer: { '@type': 'Answer', text: detail.why } },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Solana glossary', item: setUrl },
          { '@type': 'ListItem', position: 3, name: t.term, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <article className="mx-auto max-w-2xl px-6 pb-20 pt-12">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> /{' '}
          <Link href="/solana-glossary" className="text-blue-deep">Solana glossary</Link> / {shortTerm(t)}
        </p>
        <div className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-soft">Solana glossary</div>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[34px]">{t.term}</h1>

        <div className="mt-6 rounded-2xl border border-line bg-bg-soft p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">Definition</div>
          <p className="mt-2 text-[17px] leading-relaxed text-ink">{t.definition}</p>
        </div>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">Why it matters</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/90">{detail.why}</p>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">What to check</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
          {detail.check.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        {related.length > 0 && (
          <>
            <h2 className="mt-10 font-heading text-[22px] font-semibold">Related terms</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={termPath(r.id)} className="block h-full rounded-2xl border border-line p-4 hover:border-blue-deep">
                    <span className="font-semibold">{r.term}</span>
                    <span className="mt-1 block text-sm text-gray">{firstSentence(r.definition)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {guides.length > 0 && (
          <>
            <h2 className="mt-10 font-heading text-[22px] font-semibold">Guides</h2>
            <ul className="mt-3 space-y-3">
              {guides.map((g) => (
                <li key={g.href}>
                  <Link href={g.href} className="block rounded-2xl border border-line p-5 hover:border-blue-deep">
                    <span className="font-semibold">{g.title}</span>
                    {g.description && <span className="mt-1 block text-sm text-gray">{g.description}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 rounded-2xl bg-ink p-7 text-white">
          <p className="text-sm text-white/75">{cta.text}</p>
          <Link href={cta.href} className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink">
            {cta.label}
          </Link>
        </div>

        <p className="mt-10 text-sm">
          <Link href="/solana-glossary" className="text-blue-deep">← All Solana terms</Link>
        </p>
      </article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
    </>
  );
}
