import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Smart Contract Audit: Cost, Process, Auditors',
  description:
    'Solana smart contract audit guide: what an audit covers, how it works, typical cost and turnaround, and how to choose an auditor. Browse vetted security firms, free to contact.',
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
      body: 'Solana programs that handle user funds, token logic, or protocol governance carry real financial risk if they contain vulnerabilities. Unlike a typical web application, a bug in a deployed smart contract often cannot be quietly patched; it can mean an irreversible loss of funds. An independent audit catches logic errors, access-control issues, and Solana-specific pitfalls (account validation, PDA derivation, signer checks) before they reach mainnet.',
    },
    {
      heading: 'What a Solana audit covers',
      bullets: [
        ['Account and signer validation', 'every account a program reads or writes is checked for owner, type and signer, so an attacker cannot pass in a fake account.'],
        ['PDA seeds and authority', 'how program derived addresses are derived and who can sign for them.'],
        ['Arithmetic and token logic', 'overflow, rounding, decimals and the way balances and fees are calculated.'],
        ['Cross-program invocations', 'what happens when your program calls another and trusts what comes back.'],
        ['Oracles and external data', 'price feeds and other inputs an attacker could manipulate or that can go stale.'],
        ['Upgrade authority and admin keys', 'who can change the program or pause it, and whether that power is protected.'],
      ],
      link: { text: 'To see what the output looks like, read', href: '/blog/how-to-read-a-smart-contract-audit-report', label: 'how to read a smart contract audit report' },
    },
    {
      heading: 'How a Solana audit works',
      bullets: [
        ['Scoping and quote', 'you share the repository, a short spec and a code freeze date; the firm sizes the work and quotes a price and start date.'],
        ['Review', 'manual code review combined with automated tools and, for money-handling code, targeted tests or fuzzing.'],
        ['Report', 'findings are rated by severity with an explanation and a suggested fix for each.'],
        ['Fix review', 'you fix the findings and the firm checks the fixes; confirm a fix review is included in the quote.'],
        ['Final report', 'a final version you can share with users, partners and exchanges.'],
      ],
      link: { text: 'Plan your timeline with', href: '/blog/how-long-does-a-solana-audit-take', label: 'how long a Solana audit takes' },
    },
    {
      heading: 'What to look for in a Solana auditor',
      bullets: [
        ['Solana-specific experience', 'auditing Anchor or native Rust programs is meaningfully different from auditing EVM Solidity contracts.'],
        ['Clear methodology', 'manual code review combined with automated tooling, not just a linter pass.'],
        ['Realistic turnaround', 'be wary of anyone promising a full review of a complex protocol in 24 hours.'],
        ['Public past reports', 'read two or three past reports for depth, and see whether the findings are specific to the code.'],
        ['The team doing the work', 'ask who will review your code, since quality depends on the individual reviewers.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed reasonable checks, though always review their portfolio directly.'],
      ],
      link: { text: 'Compare firms side by side with', href: '/blog/how-to-compare-solana-audit-firms', label: 'how to compare Solana audit firms' },
    },
    {
      heading: 'Typical audit pricing',
      body: 'Pricing depends heavily on codebase size and complexity. Small, single-purpose programs start at around $5,000, while larger DeFi protocols with multiple interacting programs can run into the tens of thousands.',
      linkToInsights: true,
      link: { text: 'For a range based on your own code size and complexity, use the free', href: '/tools/solana-audit-cost-calculator', label: 'Solana audit cost calculator' },
    },
    {
      heading: 'How to prepare so the audit goes faster',
      bullets: [
        ['Freeze the code', 'audit a specific commit; changes during the review cost time and money.'],
        ['Write a short spec', 'describe what each instruction should do and who may call it, so the auditor can spot where the code differs.'],
        ['Add tests', 'a working test suite shows intent and lets the auditor reproduce findings.'],
        ['Document admin powers', 'list every key that can upgrade, pause or move funds.'],
        ['Reserve time to fix', 'plan for a fix review after the first report.'],
      ],
      link: { text: 'Work through the', href: '/blog/solana-audit-readiness-checklist', label: 'Solana audit readiness checklist' },
    },
  ],
  providersHeading: 'Verified Security & Audit providers',
  category: 'Security & Audits',
  faqs: [
    {
      q: 'How much does a Solana smart contract audit cost?',
      a: 'Pricing varies with scope and codebase size, but indicative ranges typically run from around $5,000 for small programs to tens of thousands for larger, higher-stakes protocols.',
    },
    {
      q: 'How long does an audit take?',
      a: 'Typical turnaround is 1-3 weeks depending on codebase complexity, though some providers offer expedited reviews for smaller programs in 48-72 hours. Book early, because good firms often have a queue before they can start.',
    },
    {
      q: 'What does a Solana audit report contain?',
      a: 'A report lists the scope and commit that was reviewed, the findings with a severity rating, an explanation and a recommended fix for each, and the status of each finding after the fix review.',
    },
    {
      q: 'Is an audit the same as a bug bounty?',
      a: 'No. An audit is a time-boxed review by a security firm before launch; a bug bounty rewards outside researchers for finding issues after launch. Most teams that hold user funds use both.',
    },
    {
      q: 'Does an audit guarantee my program is secure?',
      a: 'No. An audit lowers risk but cannot prove the absence of bugs. Keep the code frozen to the audited version, review any later change, and consider a bug bounty after launch.',
    },
    {
      q: 'Do I need a new audit when I change the code?',
      a: 'If the change touches logic that moves funds, permissions or accounts, yes, at least a review of the diff. Small cosmetic changes usually do not need one.',
    },
  ],
  ctaBoxTitle: 'Not sure which auditor fits your project?',
  ctaBoxText: 'Describe your protocol and timeline, and AI matches you with the right verified auditors in seconds.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
