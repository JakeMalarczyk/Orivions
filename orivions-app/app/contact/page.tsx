import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { BOOKING_URL, CONTACT_EMAIL } from '@/lib/contact';

const DESCRIPTION =
  'Contact the Orivions team by email or book a 20-minute call to talk about hiring verified auditors, developers and agencies, or about listing your company.';

export const metadata: Metadata = {
  title: 'Contact Orivions',
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    title: 'Contact Orivions',
    description: DESCRIPTION,
    url: '/contact',
    images: [{ url: ogImageUrl('Talk to the Orivions team', 'Contact Orivions'), width: 1200, height: 630 }],
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
          Questions about hiring through Orivions, listing your company or verification? Write to the
          Orivions team at {CONTACT_EMAIL}.
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

        <section className="mt-12">
          <h2 className="font-heading text-[24px] font-semibold tracking-tight">What to write to us about</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#27272E]">
            <li>Hiring: tell us what you are building and your budget and timeline, and we reply with a hand-picked shortlist.</li>
            <li>Listing your company: ask about verification, Founding Provider status and how profiles work.</li>
            <li>Partnerships and press: ecosystem teams, communities and media are welcome.</li>
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-[#27272E]">
            We usually reply within two business days. Read{' '}
            <Link href="/how-we-verify" className="text-blue-deep">how we verify providers</Link> and{' '}
            <Link href="/about" className="text-blue-deep">about Orivions</Link> for background first.
          </p>
        </section>

        {BOOKING_URL ? (
          <section className="mt-12">
            <h2 className="font-heading text-[24px] font-semibold tracking-tight">Book a call</h2>
            <p className="mt-2 text-gray">Pick a time that suits you for a short call with the Orivions team.</p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Book a 20-minute call
            </a>
          </section>
        ) : null}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
    </>
  );
}
