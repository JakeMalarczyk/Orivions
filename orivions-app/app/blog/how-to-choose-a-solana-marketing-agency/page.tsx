import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-choose-a-solana-marketing-agency';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Choosing a Solana marketing agency"
      summary={[
        'Define the outcome first (users, deposits, retained community), then hire for it.',
        'Judge agencies on verifiable past results in crypto, ideally on Solana, not on follower counts.',
        'Measure KOL and community campaigns on actions such as wallet connects or deposits, not impressions alone.',
        'Walk away from guaranteed follower numbers, price talk or undisclosed paid promotion.',
        'Structure the contract around a short paid pilot, clear reporting and the right to exit.',
      ]}
      cta={{
        title: 'Find a verified Solana marketing agency',
        text: 'Describe your project, audience and goals. Smart Match suggests verified marketing and growth providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Crypto marketing is a market where it is easy to buy numbers that look impressive in a
        weekly report and do nothing for the product: followers who never connect a wallet,
        impressions from audiences in the wrong country, a Discord full of bots. Choosing an agency
        well starts with being precise about what you actually need.
      </P>

      <H2>Start with the outcome, not the channel</H2>
      <P>
        &quot;We need marketing&quot; is not a brief. Write down the one or two numbers that matter
        for the next quarter: active wallets, deposits, mints, developers building on your SDK, or
        retained community members. An agency that asks about those numbers in the first call is a
        better sign than one that opens with a list of channels and influencers.
      </P>

      <H2>What to ask before you hire</H2>
      <BulletList
        items={[
          ['Which crypto projects have you worked with, and what changed?', 'ask for results you can verify (on-chain data, public dashboards, references), not a logo wall.'],
          ['Who will run our account?', 'get names and how much of their time you will get. The founder on the sales call is not always the person doing the work.'],
          ['How do you measure success?', 'look for attribution to on-chain or product actions, with tracked links and a clear reporting cadence.'],
          ['How do you pick KOLs?', 'they should vet audience quality, past paid posts and disclosure practices, and match creators to your audience, not just to reach.'],
          ['What does the first month look like?', 'a good answer is concrete: research, positioning, a small test and a report, not "we go viral".'],
        ]}
      />

      <H2>KOL campaigns: what works</H2>
      <P>
        Key opinion leaders can drive real usage on Solana, where communities often follow a small
        number of trusted voices. They work best when the creator genuinely fits your audience,
        clearly discloses paid promotion and is measured on actions (wallet connects, sign-ups,
        deposits) through tracked links. Spreading a budget across dozens of unvetted accounts
        rarely does.
      </P>

      <Callout>
        <b>Red flags:</b> guaranteed follower or engagement numbers, any talk about token price,
        reports built only on impressions, no named team, reluctance to share verifiable past
        results, and any suggestion of undisclosed paid posts or bot activity. These are not just
        wasted budget; they can damage your reputation and create legal risk.
      </Callout>

      <H2>What it costs</H2>
      <P>
        Pricing depends on scope. A single campaign push often starts around $2,000-5,000, while
        ongoing growth or community management retainers commonly run $3,000-10,000 or more per
        month. KOL budgets are usually on top of the agency fee. Live, indicative ranges from
        verified providers are on the{' '}
        <Link href="/insights" className="text-blue-deep">insights page</Link>.
      </P>

      <H2>How to structure the contract</H2>
      <BulletList
        items={[
          ['Start with a paid pilot:', 'four to six weeks with a defined goal is enough to see how an agency works.'],
          ['Agree reporting upfront:', 'which metrics, how they are tracked and how often you receive them.'],
          ['Keep ownership:', 'social accounts, community servers, content and ad accounts stay in your name.'],
          ['Keep an exit:', 'short notice periods and no long lock-ins until the agency has earned them.'],
        ]}
      />

      <P>
        You can compare verified providers on the{' '}
        <Link href="/solana-marketing-growth-agencies" className="text-blue-deep">
          Solana marketing and growth agencies
        </Link>{' '}
        page. If you are still building the product itself, see{' '}
        <Link href="/blog/how-much-does-it-cost-to-build-a-solana-dapp" className="text-blue-deep">
          how much it costs to build a Solana dApp
        </Link>
        .
      </P>
    </BlogPost>
  );
}
