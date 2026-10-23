import Link from 'next/link';
import Logo from './Logo';
import { sortedPosts } from '@/lib/blog';
import { CONTACT_EMAIL } from '@/lib/contact';

// Sitewide footer. Besides navigation it is the main internal-linking hub:
// every page links to the category pages, the newest guides and the glossary,
// which helps crawlers and AI answer engines discover and weigh them.
const PRODUCT = [
  { href: '/smart-match', label: 'Smart Match' },
  { href: '/providers', label: 'Find providers' },
  { href: '/insights', label: 'Market insights' },
  { href: '/tools/solana-audit-cost-calculator', label: 'Audit cost calculator' },
  { href: '/tools/solana-dapp-cost-calculator', label: 'dApp cost calculator' },
  { href: '/ai-proposal-generator', label: 'AI proposal generator' },
];

const CATEGORIES = [
  { href: '/solana-smart-contract-audits', label: 'Solana smart contract audits' },
  { href: '/solana-development-companies', label: 'Solana development companies' },
  { href: '/solana-marketing-growth-agencies', label: 'Solana marketing agencies' },
];

const COMPANY = [
  { href: '/about', label: 'About Orivions' },
  { href: '/how-we-verify', label: 'How we verify' },
  { href: '/founding-providers', label: 'Founding Providers' },
  { href: '/blog', label: 'Blog' },
  { href: '/solana-glossary', label: 'Solana glossary' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Log in' },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-gray-soft">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="text-sm text-gray hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const guides = sortedPosts()
    .filter((p) => p.category === 'Guides')
    .slice(0, 5)
    .map((p) => ({ href: `/blog/${p.slug}`, label: p.title.split(':')[0] ?? p.title }));

  return (
    <footer className="mt-16 border-t border-line bg-bg-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-8 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.4fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="font-heading font-semibold tracking-tight">ORIVIONS</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-gray">
            The verified B2B marketplace for onchain teams. Free for clients; providers pay a 10%
            success fee only on completed work.
          </p>
        </div>
        <Column title="Product" links={PRODUCT} />
        <Column title="Categories" links={CATEGORIES} />
        <Column title="Guides" links={guides} />
        <Column title="Company" links={COMPANY} />
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-8 py-5 text-xs text-gray-soft">
          © {new Date().getFullYear()} Orivions. Built for onchain teams.{' '}
          <a href="https://x.com/Orivions" target="_blank" rel="noopener me" className="hover:text-ink">
            Follow @Orivions on X
          </a>
          {' '}·{' '}
          Write to the Orivions team:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}
