import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Poppins, Inter } from 'next/font/google';
import Script from 'next/script';
import Footer from '@/components/Footer';
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Orivions: Business Infrastructure Layer for Solana',
    template: '%s | Orivions',
  },
  description:
    'The verified B2B marketplace for the Solana ecosystem. Discover, verify, and hire trusted providers.',
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
      url: `${siteUrl}/`,
      logo: `${siteUrl}/logo.png`,
      description:
        'Verified B2B marketplace for the Solana ecosystem: AI matching with human-verified service providers (auditors, developers, marketing agencies). Free for clients; providers pay a flat 10% success fee on completed engagements.',
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
