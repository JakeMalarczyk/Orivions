import type { Metadata } from 'next';
import CategoryPage, { type CategoryContent } from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Solana Marketing Agency: How to Choose and Pricing',
  description:
    'How to choose a Solana marketing agency: community, KOL and launch campaigns, red flags, typical pricing and metrics that matter. Browse vetted growth agencies, free to contact.',
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
      heading: 'What a crypto marketing agency does',
      bullets: [
        ['Community building', 'Discord and Telegram setup, moderation, ambassadors and day-to-day engagement.'],
        ['KOL and creator campaigns', 'choosing relevant voices, briefing them and handling disclosure.'],
        ['Content and narrative', 'threads, articles, docs and a story people can repeat.'],
        ['Launch go-to-market', 'a plan for the weeks before and after a token launch, mint or mainnet release.'],
        ['PR and partnerships', 'media coverage and introductions to other projects and communities.'],
        ['Analytics', 'tracking what a campaign actually brought in, beyond impressions.'],
      ],
    },
    {
      heading: 'What to look for in a marketing agency',
      bullets: [
        ['Track record with actual Solana/crypto launches', 'not just generic Web2 case studies relabeled for crypto.'],
        ['Transparency about paid influencer relationships', 'ask how they handle disclosure and sourcing.'],
        ['Community-first approach', 'genuine engagement over pure paid reach that disappears after the campaign ends.'],
        ['References from past clients', 'ask a founder what the agency delivered and what they would change.'],
        ['Clear reporting', 'agree upfront which numbers you will see and how often.'],
        ['Verification status', 'providers marked "Verified" on Orivions have passed reasonable checks, though always review their portfolio directly.'],
      ],
    },
    {
      heading: 'Red flags',
      bullets: [
        ['Guaranteed follower or holder numbers', 'real growth cannot be promised before they know your product.'],
        ['Engagement that looks bought', 'bots and empty comment sections hurt trust and can get a project flagged.'],
        ['Undisclosed paid promotion', 'paid posts should be labelled; ask how the agency handles this in your target countries.'],
        ['No plan after launch day', 'a campaign that stops the day after a launch leaves you with an audience that forgets you.'],
        ['Pushing a token price', 'a marketing agency should grow users and awareness, not promise price movement.'],
      ],
    },
    {
      heading: 'Typical marketing engagement pricing',
      body: 'Pricing varies by scope. A focused campaign (for example, an NFT launch push) might start around $2,000-5,000, while ongoing growth retainers with community management often run $3,000-10,000+ per month.',
      linkToInsights: true,
    },
    {
      heading: 'What to measure instead of follower count',
      bullets: [
        ['Wallet connections and active users', 'people who actually use the product.'],
        ['Retention', 'how many return a week and a month later.'],
        ['Cost per real user', 'campaign spend divided by users who completed a meaningful action.'],
        ['Community quality', 'questions asked, support answered and members who help each other.'],
      ],
      link: { text: 'Planning a launch? Start with the', href: '/blog/solana-token-launch-checklist', label: 'Solana token launch checklist' },
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
    {
      q: 'How early should I start marketing before a launch?',
      a: 'Many teams start community and content work 4-8 weeks before launch so there is an audience on day one. Starting the week of the launch leaves little time to build trust.',
    },
    {
      q: 'Should I hire an agency on a campaign or a monthly retainer?',
      a: 'Use a campaign for a defined push such as a launch or a mint, and a retainer when you need steady community management and content. Many teams start with one campaign to test the fit before committing to a retainer.',
    },
    {
      q: 'Is paid influencer promotion allowed in crypto?',
      a: 'Rules on disclosure and on promoting tokens differ by country, so paid promotion should be labelled and reviewed for the places you target. Ask a lawyer if your campaign touches a token sale.',
    },
  ],
  ctaBoxTitle: 'Not sure which agency fits your project?',
  ctaBoxText: 'Describe your project and goals, and AI matches you with the right verified marketing providers in seconds.',
};

export default function Page() {
  return <CategoryPage content={content} />;
}
