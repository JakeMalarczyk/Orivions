import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import RfpGenerator from '../RfpGenerator';

// Free tool: builds an RFP in the browser. The method, FAQ and links are server-rendered.

const PATH = '/tools/audit-rfp-generator';
const TITLE = 'Smart contract audit RFP generator';
const DESCRIPTION =
  'Free generator: build a smart contract audit RFP in minutes. Scope and commit, dates, deliverables, fix review and the questions to ask every audit firm. Runs in your browser, no signup.';

export const metadata: Metadata = {
  title: 'Audit RFP Generator (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Write your audit RFP in minutes', 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl('Write your audit RFP in minutes', 'Free tool')],
  },
};

const FAQS = [
  {
    q: "What should an audit RFP include?",
    a: "The project and what it controls, the repository and a frozen commit hash, the programs and framework, what is out of scope, the materials you will provide, your dates, the deliverables including fix review, and the questions every firm must answer."
  },
  {
    q: "How do I use the audit RFP generator?",
    a: "Fill in the fields on the left. The brief updates on the right as you type. Copy the text or download it as a file, replace anything left in [brackets], and send the same document to every firm."
  },
  {
    q: "Is anything I enter stored or sent?",
    a: "No. The brief is built in your browser and nothing you type is sent to Orivions or anyone else."
  },
  {
    q: "Does the generator work for chains other than Solana?",
    a: "The structure works for any smart contract audit. The reviewer questions mention Solana experience by default, so change that line if you build on another chain."
  },
  {
    q: "Should I freeze the code before sending the RFP?",
    a: "Yes. Pick a commit hash first. A moving target is the most common reason a quote changes later."
  }
];

export default function Page() {
  const url = `${SITE_URL}${PATH}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: TITLE,
        description: DESCRIPTION,
        url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any (web browser)',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Free tools', item: `${SITE_URL}/tools` },
          { '@type': 'ListItem', position: 3, name: 'Audit RFP generator', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <PageHero
        eyebrow={
          <>
            <Link href="/tools" className="hover:text-white">Free tools</Link> / Audit RFP generator
          </>
        }
        title={TITLE}
        lede="Fill in the project, scope and dates and get a ready-to-send brief for audit firms. Send the same document to every firm and the quotes become comparable. Free, no signup, and nothing you type leaves your browser."
      />
      <div className="mx-auto max-w-6xl px-8 pb-20 pt-10">
        <RfpGenerator kind="audit" />

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">Why one brief for every firm</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
            Ask five audit firms for a quote and you usually get five different numbers, partly because each firm saw a slightly different description. A single written brief fixes that: the same scope, commit, dates and questions go to everyone, so you can compare engineer-days and deliverables instead of guessing what each quote covers.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            Read the full guide on <Link href="/blog/how-to-write-an-rfp-for-a-smart-contract-audit" className="text-blue-deep">how to write an RFP for a smart contract audit</Link>, estimate the range with the <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>, and compare firms with <Link href="/blog/how-to-compare-solana-audit-firms" className="text-blue-deep">how to compare audit firms</Link>. Before you send it, go through the <Link href="/blog/solana-audit-readiness-checklist" className="text-blue-deep">audit readiness checklist</Link>.
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
