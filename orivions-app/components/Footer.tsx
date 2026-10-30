import Link from 'next/link';
import Logo from './Logo';

// Sitewide guide. Narrow and quiet, but it keeps categories, tools and the
// best guides one click from every page.
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Find',
    links: [
      { href: '/providers', label: 'Providers' },
      { href: '/smart-match', label: 'Smart Match' },
      { href: '/solana-smart-contract-audits', label: 'Audits' },
      { href: '/solana-development-companies', label: 'Development' },
      { href: '/solana-marketing-growth-agencies', label: 'Marketing' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/tools/solana-audit-cost-calculator', label: 'Audit cost calculator' },
      { href: '/tools/solana-dapp-cost-calculator', label: 'dApp cost calculator' },
      { href: '/ai-proposal-generator', label: 'Proposal generator' },
      { href: '/insights', label: 'Market insights' },
      { href: '/solana-glossary', label: 'Glossary' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { href: '/blog/how-to-choose-a-solana-smart-contract-auditor', label: 'Choose an auditor' },
      { href: '/blog/how-to-hire-a-solana-development-company', label: 'Hire a dev team' },
      { href: '/blog/how-long-does-a-solana-audit-take', label: 'How long an audit takes' },
      { href: '/blog/solana-smart-contract-audit-cost', label: 'What an audit costs' },
      { href: '/blog', label: 'All guides' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/how-we-verify', label: 'How we verify' },
      { href: '/founding-providers', label: 'Founding Providers' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-8">
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-blue-light/60 to-transparent" />
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-8 py-12 lg:flex-row lg:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="font-heading text-lg font-medium tracking-tight">Orivions</span>
          </Link>
          <p className="mt-3 text-xs text-gray-soft">© 2026 Orivions</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-8 text-[13px] sm:grid-cols-4">
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
