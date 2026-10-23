import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { CALENDLY_URL, CONTACT_EMAIL } from '@/lib/contact';

const DESCRIPTION =
  'Contact Orivions: email Kuba Malarczyk, the founder, or book a call to talk about hiring verified auditors, developers and agencies, or about listing your company.';

export const metadata: Metadata = {
  title: 'Contact Orivions',
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    title: 'Contact Orivions',
    description: DESCRIPTION,
    url: '/contact',
    images: [{ url: ogImageUrl('Talk to the founder', 'Contact Orivions'), width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  const url = `${SITE_URL}/contact`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${url}#page`,
        url,
        name: 'Contact Orivions',
        description: DESCRIPTION,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-12 pt-12">
        <p className="text-xs text-gray-soft">
          <Link href="/" className="text-blue-deep">Orivions</Link> / Contact
        </p>

        <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-[42px]">
          Contact Orivions
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray">
          Questions about hiring through Orivions, listing your company or verification go straight to
          Kuba Malarczyk, the founder.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">Email</div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 block font-semibold hover:text-blue-deep">
              {CONTACT_EMAIL}
            </a>
            <p className="mt-1.5 text-sm text-gray">For teams, providers, partners and press.</p>
          </div>
          <div className="rounded-2xl border border-line p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">Looking for a provider?</div>
            <Link href="/smart-match" className="mt-2 block font-semibold hover:text-blue-deep">
              Describe what you need
            </Link>
            <p className="mt-1.5 text-sm text-gray">Smart Match suggests up to three verified providers. Free for teams.</p>
          </div>
        </div>

        {CALENDLY_URL ? (
          <section className="mt-12">
            <h2 className="font-heading text-[24px] font-semibold tracking-tight">Book a call</h2>
            <p className="mt-2 text-gray">Pick a time that suits you for a short call with Kuba.</p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-line">
              <iframe
                src={`${CALENDLY_URL}?hide_gdpr_banner=1`}
                title="Book a call with Orivions"
                className="h-[700px] w-full"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-xs text-gray-soft">
              Calendar not loading?{' '}
              <a href={CALENDLY_URL} target="_blank" rel="noopener" className="text-blue-deep">
                Open it on Calendly
              </a>
              .
            </p>
          </section>
        ) : null}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
