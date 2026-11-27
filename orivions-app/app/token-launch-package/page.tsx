import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding from '@/components/ServiceLanding';
import { ogImageUrl } from '@/lib/blog';

// Client offer: one brief for everything a token launch needs, routed to verified providers.

const PATH = '/token-launch-package';
const TITLE = 'Launching a token on Solana? One brief for every provider you need';
const DESCRIPTION =
  'Audit, market maker, legal, tokenomics and launch marketing: send your token launch plan once and get verified providers in the right order. Free.';

export const metadata: Metadata = {
  title: 'Solana Token Launch: Audit, Market Maker, Legal, Marketing',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('One brief for your whole token launch', 'For token teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('One brief for your whole token launch', 'For token teams')] },
};

export default function TokenLaunchPackagePage() {
  return (
    <ServiceLanding
      path={PATH}
      title={TITLE}
      description={DESCRIPTION}
      serviceType='Token launch provider sourcing'
      breadcrumbName='Token launch package'
      eyebrow='For teams launching a token'
      lede='A token launch needs five different providers, and each one depends on the others: the audit sets the date, the lawyer shapes the sale, the market maker needs the token terms. Send your plan once and we match you with verified providers for every part, in the order that keeps your launch date. Free for teams, no obligation.'
      steps={[
        { title: 'Send your launch plan', text: 'Token purpose, chain, launch date, distribution, and which parts you already have covered.' },
        { title: 'We plan the order', text: 'A person at Orivions maps what must happen first and introduces verified providers for each open part.' },
        { title: 'You run the launch', text: 'You agree scope and price directly with each provider. We stay your single point of contact for introductions.' },
      ]}
      form={{
        source: 'token-launch-package',
        title: 'Send your token launch plan',
        text: 'Tell us about the token, the date and what is still open. A person at Orivions replies by email with the order of work and the providers we would introduce.',
        examples: [
          { label: 'Everything open', text: 'We launch a token on Solana in about three months. We have the product but no audit, lawyer, market maker or launch campaign yet. Website: ' },
          { label: 'Audit done, rest open', text: 'Our programs are audited. We still need token terms reviewed, a market maker and a launch campaign. Launch in six weeks.' },
          { label: 'Tokenomics first', text: 'We are early and need help with tokenomics and vesting before we talk to anyone else. Team of five, seed round closed.' },
        ],
      }}
      sendTitle='What a launch usually needs, and in what order'
      send={[
        'Tokenomics and vesting: supply, allocations, unlocks',
        'Legal review: what the token is, who can buy it, terms and entity',
        'Security audit of the token and launch programs, with time for fixes',
        'Market maker: venues, spread and depth commitments, reporting',
        'Launch marketing: community, content and creators, measured on real users',
      ]}
      related={
        <>
          Use the{' '}
          <Link href='/blog/solana-token-launch-checklist' className='text-blue-deep'>Solana token launch checklist</Link>, get{' '}
          <Link href='/solana-audit-quotes?ref=launch-package' className='text-blue-deep'>audit quotes</Link>, compare{' '}
          <Link href='/crypto-market-maker-offers?ref=launch-package' className='text-blue-deep'>market maker offers</Link>, read{' '}
          <Link href='/token-launch-legal-review?ref=launch-package' className='text-blue-deep'>get matched with a crypto lawyer</Link> and{' '}
          <Link href='/blog/how-to-run-a-crypto-kol-campaign' className='text-blue-deep'>how to run a KOL campaign</Link>.
        </>
      }
      faqs={[
        { q: 'Why plan all providers at once?', a: 'They depend on each other. An audit slot can move the launch date, legal advice can change the sale, and market makers need final token terms. Planning the order early avoids paying for rushed work.' },
        { q: 'Is it free?', a: 'Yes, for your team. You never pay Orivions. You agree scope and price directly with each provider.' },
        { q: 'Can I use it for only one part?', a: 'Yes. Tell us what is open and we only introduce providers for those parts.' },
        { q: 'Is this legal or financial advice?', a: 'No. We introduce verified providers. Legal and financial decisions are yours, made with your lawyer and advisers.' },
      ]}
    />
  );
}
