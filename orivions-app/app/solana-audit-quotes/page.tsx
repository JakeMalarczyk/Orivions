import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import ConciergeForm from '@/components/ConciergeForm';
import { SITE_URL, ogImageUrl } from '@/lib/blog';

// Client offer: send one scope, get up to three comparable audit quotes.
// Requests go through the concierge form (source "audit-quotes"), so they land
// in the admin inbox and the Telegram alert like every other request.

const PATH = '/solana-audit-quotes';
const TITLE = 'Get up to 3 Solana audit quotes in 72 hours';
const DESCRIPTION =
  'Send your scope once. We pass the same brief to up to three verified audit firms that fit your code and dates, and you get comparable quotes. Free for teams.';

export const metadata: Metadata = {
  title: 'Solana audit quotes: up to 3 in 72 hours (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Up to 3 Solana audit quotes in 72 hours', 'For teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('Up to 3 Solana audit quotes in 72 hours', 'For teams')] },
};

const STEPS = [
  {
    title: 'Send your scope once',
    text: 'Repo or a short description, rough code size, Anchor or native Rust, and the date you want to launch. Five minutes.',
  },
  {
    title: 'We brief up to three firms',
    text: 'A person at Orivions picks audit firms we have reviewed that fit your code and dates, and sends each of them the same brief.',
  },
  {
    title: 'Compare and decide',
    text: 'Quotes come back on the same scope, so price, engineer-days, start date and fix review can be compared line by line. You choose, or walk away.',
  },
];

const SEND = [
  'Link to the repo or the programs in scope, and the commit you want reviewed if you have one',
  'Approximate lines of Rust in scope and the number of programs',
  'Anchor or native Rust, and any external protocols or oracles you call',
  'Your target launch date and the latest date the audit can start',
  'Budget range, if you have one (optional)',
];

const EXAMPLES = [
  {
    label: 'Anchor program, pre-mainnet',
    text: 'Anchor staking program, about 1,500 lines of Rust, one program, no external protocols. Code freeze in two weeks, mainnet planned in about six weeks. Repo: ',
  },
  {
    label: 'DeFi protocol with an oracle',
    text: 'Lending protocol on Solana, two Anchor programs, about 3,000 lines, uses an oracle and one external DEX. Want the audit to start within a month, fix review included. Repo: ',
  },
  {
    label: 'Re-audit after changes',
    text: 'Our program was audited before. We changed about 400 lines since the last report and need a review of the diff before the upgrade. Repo and old report: ',
  },
];

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes, for your team. You never pay Orivions. You agree price and terms directly with the audit firm you choose.',
  },
  {
    q: 'What does 72 hours mean?',
    a: 'We aim to get quotes back to you within 72 hours on business days after we have your scope. If a firm needs a call or more detail first, or cannot take the work in your window, we tell you that within the same time.',
  },
  {
    q: 'Which firms receive my brief?',
    a: 'Only audit firms that Orivions has reviewed: named people, public reports and Solana work you can check. We tell you which firms we contacted.',
  },
  {
    q: 'Do I have to pick one of the quotes?',
    a: 'No. There is no obligation. Many teams use the quotes to set a budget and a start date, and book later.',
  },
  {
    q: 'Is my code shared?',
    a: 'Only what you choose to share. A private repo stays private: firms usually quote from the size and description, and you give access to the firm you pick.',
  },
];

export default function AuditQuotesPage() {
  const url = `${SITE_URL}${PATH}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: TITLE,
        description: DESCRIPTION,
        url,
        serviceType: 'Smart contract audit sourcing',
        areaServed: 'Worldwide',
        provider: { '@id': `${SITE_URL}/#organization` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      { '@type': 'FAQPage', mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Solana audit quotes', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        eyebrow="For Solana teams"
        title={TITLE}
        lede="Send your scope once. We pass the same brief to up to three verified audit firms that fit your code and your dates, and you get quotes you can actually compare. Free for teams, no obligation."
      />
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-line p-5">
              <div className="text-xs font-semibold uppercase text-gray-soft">Step {i + 1}</div>
              <h2 className="mt-1 font-heading text-lg font-semibold">{s.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl" id="request">
          <ConciergeForm
            need=""
            source="audit-quotes"
            examples={EXAMPLES}
            title="Request audit quotes"
            text="Tell us what is in scope and when you want to launch. A person at Orivions replies by email, and quotes follow within 72 hours on business days."
          />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">What to send for an accurate quote</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink/90">
            {SEND.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            Not ready yet? Check the likely price with the{' '}
            <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>
            , the latest date to book with the{' '}
            <Link href="/tools/solana-audit-timeline-planner" className="text-blue-deep">audit timeline planner</Link>
            {' '}and what to prepare with the{' '}
            <Link href="/blog/solana-audit-readiness-checklist" className="text-blue-deep">audit readiness checklist</Link>.
          </p>

          <h2 className="mt-12 font-heading text-[22px] font-semibold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map(({ q, a }) => (
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
