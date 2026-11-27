import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding from '@/components/ServiceLanding';
import { ogImageUrl } from '@/lib/blog';

// Client offer: match a team launching a token with a verified crypto lawyer.
// General information only, not legal advice.

const PATH = '/token-launch-legal-review';
const TITLE = 'Token launch legal review: get matched with a crypto lawyer';
const DESCRIPTION =
  'Launching a token? Get matched with verified crypto lawyers for token structure, terms, white paper and EU rules. Free for teams. Not legal advice.';

export const metadata: Metadata = {
  title: 'Token Launch Legal Review: Find a Crypto Lawyer',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Token launch legal review', 'For token teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('Token launch legal review', 'For token teams')] },
};

export default function TokenLegalReviewPage() {
  return (
    <ServiceLanding
      path={PATH}
      title={TITLE}
      description={DESCRIPTION}
      serviceType='Legal services sourcing'
      breadcrumbName='Token launch legal review'
      eyebrow='For teams launching a token'
      lede='A token launch raises legal questions that are expensive to fix later: what the token is, who can buy it, where your company sits and what you must publish. Send your launch plan once and we match you with verified crypto lawyers who fit your jurisdiction and timeline. Free for teams, no obligation. Not legal advice.'
      steps={[
        { title: 'Send your launch plan', text: 'Token purpose, chain, where the team and company are, who can buy and when.' },
        { title: 'We match lawyers', text: 'A person at Orivions picks verified crypto lawyers who fit your jurisdiction and dates, and introduces you by email.' },
        { title: 'Scope and price with the lawyer', text: 'You agree the work directly. Typical scope: token classification, terms, entity and white paper.' },
      ]}
      form={{
        source: 'token-legal-review',
        title: 'Request a crypto lawyer',
        text: 'Tell us about the token and the launch. A person at Orivions replies by email with lawyers who fit. Not legal advice.',
        examples: [
          { label: 'EU token launch', text: 'We are an EU team launching a utility token on Solana in about two months, with a public sale. We need to know what we must publish and who can buy. Website: ' },
          { label: 'Entity and terms', text: 'We have a DAO and a treasury but no legal entity. Before our token launch we need a structure and user terms. Team in Poland and Portugal.' },
          { label: 'Opinion before listing', text: 'An exchange asked for a legal opinion on our token before listing. The launch is done, listing in six weeks.' },
        ],
      }}
      sendTitle='What to send'
      send={[
        'Token purpose and how it is used in the product',
        'Chain, launch date and how the token is distributed (sale, airdrop, liquidity)',
        'Where the team, the company and most buyers are',
        'Whether you already have an entity, terms or a white paper draft',
        'Any exchange or partner asking for a legal opinion',
      ]}
      related={
        <>
          Read{' '}
          <Link href='/blog/how-to-choose-a-web3-lawyer-for-a-token-launch' className='text-blue-deep'>how to choose a Web3 lawyer for a token launch</Link>,{' '}
          <Link href='/blog/dao-legal-structure-wrapper-options' className='text-blue-deep'>DAO legal structure options</Link> and the{' '}
          <Link href='/blog/solana-token-launch-checklist' className='text-blue-deep'>Solana token launch checklist</Link>. Planning the whole launch? See the{' '}
          <Link href='/token-launch-package?ref=legal-review' className='text-blue-deep'>token launch package</Link>.
        </>
      }
      faqs={[
        { q: 'Is this legal advice?', a: 'No. We match you with lawyers. Only a lawyer who knows your facts can advise you.' },
        { q: 'Is it free?', a: 'Yes, for your team. You never pay Orivions. You agree scope and fees directly with the lawyer.' },
        { q: 'Do EU rules apply to my token?', a: 'It depends on the token, where you offer it and to whom. If you offer it to people in the EU, ask the lawyer about MiCA early, since publication rules can add weeks to your timeline.' },
        { q: 'How fast can a lawyer start?', a: 'It depends on jurisdiction and scope. We tell you in our first reply who is available before your launch.' },
      ]}
    />
  );
}
