import type { ReactNode } from 'react';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import ConciergeForm from '@/components/ConciergeForm';
import { SITE_URL } from '@/lib/blog';
import { ldJson } from '@/lib/jsonLd';

// Shared layout for client offer pages (audit fixes, market maker offers, ...):
// hero, three steps, the concierge form, a "what to send" list, related links and FAQ,
// with Service, FAQPage and BreadcrumbList structured data.

export interface ServiceLandingProps {
  path: string;
  title: string;
  description: string;
  serviceType: string;
  breadcrumbName: string;
  eyebrow: ReactNode;
  lede: string;
  steps: { title: string; text: string }[];
  form: { source: string; title: string; text: string; examples: { label: string; text: string }[] };
  sendTitle: string;
  send: string[];
  related: ReactNode;
  faqs: { q: string; a: string }[];
}

export default function ServiceLanding(p: ServiceLandingProps) {
  const url = `${SITE_URL}${p.path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: p.title,
        description: p.description,
        url,
        serviceType: p.serviceType,
        areaServed: 'Worldwide',
        provider: { '@id': `${SITE_URL}/#organization` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      { '@type': 'FAQPage', mainEntity: p.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: p.breadcrumbName, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {p.steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-line p-5">
              <div className="text-xs font-semibold uppercase text-gray-soft">Step {i + 1}</div>
              <h2 className="mt-1 font-heading text-lg font-semibold">{s.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl" id="request">
          <ConciergeForm need="" source={p.form.source} title={p.form.title} text={p.form.text} examples={p.form.examples} />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">{p.sendTitle}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink/90">
            {p.send.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">{p.related}</p>

          <h2 className="mt-12 font-heading text-[22px] font-semibold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {p.faqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-line p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
    </>
  );
}
