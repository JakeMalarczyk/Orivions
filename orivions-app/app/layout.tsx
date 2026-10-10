import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Poppins, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// next/font downloads and self-hosts these at BUILD time, then serves them from
// your own domain with automatic font-display: swap and zero layout shift.
// The old site loaded these from fonts.googleapis.com/fonts.gstatic.com on every
// visit — an extra DNS lookup + round trip before any text could render.
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://orivions.xyz';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Orivions — Business Infrastructure Layer for Solana',
    template: '%s | Orivions',
  },
  description:
    'The verified B2B marketplace for the Solana ecosystem — discover, verify, and hire trusted providers.',
  openGraph: {
    type: 'website',
    siteName: 'Orivions',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-body bg-white text-ink antialiased">
        {children}
        {/* Plausible: no cookies, no consent banner needed, loaded with next/script's
            "afterInteractive" strategy so it never blocks the page from rendering. */}
        <Script
          defer
          data-domain="orivions.xyz"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
