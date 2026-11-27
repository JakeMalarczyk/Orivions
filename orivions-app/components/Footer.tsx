import Link from 'next/link';
import Logo from './Logo';

// Sitewide guide. Narrow and quiet, but it keeps categories, tools and the
// best guides one click from every page.
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { href: '/solana-audit-quotes', label: 'Small audit quotes' },
      { href: '/solana-audit-fixes', label: 'Audit fixes and multisig' },
      { href: '/solana-dapp-development-quotes', label: 'dApp development quotes' },
      { href: '/solana-rpc-provider-match', label: 'RPC provider match' },
      { href: '/crypto-market-maker-offers', label: 'Market maker offers' },
      { href: '/token-launch-legal-review', label: 'Token launch legal review' },
      { href: '/token-launch-package', label: 'Token launch package' },
    ],
  },
  {
    title: 'Find',
    links: [
      { href: '/smart-match', label: 'Smart Match' },
      { href: '/solana-smart-contract-audits', label: 'Audits' },
      { href: '/solana-development-companies', label: 'Development' },
      { href: '/solana-marketing-growth-agencies', label: 'Marketing' },
      { href: '/solana-legal-compliance-firms', label: 'Legal' },
      { href: '/solana-infrastructure-providers', label: 'Infrastructure' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/tools/solana-audit-cost-calculator', label: 'Audit cost calculator' },
      { href: '/tools/solana-audit-readiness-check', label: 'Audit readiness check' },
      { href: '/tools/solana-audit-timeline-planner', label: 'Audit timeline planner' },
      { href: '/tools/solana-dapp-cost-calculator', label: 'dApp cost calculator' },
      { href: '/tools/solana-program-check', label: 'Upgrade authority check' },
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
      { href: '/newsletter', label: 'Newsletter' },
      { href: '/contact', label: 'Contact' },
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-8">
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-blue-light/60 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-8 py-12 lg:flex-row lg:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="font-heading text-lg font-medium tracking-tight">Orivions</span>
          </Link>
          <p className="mt-3 text-xs text-gray-soft">© 2026 Orivions</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-8 text-[13px] sm:grid-cols-3 lg:grid-cols-5">
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
