import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding from '@/components/ServiceLanding';
import { ogImageUrl } from '@/lib/blog';

// Client offer: compare crypto market maker offers on the same terms before signing.

const PATH = '/crypto-market-maker-offers';
const TITLE = 'Compare crypto market maker offers before you sign';
const DESCRIPTION =
  'Launching a token? Send your launch plan once and compare market maker offers on the same terms: deal model, spread, depth, uptime, reporting and the end of the loan. Free for teams.';

export const metadata: Metadata = {
  title: 'Compare Crypto Market Maker Offers Before You Sign',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Compare market maker offers before you sign', 'For token teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('Compare market maker offers before you sign', 'For token teams')] },
};

export default function MarketMakerOffersPage() {
  return (
    <ServiceLanding
      path={PATH}
      title={TITLE}
      description={DESCRIPTION}
      serviceType='Market maker selection'
      breadcrumbName='Market maker offers'
      eyebrow='For teams launching a token'
      lede='Market maker offers are hard to compare: one is a token loan with options, another a retainer, each with different venues and commitments. Send your launch plan once and we help you get offers on the same terms, so you can see what each one really costs. Free for teams, no obligation.'
      steps={[
        { title: 'Send your launch plan', text: 'Token, chain, venues and pairs, launch date, and whether you prefer a loan with options or a retainer.' },
        { title: 'We brief firms on one sheet', text: 'A person at Orivions asks market makers we have checked for offers against the same list: venues, spread, depth, uptime, reporting, end of loan.' },
        { title: 'Compare and decide', text: 'You see the offers side by side and talk to the firms directly. You choose, or walk away.' },
      ]}
      form={{
        source: 'market-maker-offers',
        title: 'Request market maker offers',
        text: 'Tell us about the token and the launch. A person at Orivions replies by email with next steps and the firms we would ask.',
        examples: [
          { label: 'Token launch on Solana', text: 'We launch our token on Solana in about six weeks, on two DEX pools and one centralized exchange. We want a retainer model and weekly reports we can check. Website: ' },
          { label: 'Compare two offers', text: 'We already have two market maker offers, one loan with call options and one retainer, and want to know what to ask before signing. Launch in a month.' },
          { label: 'After listing', text: 'Our token is listed but spreads are wide and depth is thin. We want offers with clear spread, depth and uptime commitments per venue.' },
        ],
      }}
      sendTitle='What to send for comparable offers'
      send={[
        'Token, chain and the venues and pairs you want covered',
        'Launch or listing date',
        'Preferred deal model: token loan with options, retainer, or open',
        'Size of the token loan or inventory you can provide, if you know it',
        'What you need in reports and whether you want read-only access to the accounts',
      ]}
      related={
        <>
          Before any call, read{' '}
          <Link href='/blog/how-to-evaluate-a-crypto-market-maker' className='text-blue-deep'>how to evaluate a crypto market maker</Link>
          : the questions to ask, the commitments to put in the contract and the red flags to walk away from. Launching a token on Solana? See the{' '}
          <Link href='/blog/solana-token-launch-checklist' className='text-blue-deep'>Solana token launch checklist</Link>.
        </>
      }
      faqs={[
        { q: 'Why compare market maker offers on the same terms?', a: 'Offers mix different models: a token loan with call options, a retainer, or a hybrid. Without the same venues, spread, depth, uptime and reporting in each, the cheapest-looking offer can be the most expensive one.' },
        { q: 'Is it free?', a: 'Yes, for your team. You never pay Orivions. You agree terms directly with the market maker you choose.' },
        { q: 'Do you guarantee price, volume or a listing?', a: 'No, and neither should a market maker. Anyone selling volume is selling wash trading. A good offer commits to spreads, depth and uptime you can check.' },
        { q: 'Is this financial or legal advice?', a: 'No. We help you get comparable offers and ask the right questions. Have your lawyer review the contract before you sign.' },
      ]}
    />
  );
}
