import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import NewsletterForm from '@/components/NewsletterForm';
import { ogImageUrl } from '@/lib/blog';

const DESCRIPTION =
  'The Orivions newsletter: new verified providers, audit and launch guides, and what teams actually pay on Solana. Short, no paid placements.';

export const metadata: Metadata = {
  title: 'Orivions newsletter',
  description: DESCRIPTION,
  alternates: { canonical: '/newsletter' },
  openGraph: {
    type: 'website',
    title: 'Orivions newsletter',
    description: DESCRIPTION,
    url: '/newsletter',
    images: [{ url: ogImageUrl('Verified providers and onchain launch guides', 'Orivions newsletter'), width: 1200, height: 630 }],
  },
};

export default function NewsletterPage() {
  return (
    <>
      <Header />
      <PageHero
        narrow
        eyebrow="Newsletter"
        title="New verified providers and launch guides, by email."
        lede="A short note when something useful ships. No paid placements, no spam."
      />
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">
        <NewsletterForm />
        <section className="mt-12">
          <h2 className="font-heading text-[24px] font-semibold tracking-tight">What you get</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
            <li>New providers that passed our four human checks, and what they are good at.</li>
            <li>Guides and calculators for audits, launches and hiring, with real price ranges.</li>
            <li>Updates on Founding Providers and on what we announce at Breakpoint.</li>
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/90">
            Not ready to subscribe? <Link href="/blog" className="text-blue-deep">Read the guides</Link> or{' '}
            <Link href="/smart-match" className="text-blue-deep">describe what you need</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
