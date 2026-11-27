import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding from '@/components/ServiceLanding';
import { ogImageUrl } from '@/lib/blog';

// Client offer: one brief, up to three comparable quotes from Solana development companies.

const PATH = '/solana-dapp-development-quotes';
const TITLE = 'Get up to 3 quotes from Solana development companies';
const DESCRIPTION =
  'Building a Solana dApp or MVP? Send one brief and get up to 3 comparable quotes from verified Solana development companies. Free for teams.';

export const metadata: Metadata = {
  title: 'Solana dApp Development Quotes from Vetted Companies',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('3 quotes from Solana development companies', 'For teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('3 quotes from Solana development companies', 'For teams')] },
};

export default function DappQuotesPage() {
  return (
    <ServiceLanding
      path={PATH}
      title={TITLE}
      description={DESCRIPTION}
      serviceType='Blockchain software development sourcing'
      breadcrumbName='Solana dApp development quotes'
      eyebrow='For teams building on Solana'
      lede='Quotes from development companies are hard to compare when each one gets a different brief. Send your project once: we pass the same brief to up to three verified Solana development companies that fit your scope, and you get quotes you can compare line by line. Free for teams, no obligation.'
      steps={[
        { title: 'Send one brief', text: 'What you are building, the on-chain parts, frontend and backend, integrations, budget range and target date.' },
        { title: 'We brief up to three teams', text: 'A person at Orivions picks verified Solana development companies that fit the scope and sends each the same brief.' },
        { title: 'Compare and decide', text: 'Compare team, milestones, timeline, price, code ownership and audit plan side by side. You choose, or walk away.' },
      ]}
      form={{
        source: 'dapp-quotes',
        title: 'Request development quotes',
        text: 'Tell us what you want to build and by when. A person at Orivions replies by email with the teams we would ask.',
        examples: [
          { label: 'DeFi MVP', text: 'We want an MVP of a lending protocol on Solana: two Anchor programs, a web app and an indexer. Budget range known, mainnet in about four months. Website: ' },
          { label: 'Consumer app', text: 'Consumer mobile app with a Solana wallet, payments in USDC and a small on-chain program for rewards. Design is ready, need a team for the build. Timeline: 3 months.' },
          { label: 'Take over a codebase', text: 'Our Solana programs and frontend exist, but the original team left. We need a company to take over, fix open issues and prepare for an audit. Repo: ' },
        ],
      }}
      sendTitle='What to send for comparable quotes'
      send={[
        'What the product does and who uses it',
        'On-chain programs you need, Anchor or native Rust, and integrations (DEX, oracle, wallet)',
        'Frontend, backend and indexing needs',
        'Budget range and target launch date',
        'Who will own the code and keys, and whether an audit is planned',
      ]}
      related={
        <>
          Estimate the budget first with the free{' '}
          <Link href='/tools/solana-dapp-cost-calculator' className='text-blue-deep'>Solana dApp cost calculator</Link>, write the brief with the{' '}
          <Link href='/tools/software-development-rfp-generator' className='text-blue-deep'>development RFP generator</Link> and read{' '}
          <Link href='/blog/how-to-hire-a-solana-development-company' className='text-blue-deep'>how to hire a Solana development company</Link>.
        </>
      }
      faqs={[
        { q: 'Why send one brief to several companies?', a: 'Quotes only compare when they answer the same scope. With one brief you see differences in team, milestones and price instead of differences in what each company understood.' },
        { q: 'Is it free?', a: 'Yes, for your team. You never pay Orivions. You agree scope, milestones and price directly with the company you choose.' },
        { q: 'Which companies receive my brief?', a: 'Only Solana development companies Orivions has checked: a real company, named people and work you can verify. We tell you which companies we contacted.' },
        { q: 'Do I have to pick one?', a: 'No. There is no obligation. Many teams use the quotes to set a budget and a timeline before they decide.' },
      ]}
    />
  );
}
