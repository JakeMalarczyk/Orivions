import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Development Company: Services and How to Choose',
  description:
    'How to choose a Solana development company: smart contract, DeFi and dApp development services, red flags, timeline, pricing and questions to ask. Compare vetted Anchor and full-stack teams.',
  alternates: { canonical: '/solana-development-companies' },
};

const content: CategoryContent = {
  path: '/solana-development-companies',
  guideTags: ['Development'],
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
      heading: 'What a Solana development company delivers',
      bullets: [
        ['On-chain programs', 'the Anchor or native Rust programs that hold your logic and funds, with clear account and permission design.'],
        ['Client and wallet integration', 'the frontend, wallet connection, transaction building and error handling your users actually touch.'],
        ['Tests and tooling', 'unit and integration tests, and for money-handling code, fuzzing or invariant checks, so an audit starts from a stable base.'],
        ['Deployment and upgrade setup', 'who holds the upgrade authority, whether it sits behind a multisig, and how future changes are released.'],
        ['Data and RPC setup', 'indexing, RPC choice and rate limits, so the app keeps working when traffic spikes.'],
        ['Handover', 'documentation, repository access and a clear statement that you own the code and keys.'],
      ],
      link: { text: 'Upgrade authority is easy to get wrong; read how to', href: '/blog/solana-program-upgrade-authority-multisig', label: 'put an upgrade authority behind a multisig' },
    },
    {
      heading: 'Solana development services: what companies offer',
      body: 'Solana development companies cover a range of work. Knowing which service you need makes quotes easier to compare.',
      bullets: [
        ['Smart contract development', 'Anchor or native Rust programs for your protocol, tokens or marketplace, with tests and a clear permission model.'],
        ['DeFi app development', 'lending, swaps, vaults and staking products, where money handling and oracle use call for extra review.'],
        ['dApp and wallet integration', 'the web or mobile app, wallet connection, transaction building and the error messages users see.'],
        ['Token and NFT launches', 'mint and token program setup, authorities, metadata and distribution, planned together with legal and security checks.'],
        ['Integrations and data', 'indexers, oracles, payments and RPC setup so the product keeps working under load.'],
        ['Maintenance and upgrades', 'monitoring, program upgrades through a controlled process, and support after launch.'],
      ],
      link: { text: 'If you are not sure which approach to pick, see', href: '/blog/anchor-vs-native-rust-solana', label: 'Anchor vs native Rust for Solana programs' },
    },
    {
      heading: 'What to look for in a Solana dev shop',
      bullets: [
        ['Anchor/Rust track record', 'ask for shipped mainnet programs, not just tutorials or testnet demos.'],
        ['Full-stack capability', 'can they build the frontend/wallet integration too, or just the on-chain program?'],
        ['Realistic scoping', 'be wary of fixed-price quotes for complex protocols without a discovery phase first.'],
        ['Testing culture', 'ask to see a test suite from a past project and how they test edge cases around accounts and signers.'],
        ['References', 'speak to a past client about delivery, communication and what happened when something went wrong.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed reasonable checks, though always review their portfolio directly.'],
      ],
      link: { text: 'For a longer walkthrough, read', href: '/blog/how-to-hire-a-solana-development-company', label: 'how to hire a Solana development company' },
    },
    {
      heading: 'Red flags when comparing quotes',
      bullets: [
        ['A fixed price with no discovery phase', 'for a complex protocol, the price is a guess until the scope is written down.'],
        ['No tests in the plan', 'a proposal that never mentions tests usually means you pay for them later.'],
        ['The team keeps the upgrade authority', 'you should control the keys that can change your program, ideally through a multisig.'],
        ['"Audit included" from the same team', 'a team reviewing its own code is not an independent audit.'],
        ['No code ownership clause', 'the contract should say you own the code, the repositories and the deployment keys.'],
        ['Vague timeline', 'ask for milestones with deliverables, not just a final date.'],
      ],
    },
    {
      heading: 'How a typical engagement runs',
      bullets: [
        ['Discovery (about 1-2 weeks)', 'requirements, account and permission design, risks and a written scope with milestones.'],
        ['Build (about 4-12 weeks for an MVP)', 'program, tests and frontend in milestones you can review; larger protocols take longer.'],
        ['Independent audit (about 1-3 weeks)', 'a separate security firm reviews the code before mainnet; budget time to fix findings.'],
        ['Launch and handover', 'deployment, upgrade authority setup, documentation and a support window for the first weeks.'],
      ],
      link: { text: 'Before mainnet, check the', href: '/solana-smart-contract-audits', label: 'Solana smart contract audit providers' },
    },
    {
      heading: 'Typical development pricing',
      body: 'Pricing depends heavily on scope. A simple program with a basic interface can start around $3,000-5,500, while full protocol builds with multiple interacting programs and a frontend often run into the tens of thousands.',
      linkToInsights: true,
      link: { text: 'For a range based on your own scope, use the free', href: '/tools/solana-dapp-cost-calculator', label: 'Solana dApp cost calculator' },
    },
    {
      heading: 'Questions to ask before you sign',
      bullets: [
        ['Who will actually write the code?', 'the senior engineers you met, or a junior team after the sales call.'],
        ['What is in scope and what costs extra?', 'revisions, audit fixes, post-launch support and infrastructure.'],
        ['How do you handle changes mid-project?', 'a clear change process protects both sides.'],
        ['Who holds the keys and the repositories?', 'the answer should be you, from day one.'],
        ['What happens if the project stops?', 'you should be able to take the code and continue with another team.'],
      ],
      link: { text: 'To get comparable quotes, send every company the same brief: use our free', href: '/blog/solana-project-brief-template', label: 'Solana project brief template' },
    },
  ],
  providersHeading: 'Verified Development providers',
  category: 'Development',
  faqs: [
    {
      q: 'How much does it cost to build a Solana dApp?',
      a: 'Pricing varies widely by scope: a simple program with a basic interface might start around $3,000-5,500, while a full protocol with frontend, multiple programs, and integrations can run $20,000 or more. See live indicative pricing on Orivions Market Insights.',
    },
    {
      q: 'How long does it take to build a Solana program?',
      a: 'A focused MVP with a simple program and interface often takes about 4-12 weeks after a 1-2 week discovery phase. Protocols with several interacting programs take longer, and you should add 1-3 weeks for an independent audit and time to fix its findings.',
    },
    {
      q: "What's the difference between Anchor and native Rust development?",
      a: 'Anchor is a framework that simplifies Solana program development with less boilerplate and built-in security checks; native Rust gives more control but requires more manual work. Most teams use Anchor unless they have a specific reason not to.',
    },
    {
      q: 'Do I need a separate team for frontend and smart contracts?',
      a: 'Not necessarily. Many verified providers on Orivions offer full-stack development, covering both the on-chain program and the client-facing application.',
    },
    {
      q: 'What services does a Solana development company offer?',
      a: 'Typically smart contract development in Anchor or native Rust, DeFi and dApp development, wallet and frontend integration, token and NFT launches, integrations such as indexers and oracles, and maintenance and upgrades after launch. Ask which of these the team has shipped on mainnet.',
    },
    {
      q: 'How do I choose a Solana smart contract development company?',
      a: 'Ask for mainnet programs they built, a sample test suite, references from past clients and a written scope with milestones. Make sure you will own the code and the upgrade authority, and plan for a separate security audit before launch.',
    },
    {
      q: 'Freelancer or company for Solana development?',
      a: 'A freelancer can suit a small, well-defined program. A company is usually better when you need several roles, project management and continuity after launch. Either way, check shipped work and agree milestones and ownership in writing.',
    },
    {
      q: 'Who owns the code and the upgrade authority?',
      a: 'You should. The contract should state that you own the code, the repositories and the deployment keys, and the upgrade authority should be held by your team, ideally behind a multisig, not by the development company.',
    },
    {
      q: 'Do I still need an audit if my development company tests the code?',
      a: 'Yes, if the program handles user funds or governance. Testing by the team that wrote the code is not an independent review, so book a separate security firm before mainnet.',
    },
  ],
  ctaBoxTitle: 'Not sure which dev shop fits your project?',
  ctaBoxText: 'Describe your project and requirements, and AI matches you with the right verified developers in seconds.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
