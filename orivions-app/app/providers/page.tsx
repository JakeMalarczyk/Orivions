import type { Metadata } from 'next';
import Header from '@/components/Header';
import { listProviders } from '@/lib/providers';
import Link from 'next/link';
import FaqSection from '@/components/FaqSection';
import ProvidersCatalog from './ProvidersCatalog';

const FAQS = [
  {
    q: 'What is the Orivions provider directory?',
    a: 'A directory of auditors, developers, legal and compliance firms and marketing agencies for onchain teams. A provider is listed as verified only after a person has checked the company, the portfolio and a client reference.',
  },
  {
    q: 'How are providers verified?',
    a: 'Every provider goes through a manual check of company details, public portfolio and one client reference, plus a call. Nobody can pay for a higher position. The full routine is described on the how we verify page.',
  },
  {
    q: 'What does it cost to find a provider on Orivions?',
    a: 'Nothing for teams. Providers pay a 10% success fee only on work that is completed through Orivions.',
  },
  {
    q: 'The directory looks empty. How do I find a provider now?',
    a: 'The directory opens as the founding cohort passes verification. Until then, describe your project to Smart Match and the Orivions team will send a hand-picked shortlist with a reason for each match.',
  },
];

export const metadata: Metadata = {
  title: 'Find Providers',
  description:
    'Browse human-verified auditors, developers and agencies for onchain teams. Free to search and contact.',
  alternates: {
    canonical: '/providers',
  },
};

// Rendered on the server and refreshed every 5 minutes, so crawlers and AI
// agents see the directory in the HTML.
export const revalidate = 300;

export default async function ProvidersPage() {
  const providers = await listProviders();
  return (
    <>
      <Header />
      <ProvidersCatalog providers={providers} />
      <section className="mx-auto max-w-3xl px-8 pb-10 text-[15px] leading-relaxed text-ink/90">
        <h2 className="font-heading text-2xl font-semibold">Find a verified provider for your onchain project</h2>
        <p className="mt-3">
          Orivions lists auditors, developers, legal and compliance firms and marketing agencies that a person has checked
          first. Teams search and contact providers for free. Not sure where to start? Use{' '}
          <Link href="/smart-match" className="text-blue-deep">Smart Match</Link>, read{' '}
          <Link href="/how-we-verify" className="text-blue-deep">how we verify providers</Link>, or browse{' '}
          <Link href="/solana-smart-contract-audits" className="text-blue-deep">Solana auditors</Link>,{' '}
          <Link href="/solana-development-companies" className="text-blue-deep">development companies</Link> and{' '}
          <Link href="/solana-marketing-growth-agencies" className="text-blue-deep">marketing agencies</Link>.
        </p>
      </section>
      <FaqSection title="Provider directory FAQ" faqs={FAQS} />
    </>
  );
}
