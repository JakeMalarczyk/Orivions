import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import LegalDocument from '@/components/LegalDocument';
import { REGULAMIN_PL } from '@/lib/legalContent';

export const metadata: Metadata = {
  title: 'Regulamin',
  description: 'Regulamin platformy Orivions: konta, weryfikacja Dostawców, opłata success fee 10%, odpowiedzialność i spory.',
  alternates: { canonical: '/regulamin' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Header />
      <PageHero narrow eyebrow="Prawne" title="Regulamin" />
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-6">
        <LegalDocument source={REGULAMIN_PL} />
        <p className="mt-12 text-sm text-gray">
          <Link href="/contact" className="text-blue-deep">Pytania? Napisz do nas</Link>
        </p>
      </div>
    </>
  );
}
