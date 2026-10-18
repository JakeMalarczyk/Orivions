import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Marketing & Growth Agencies: Verified Providers',
  description:
    'Find verified marketing and growth agencies for Solana projects: community building, KOL marketing, growth campaigns. Compare providers, free to search and contact.',
  alternates: { canonical: '/solana-marketing-growth-agencies' },
};

const content: CategoryContent = {
  path: '/solana-marketing-growth-agencies',
  guideTags: ['Marketing'],
  breadcrumbLabel: 'Solana Marketing & Growth Agencies',
  h1: 'Solana Marketing & Growth Agencies',
  lede: 'Verified marketing agencies for Solana projects, from community growth to full go-to-market campaigns. Compare providers, see indicative pricing, and contact them directly. Free to search.',
  ctaPrimary: 'Describe your campaign needs (AI match)',
  sections: [
    {
      heading: 'Why work with a Solana-native marketing agency?',
      body: 'Crypto marketing has its own playbook: community-led growth, KOL/influencer dynamics, Discord and Telegram engagement, and navigating a skeptical, insider-heavy audience. A generalist Web2 marketing agency often misreads this audience; a Solana-native agency already understands what resonates in this specific ecosystem.',
    },
    {
      heading: 'What to look for in a marketing agency',
      bullets: [
        ['Track record with actual Solana/crypto launches', 'not just generic Web2 case studies relabeled for crypto.'],
        ['Transparency about paid influencer relationships', 'ask how they handle disclosure and sourcing.'],
        ['Community-first approach', 'genuine engagement over pure paid reach that disappears after the campaign ends.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed reasonable checks, though always review their portfolio directly.'],
      ],
    },
    {
      heading: 'Typical marketing engagement pricing',
      body: 'Pricing varies by scope. A focused campaign (for example, an NFT launch push) might start around $2,000-5,000, while ongoing growth retainers with community management often run $3,000-10,000+ per month.',
      linkToInsights: true,
    },
  ],
  providersHeading: 'Verified Marketing & Growth providers',
  category: 'Marketing & Growth',
  faqs: [
    {
      q: 'How much does Solana marketing cost?',
      a: 'Pricing varies by scope: a single campaign push might start around $2,000-5,000, while ongoing growth or community management retainers often run $3,000-10,000+ per month. See live indicative pricing on Orivions Market Insights.',
    },
    {
      q: "What's the difference between growth marketing and PR for a Solana project?",
      a: 'Growth marketing focuses on directly acquiring and activating users (campaigns, community, paid channels); PR focuses on media coverage and narrative. Many projects need both, often from different specialists, so check what a provider actually specializes in.',
    },
    {
      q: 'Should I be cautious about agencies promising guaranteed follower growth?',
      a: 'Yes. Be wary of agencies promising specific follower or growth numbers without understanding your project first. Genuine community growth is earned, not purely bought; verified providers should be able to explain their actual methodology.',
    },
  ],
  ctaBoxTitle: 'Not sure which agency fits your project?',
  ctaBoxText: 'Describe your project and goals, and AI matches you with the right verified marketing providers in seconds.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
