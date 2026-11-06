import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Crypto Lawyer for Solana Projects: How to Choose',
  description:
    'How to choose a crypto lawyer for a Solana project: token launch review, entity structure, contracts and terms, red flags and questions to ask. Browse firms, free to contact. General information, not legal advice.',
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
    {
      heading: 'What to prepare before the first call',
      bullets: [
        ['A one-page description', 'what the product does, who uses it and how money or tokens move.'],
        ['Where people are', 'the countries of your team, your company and your expected buyers or users.'],
        ['Token plan', 'whether you plan a token, a sale or an airdrop, and roughly when.'],
        ['Existing documents', 'any terms, contracts with developers or incorporation papers you already have.'],
        ['Your questions', 'a short list, so the call covers what you actually need to decide.'],
      ],
    },
    {
      heading: 'How an engagement usually runs',
      bullets: [
        ['Scoping call', 'a short conversation to understand the project and decide what the firm can do for you.'],
        ['Written scope and fee', 'the deliverables, the price or hourly rate and what counts as extra work.'],
        ['Review and advice', 'a memo, an opinion or marked-up documents, with open questions listed clearly.'],
        ['Follow-up', 'changes to your documents and answers to questions that come up before launch.'],
      ],
    },
    {
      heading: 'Red flags when choosing a firm',
      bullets: [
        ['Guarantees about regulators', 'no lawyer can promise how an authority will treat a token.'],
        ['No written scope', 'advice without a defined deliverable makes the bill hard to predict.'],
        ['One template for every project', 'documents copied from another launch rarely fit your structure.'],
        ['Only one jurisdiction covered', 'ask who handles the other countries you sell into.'],
        ['Pressure to launch first', 'structure and disclosures are easier to fix before a sale than after.'],
      ],
    },
    {
      heading: 'Questions to ask before you sign',
      bullets: [
        ['Who will do the work?', 'the partner you spoke to, or a junior team.'],
        ['Which similar projects have you advised?', 'and can I speak to one of them.'],
        ['What is included in the fee?', 'revisions, calls and follow-up questions.'],
        ['Which countries do you cover yourselves?', 'and when do you bring in local counsel.'],
        ['How do you handle conflicts of interest?', 'for example if you advise a service provider I plan to hire.'],
      ],
      link: { text: 'For a longer walkthrough, read', href: '/blog/how-to-choose-a-web3-lawyer-for-a-token-launch', label: 'how to choose a Web3 lawyer for a token launch' },
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
    {
      q: 'How much does a crypto lawyer cost?',
      a: 'It depends on scope and on the firm. Some firms quote a fixed fee for defined work such as a token launch review, others bill hourly. Ask for a written scope and an estimate before you start, and ask what counts as extra.',
    },
    {
      q: 'Do I need a company before I launch a token?',
      a: 'Often yes, because someone has to hold the code, the treasury and the contracts. Where and how to set it up depends on your team, your buyers and your plans, so discuss it with a lawyer before you announce a sale.',
    },
    {
      q: 'Does MiCA apply to a Solana token?',
      a: 'MiCA is a European Union regulation, and whether it applies depends on the type of token, who offers it and where. The blockchain you use does not decide this. A lawyer who works with crypto projects can tell you how it applies to your plan.',
    },
    {
      q: 'Can I use a template for my terms of use?',
      a: 'A template is a starting point, but terms should match how your product works and where your users are. Have a lawyer review them before launch, especially if you handle funds or a token.',
    },
  ],
  ctaBoxTitle: 'Not sure which firm fits your project?',
  ctaBoxText: 'Describe your project, jurisdictions and timeline, and we match you with legal and compliance firms that fit.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
