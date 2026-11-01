import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Legal and Compliance Firms for Web3 Teams',
  description:
    'Find legal and compliance firms for Solana and Web3 projects: token launches, MiCA, entity structure, contracts and terms. Checked by a person, free to contact.',
  alternates: { canonical: '/solana-legal-compliance-firms' },
};

const content: CategoryContent = {
  path: '/solana-legal-compliance-firms',
  guideTags: ['Launch'],
  breadcrumbLabel: 'Solana Legal and Compliance Firms',
  h1: 'Solana Legal and Compliance Firms',
  lede: 'Law and compliance firms that work with onchain teams: token launches, entity structure, contracts, terms and regulatory questions. Compare firms, then contact them directly. Free to search.',
  ctaPrimary: 'Describe your project (AI match)',
  sections: [
    {
      heading: 'When does a Web3 project need a lawyer?',
      body: 'Token rules depend on where your team, company and buyers are. A lawyer who works with crypto projects can tell you whether a token or sale could be treated as a regulated product, which countries to restrict, and what your terms and disclosures must say. Do this before you announce a sale date, not after.',
    },
    {
      heading: 'What to look for in a crypto law firm',
      bullets: [
        ['Crypto track record', 'ask which token launches, DAOs or protocols the firm has advised, and whether the same lawyers did the work.'],
        ['Your jurisdictions', 'rules differ for your team, your company and your buyers; check the firm covers each of them or works with local counsel.'],
        ['Clear scope and fees', 'agree what is included, whether the price is fixed or hourly, and what a revision costs.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed our checks, though you should always confirm credentials and references yourself.'],
      ],
    },
    {
      heading: 'Common work for onchain teams',
      bullets: [
        ['Token launch review', 'whether the token or sale could be a regulated product, and what disclosures and restrictions apply.'],
        ['Entity and treasury structure', 'where to incorporate, who holds the IP and how team and treasury tokens are held.'],
        ['Contracts with service providers', 'scope, milestone payments, ownership of code and keys, and what happens if the work stops.'],
        ['Terms and policies', 'terms of use, privacy and risk disclosures for your product.'],
      ],
      link: { text: 'Before you speak to a lawyer, work through the', href: '/blog/solana-token-launch-checklist', label: 'Solana token launch checklist' },
    },
  ],
  providersHeading: 'Verified Legal and Compliance providers',
  category: 'Legal & Compliance',
  faqs: [
    {
      q: 'Does a Solana token need legal review?',
      a: 'Token rules depend on where your team, company and buyers are, so a token or sale may be treated as a regulated product in some places. A lawyer who works with crypto projects can say which countries to restrict and what your terms and disclosures must say. Do this before you announce a sale date.',
    },
    {
      q: 'When should I hire a crypto lawyer?',
      a: 'Before you announce a token sale, sign a large service contract or set up the company that will hold the code and treasury. Early advice on structure is usually cheaper than fixing it after launch.',
    },
    {
      q: 'Is information on Orivions legal advice?',
      a: 'No. Orivions guides and tools are general information. Orivions connects you with firms, and only a qualified lawyer can advise on your situation.',
    },
  ],
  ctaBoxTitle: 'Not sure which firm fits your project?',
  ctaBoxText: 'Describe your project, jurisdictions and timeline, and we match you with legal and compliance firms that fit.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
