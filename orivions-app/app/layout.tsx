import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Poppins, Inter } from 'next/font/google';
import Script from 'next/script';
import Footer from '@/components/Footer';
import PageViewTracker from '@/components/PageViewTracker';
import { FOUNDER_JSONLD } from '@/lib/blog';
import './globals.css';

// next/font downloads and self-hosts these at BUILD time, then serves them from
// your own domain with automatic font-display: swap and zero layout shift.
// The old site loaded these from fonts.googleapis.com/fonts.gstatic.com on every
// visit: an extra DNS lookup + round trip before any text could render.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://orivions.com';

// Official profiles. Listed as sameAs on the Organization so search engines and
// AI answer engines connect them to orivions.com as one entity.
const SOCIAL_PROFILES = ['https://x.com/Orivions', 'https://github.com/JakeMalarczyk/Orivions'];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Orivions: Verified B2B Marketplace for Onchain Teams',
    template: '%s | Orivions',
  },
  description:
    'The verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies. Free for clients.',
  applicationName: 'Orivions',
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  alternates: {
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Orivions',
    locale: 'en_US',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Orivions',
    images: ['/og-image.png'],
  },
};

// Site-wide entities. Other pages reference these by @id
// (e.g. a BlogPosting's publisher is { '@id': '…/#organization' }).
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Orivions',
      alternateName: ['Orivions marketplace', 'orivions.com'],
      url: `${siteUrl}/`,
      sameAs: SOCIAL_PROFILES,
      // Square logo, the same mark as the favicon. Google uses it for the brand
      // logo in results and the knowledge panel (min. 112x112).
      logo: {
        '@type': 'ImageObject',
        '@id': `${siteUrl}/#logo`,
        url: `${siteUrl}/logo.png`,
        contentUrl: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        caption: 'Orivions',
      },
      image: { '@id': `${siteUrl}/#logo` },
      founder: FOUNDER_JSONLD,
      description:
        'Orivions is the verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies. Free for clients; providers pay a 10% success fee only on completed work.',
      knowsAbout: [
        'Solana',
        'Solana smart contract audits',
        'Solana program development',
        'Anchor framework',
        'Web3 marketing',
        'B2B service marketplaces',
      ],
      areaServed: 'Worldwide',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: 'Orivions',
      alternateName: ['Orivions marketplace', 'orivions.com'],
      inLanguage: 'en',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-body bg-white text-ink antialiased">
        {children}
        <Footer />
        <PageViewTracker />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {/* Plausible: no cookies, no consent banner needed, loaded with next/script's
            "afterInteractive" strategy so it never blocks the page from rendering. */}
        <Script
          defer
          data-domain="orivions.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
