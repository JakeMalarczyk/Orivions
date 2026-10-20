import Link from 'next/link';
import Logo from './Logo';

// Single source of truth for the main site navigation.
// The site is English-only; all i18n machinery was removed deliberately.
const NAV_LINKS = [
  { href: '/smart-match', label: 'Smart Match' },
  { href: '/providers', label: 'Find providers' },
  { href: '/insights', label: 'Insights' },
  { href: '/blog', label: 'Blog' },
  { href: '/login', label: 'Log in' },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-heading text-lg font-semibold tracking-tight">ORIVIONS</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-gray hover:text-ink">
              {label}
            </Link>
          ))}
          <Link
            href="/founding-providers"
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            List your company
          </Link>
        </div>
      </nav>
    </header>
  );
}
