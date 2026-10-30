import Link from 'next/link';
import Logo from './Logo';

// Small sitewide guide. Kept narrow and quiet on purpose; it also keeps the
// category pages and main sections one click from every page.
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { href: '/solana-smart-contract-audits', label: 'Audits' },
      { href: '/solana-development-companies', label: 'Development' },
      { href: '/solana-marketing-growth-agencies', label: 'Marketing' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { href: '/providers', label: 'Providers' },
      { href: '/smart-match', label: 'Smart Match' },
      { href: '/insights', label: 'Insights' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/how-we-verify', label: 'How we verify' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-8">
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-blue-light/60 to-transparent" />
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-8 py-12 sm:flex-row sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="font-heading text-lg font-medium tracking-tight">Orivions</span>
          </Link>
          <p className="mt-3 text-xs text-gray-soft">© 2026 Orivions</p>
        </div>
        <nav aria-label="Footer" className="flex gap-12 text-[13px]">
          {GROUPS.map(({ title, links }) => (
            <div key={title}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-soft">{title}</div>
              <ul className="mt-3 space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray hover:text-blue-deep">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
