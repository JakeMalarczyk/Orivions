import { ldJson } from '@/lib/jsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import ProgramCheck from './ProgramCheck';

// Free tool: check who can upgrade a Solana program. The check runs on the server
// against public RPC data; everything a crawler needs (method, FAQ) is server-rendered.

const PATH = '/tools/solana-program-check';
const TITLE = 'Solana program upgrade authority checker';
const DESCRIPTION =
  'Free tool: paste a Solana program address and see who can upgrade it: a single key, a multisig-style program authority or nobody (immutable). Public data, no signup.';

export const metadata: Metadata = {
  title: 'Solana Program Upgrade Authority Check (free)',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Who can upgrade your Solana program?', 'Free tool'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl('Who can upgrade your Solana program?', 'Free tool')],
  },
};

const FAQS = [
  {
    q: 'What is the upgrade authority of a Solana program?',
    a: 'It is the account that is allowed to replace the program’s code on mainnet. Whoever controls it can deploy any new version, so it decides how much users have to trust the team.',
  },
  {
    q: 'How do I check who can upgrade a Solana program?',
    a: 'Paste the program address into this checker. It reads the program’s data account from the public chain and shows the upgrade authority and whether it is a single key, a program-controlled address or removed.',
  },
  {
    q: 'Is a single-key upgrade authority a problem?',
    a: 'It is a risk, because one leaked or misused key can replace the program with no delay and no second signer. The usual fix is a multisig, often with a timelock, so changes need several people and are visible before they run.',
  },
  {
    q: 'What does a program-controlled authority mean?',
    a: 'The authority is a program derived address instead of a wallet. Multisig vaults and governance programs use this. The checker cannot tell which one it is or how many signers it needs, so you still have to ask the team.',
  },
  {
    q: 'Is an immutable program always safe?',
    a: 'No. Nobody can change the code, but nobody can fix a bug in it either. It is only as safe as the review the code had before the authority was removed.',
  },
  {
    q: 'Does this check replace an audit?',
    a: 'No. It looks at one setting on the public chain. An audit reviews the code itself, including how it validates accounts and handles funds.',
  },
];

export default function ProgramCheckPage() {
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
        applicationCategory: 'DeveloperApplication',
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
          { '@type': 'ListItem', position: 3, name: 'Program upgrade check', item: url },
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
            <Link href="/tools" className="hover:text-white">Free tools</Link> / Program upgrade check
          </>
        }
        title={TITLE}
        lede="Paste the address of a Solana program and see who can replace its code. It takes a few seconds, reads public mainnet data only and needs no signup."
      />
      <div className="mx-auto max-w-3xl px-8 pb-20 pt-10">
        <ProgramCheck />

        <h2 className="mt-14 font-heading text-[22px] font-semibold">Why the upgrade authority matters</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
          Most Solana programs are deployed as upgradeable, so the team can ship fixes. The price is that the upgrade authority
          can replace the program with any code, including code that drains funds. Teams, investors and auditors look at this
          setting early because it shows how much trust the program asks from its users.
        </p>

        <h2 className="mt-10 font-heading text-[22px] font-semibold">The three results</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
                <th className="px-4 py-3 font-semibold">Result</th>
                <th className="px-4 py-3 font-semibold">What it means</th>
                <th className="px-4 py-3 font-semibold">Usual next step</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="px-4 py-3 font-semibold">Single key</td>
                <td className="px-4 py-3">One wallet can replace the code at any time</td>
                <td className="px-4 py-3">Move to a multisig, add a timelock</td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-4 py-3 font-semibold">Program-controlled</td>
                <td className="px-4 py-3">A multisig vault or governance program holds it</td>
                <td className="px-4 py-3">Ask for the signers, threshold and delay</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Immutable</td>
                <td className="px-4 py-3">Nobody can change the code, including to fix bugs</td>
                <td className="px-4 py-3">Check the code was audited before it was frozen</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
          To fix a single-key setup, read{' '}
          <Link href="/blog/solana-program-upgrade-authority-multisig" className="text-blue-deep">
            how to secure the upgrade authority with a multisig
          </Link>
          . For what to do when something goes wrong on a live program, see the{' '}
          <Link href="/blog/solana-incident-response-plan" className="text-blue-deep">
            incident response plan
          </Link>
          , and for the full list before launch use the{' '}
          <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
            pre-launch security checklist
          </Link>
          . Related terms:{' '}
          <Link href="/solana-glossary/upgrade-authority" className="text-blue-deep">upgrade authority</Link>,{' '}
          <Link href="/solana-glossary/multisig" className="text-blue-deep">multisig</Link> and{' '}
          <Link href="/solana-glossary/timelock" className="text-blue-deep">timelock</Link>.
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
    </>
  );
}
