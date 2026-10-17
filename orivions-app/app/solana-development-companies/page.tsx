import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Development Companies: Verified dApp & Smart Contract Developers',
  description:
    'Find verified Solana development companies: smart contract engineers, full-stack dApp builders, and Anchor specialists. Compare portfolios and indicative pricing, free to search and contact.',
  alternates: { canonical: '/solana-development-companies' },
};

const content: CategoryContent = {
  breadcrumbLabel: 'Solana Development Companies',
  h1: 'Solana Development Companies',
  lede: 'Verified development shops for Solana, from smart contract engineering to full-stack dApp builds. Compare portfolios, see indicative pricing, and contact them directly. Free to search.',
  ctaPrimary: 'Describe your project (AI match)',
  sections: [
    {
      heading: 'Why hire a specialized Solana development company?',
      body: "Building on Solana requires genuine expertise with Rust, the Anchor framework, and Solana's account model, meaningfully different from EVM-based development. A team with real Solana experience avoids costly mistakes around account validation, compute budgets, and PDA (Program Derived Address) design that a generalist blockchain shop might not catch.",
    },
    {
      heading: 'What to look for in a Solana dev shop',
      bullets: [
        ['Anchor/Rust track record', 'ask for shipped mainnet programs, not just tutorials or testnet demos.'],
        ['Full-stack capability', 'can they build the frontend/wallet integration too, or just the on-chain program?'],
        ['Realistic scoping', 'be wary of fixed-price quotes for complex protocols without a discovery phase first.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed reasonable checks, though always review their portfolio directly.'],
      ],
    },
    {
      heading: 'Typical development pricing',
      body: 'Pricing depends heavily on scope. Small, single-purpose programs can start in the low thousands of dollars, while full protocol builds with multiple interacting programs and a frontend often run into the tens of thousands.',
      linkToInsights: true,
    },
  ],
  providersHeading: 'Verified Development providers',
  category: 'Development',
  faqs: [
    {
      q: 'How much does it cost to build a Solana dApp?',
      a: 'Pricing varies widely by scope: a simple program might start around $2,000-5,000, while a full protocol with frontend, multiple programs, and integrations can run $20,000 or more. See live indicative pricing on Orivions Market Insights.',
    },
    {
      q: "What's the difference between Anchor and native Rust development?",
      a: 'Anchor is a framework that simplifies Solana program development with less boilerplate and built-in security checks; native Rust gives more control but requires more manual work. Most teams use Anchor unless they have a specific reason not to.',
    },
    {
      q: 'Do I need a separate team for frontend and smart contracts?',
      a: 'Not necessarily. Many verified providers on Orivions offer full-stack development, covering both the on-chain program and the client-facing application.',
    },
  ],
  ctaBoxTitle: 'Not sure which dev shop fits your project?',
  ctaBoxText: 'Describe your project and requirements, and AI matches you with the right verified developers in seconds.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
