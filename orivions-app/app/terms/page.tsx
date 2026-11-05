import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import LegalDocument from '@/components/LegalDocument';
import { TERMS_EN } from '@/lib/legalContent';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules for using the Orivions platform: accounts, provider verification, the 10% success fee, liability and disputes.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Header />
      <PageHero narrow eyebrow="Legal" title="Terms of Service" />
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-6">
        <LegalDocument source={TERMS_EN} />
        <p className="mt-12 text-sm text-gray">
          <Link href="/contact" className="text-blue-deep">Questions? Contact us</Link>
        </p>
      </div>
    </>
  );
}
