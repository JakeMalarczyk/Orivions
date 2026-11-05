import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import LegalDocument from '@/components/LegalDocument';
import { PRIVACY_EN } from '@/lib/legalContent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Orivions processes personal data: what we collect, why, who we share it with, how long we keep it and your rights.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Header />
      <PageHero narrow eyebrow="Legal" title="Privacy Policy" />
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-6">
        <LegalDocument source={PRIVACY_EN} />
        <p className="mt-12 text-sm text-gray">
          <Link href="/contact" className="text-blue-deep">Questions? Contact us</Link>
        </p>
      </div>
    </>
  );
}
