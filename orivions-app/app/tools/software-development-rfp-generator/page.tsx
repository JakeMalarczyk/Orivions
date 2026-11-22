import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import RfpGenerator from '../RfpGenerator';

// Free tool: builds an RFP in the browser. The method, FAQ and links are server-rendered.

const PATH = '/tools/software-development-rfp-generator';
const TITLE = 'Software development RFP generator';
const DESCRIPTION =
  'Free generator: build an RFP for a blockchain or software development project in minutes. Scope, deliverables, milestones, code ownership, timeline and the questions to ask every development firm. No signup.';

export const metadata: Metadata = {
  title: 'Software Development RFP Generator (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Write your development RFP in minutes', 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl('Write your development RFP in minutes', 'Free tool')],
  },
};

const FAQS = [
  {
    q: "What should a software development RFP include?",
    a: "The project and stage, the main features and deliverables, what already exists, technical constraints, the commercial model and budget range, code ownership, the timeline and the questions every firm must answer about team, similar projects, estimate, testing and handover."
  },
  {
    q: "How do I use the software development RFP generator?",
    a: "Fill in the fields on the left. The brief updates on the right as you type. Copy the text or download it as a file, replace anything left in [brackets], and send the same document to every firm."
  },
  {
    q: "Should I put a budget in the RFP?",
    a: "A range helps firms propose something realistic. If you are not sure, leave it as \"Not sure yet\" and the brief asks each firm to propose a range and explain what drives it."
  },
  {
    q: "Who should own the code?",
    a: "Usually the client, and the RFP should say so and ask how handover of the code and deployment keys works. The generator asks the question but does not replace advice from a lawyer on the contract."
  },
  {
    q: "Is anything I enter stored or sent?",
    a: "No. The brief is built in your browser and nothing you type is sent to Orivions or anyone else."
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
          { '@type': 'ListItem', position: 3, name: 'Software development RFP generator', item: url },
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
            <Link href="/tools" className="hover:text-white">Free tools</Link> / Software development RFP generator
          </>
        }
        title={TITLE}
        lede="Describe what you are building, what the team should deliver and how you want to work, and get a ready-to-send brief for development firms. Send the same document to every firm so the proposals can be compared. Free, no signup, nothing leaves your browser."
      />
      <div className="mx-auto max-w-6xl px-8 pb-20 pt-10">
        <RfpGenerator kind="dev" />

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-heading text-[22px] font-semibold">Why a written brief beats a call</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
            Development proposals are hard to compare when each firm heard a different story on a different call. A written RFP gives every firm the same scope, constraints, timeline and commercial terms, and asks the same questions about team, similar work, estimate, testing and handover. Differences in the answers then reflect the firms and not the briefing.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            For the process around it, read <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">how to hire a Solana development company</Link>. For budget, use the <Link href="/tools/solana-dapp-cost-calculator" className="text-blue-deep">dApp cost calculator</Link> and <Link href="/blog/how-much-does-it-cost-to-build-a-solana-dapp" className="text-blue-deep">what it costs to build a Solana dApp</Link>. A shorter one-page version is in the <Link href="/blog/solana-project-brief-template" className="text-blue-deep">project brief template</Link>, and <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">milestone payments</Link> explains the payment terms.
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
