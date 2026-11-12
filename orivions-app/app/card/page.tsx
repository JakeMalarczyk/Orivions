import type { Metadata } from 'next';
import { BOOKING_URL, CONTACT_EMAIL } from '@/lib/contact';
import { HERO_GLOW, HeroBackdrop } from '@/components/PageHero';

// Digital business card, opened from the QR code on printed cards and the one-pager.
// Not indexed: it exists for people who already met us.
export const metadata: Metadata = {
  title: 'Kuba Malarczyk, Orivions',
  description: 'Kuba Malarczyk, founder of Orivions. Save the contact, send a brief or book a call.',
  robots: { index: false, follow: false },
};

const LINKS: { label: string; hint: string; href: string; external?: boolean }[] = [
  { label: 'Describe your project', hint: 'Get a hand-picked shortlist of providers. Free for teams.', href: '/smart-match?ref=bp-card' },
  { label: 'Apply as a Founding Provider', hint: 'Free profile, a verified badge after a short check.', href: '/founding-providers?ref=bp-card' },
  { label: 'Book a 20-minute call', hint: 'Pick a time that suits you.', href: BOOKING_URL, external: true },
  { label: 'Follow @Orivions on X', hint: 'Building in public.', href: 'https://x.com/Orivions', external: true },
];

export default function CardPage() {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-ink px-6 py-12 text-white ${HERO_GLOW}`}>
      <HeroBackdrop />
      <div className="relative mx-auto max-w-md">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-light">Orivions</div>
        <h1 className="mt-3 font-heading text-[34px] font-medium leading-tight tracking-tight">Kuba Malarczyk</h1>
        <p className="mt-1 text-white/70">Founder, Orivions</p>
        <p className="mt-5 text-[15px] leading-relaxed text-white/70">
          A free marketplace where Solana teams find auditors, developers, legal and marketing providers that a person has
          checked first. Good to meet you at Breakpoint.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <a
            href="/kuba-malarczyk.vcf"
            download
            className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-semibold text-ink shadow-[0_8px_30px_-12px_rgb(var(--c-blue-light)/0.6)]"
          >
            Save my contact
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-lg border border-white/25 px-6 py-3.5 text-center text-sm font-semibold text-white"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block py-4"
              >
                <span className="block text-[15px] font-semibold">{l.label} →</span>
                <span className="mt-0.5 block text-sm text-white/60">{l.hint}</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-white/40">orivions.com</p>
      </div>
    </main>
  );
}
