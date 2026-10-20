import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Smart Contract Audits: Verified Auditors',
  description:
    'Find and compare verified Solana smart contract auditors. See what to look for, typical pricing, and browse vetted security firms, free to search and contact.',
  alternates: { canonical: '/solana-smart-contract-audits' },
};

const content: CategoryContent = {
  path: '/solana-smart-contract-audits',
  guideTags: ['Audits', 'Security'],
  breadcrumbLabel: 'Solana Smart Contract Audits',
  h1: 'Solana Smart Contract Audits',
  lede: 'Verified auditors for Solana programs, from small Anchor-based projects to large-scale DeFi protocols. Compare providers, see indicative pricing, and contact them directly. Free to search.',
  ctaPrimary: 'Describe your audit needs (AI match)',
  sections: [
    {
      heading: 'Why get a smart contract audit before launching on Solana?',
      body: 'Solana programs that handle user funds, token logic, or protocol governance carry real financial risk if they contain vulnerabilities. Unlike a typical web application, a bug in a deployed smart contract often cannot be quietly patched; it can mean an irreversible loss of funds. An independent audit catches logic errors, access-control issues, and Solana-specific pitfalls (account validation, PDA derivation, integer overflow) before they reach mainnet.',
    },
    {
      heading: 'What to look for in a Solana auditor',
      bullets: [
        ['Solana-specific experience', 'auditing Anchor or native Rust programs is meaningfully different from auditing EVM Solidity contracts.'],
        ['Clear methodology', 'manual code review combined with automated tooling, not just a linter pass.'],
        ['Realistic turnaround', 'be wary of anyone promising a full review of a complex protocol in 24 hours.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed reasonable checks, though always review their portfolio directly.'],
      ],
    },
    {
      heading: 'Typical audit pricing',
      body: 'Pricing depends heavily on codebase size and complexity. Small, single-purpose programs often start in the low thousands of dollars, while larger DeFi protocols with multiple interacting programs can run into the tens of thousands.',
      linkToInsights: true,
      link: { text: 'For a range based on your own code size and complexity, use the free', href: '/tools/solana-audit-cost-calculator', label: 'Solana audit cost calculator' },
    },
  ],
  providersHeading: 'Verified Security & Audit providers',
  category: 'Security & Audits',
  faqs: [
    {
      q: 'How much does a Solana smart contract audit cost?',
      a: 'Pricing varies with scope and codebase size, but indicative ranges typically run from a few thousand dollars for small programs to tens of thousands for larger, higher-stakes protocols.',
    },
    {
      q: 'How long does an audit take?',
      a: 'Typical turnaround is 1-3 weeks depending on codebase complexity, though some providers offer expedited reviews for smaller programs in 48-72 hours.',
    },
  ],
  ctaBoxTitle: 'Not sure which auditor fits your project?',
  ctaBoxText: 'Describe your protocol and timeline, and AI matches you with the right verified auditors in seconds.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
