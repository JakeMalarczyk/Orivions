import { ldJson } from '@/lib/jsonLd';

export type Faq = { q: string; a: string };

// Short question-and-answer block with FAQPage structured data. Used on pages that
// would otherwise be thin for search engines and AI answer engines.
export default function FaqSection({ title, faqs }: { title: string; faqs: Faq[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <section className="mx-auto max-w-3xl px-8 pb-20">
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="font-semibold">{f.q}</dt>
            <dd className="mt-1.5 text-[15px] leading-relaxed text-ink/90">{f.a}</dd>
          </div>
        ))}
      </dl>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
    </section>
  );
}
