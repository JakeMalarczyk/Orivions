import Link from 'next/link';
import Logo from './Logo';
import MobileMenu from './MobileMenu';

// Single source of truth for the main site navigation.
// The site is English-only; all i18n machinery was removed deliberately.
const NAV_LINKS = [
  { href: '/insights', label: 'Insights' },
  { href: '/blog', label: 'Blog' },
  { href: '/login', label: 'Log in' },
] as const;

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { href: '/tools', label: 'Free tools' },
  { href: '/founding-providers', label: 'Join as a provider' },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8 md:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-heading text-[22px] font-semibold tracking-tight">Orivions</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-gray hover:text-blue-deep">
              {label}
            </Link>
          ))}
          <Link href="/founding-providers" className="text-sm font-medium text-gray hover:text-blue-deep">
            Join as a provider
          </Link>
          <Link
            href="/smart-match"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-blue-deep"
          >
            Get a shortlist
          </Link>
        </div>
        <MobileMenu links={MOBILE_LINKS} />
      </nav>
    </header>
  );
}
