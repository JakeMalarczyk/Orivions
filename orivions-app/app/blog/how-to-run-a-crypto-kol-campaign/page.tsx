import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-run-a-crypto-kol-campaign';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Crypto KOL campaign"
      answer="Run a crypto KOL campaign in five steps: pick one measurable action, choose a few creators whose audience matches your users, agree deliverables and disclosure in writing, give each creator a tracked link, and pay in stages against results you can verify. Impressions alone prove nothing."
      glance={{
        caption: 'Common ways to pay a KOL',
        head: ['Model', 'How it works', 'Main risk'],
        rows: [
          ['Flat fee', 'Fixed price per post, thread or video', 'You pay whether or not it works'],
          ['Per action', 'Payment per sign-up, wallet connect or deposit', 'Needs clean tracking and a clear definition of an action'],
          ['Hybrid', 'Smaller fee plus a bonus on verified results', 'More terms to write down'],
          ['Tokens', 'Paid in your token, often with vesting', 'Creator may sell, and terms need a lawyer'],
        ],
        note: 'Whatever the model, write down what counts as delivered and who verifies it.',
      }}
      summary={[
        'Start with one action you can count, such as wallet connects, sign-ups or first deposits.',
        'Fit beats reach: a few creators whose audience uses your product usually beat many unvetted accounts.',
        'Put deliverables, dates, approval rights and paid-promotion disclosure in a written agreement.',
        'Give every creator a unique tracked link or code so results can be compared.',
        'Pay in stages, and keep a small part until the deliverables are live and checked.',
      ]}
      cta={{
        title: 'Find a Solana marketing partner',
        text: 'Describe your launch, audience and budget. Smart Match suggests verified marketing providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        A KOL (key opinion leader) campaign pays creators whose audience trusts their picks to talk
        about your project. Done well it brings in users who already care about crypto. Done badly it
        brings a spike of impressions, a few bots and a bill. The difference is mostly preparation,
        not the size of the creator.
      </P>

      <H2>1. Decide what the campaign is for</H2>
      <P>
        Pick one action that matters and that you can count: connecting a wallet, joining a
        waitlist, making a first deposit, minting. Write it as a sentence a creator can repeat, and
        set a target before you contact anyone. Brand awareness is a fine goal, but then say how you
        will recognise it, for example growth in branded search or direct visits during the
        campaign.
      </P>

      <H2>2. Choose creators who fit your users</H2>
      <BulletList
        items={[
          ['Audience match:', 'ask for audience location, language and topics. A large audience in the wrong country or niche will not use your product.'],
          ['Real engagement:', 'read the comments. Generic replies, repeated emojis and bursts of new followers are warning signs.'],
          ['Track record:', 'ask which projects they promoted before and what happened to those projects. A creator who promoted many short-lived projects carries that history with them.'],
          ['Fit with the product:', 'a creator who explains DeFi in depth suits a lending protocol. A meme account suits a meme launch.'],
          ['Few, not many:', 'start with a small group, learn which works, then expand.'],
        ]}
      />

      <H2>3. Pick a payment model</H2>
      <P>
        The table above shows the usual options. Early campaigns often use a flat fee, because per
        action deals need tracking you may not have yet. If you pay in tokens, agree in writing on
        vesting and on what the creator may do with them, and ask a lawyer to look at the terms,
        since token payments can create legal and tax questions.
      </P>

      <H2>4. Write the brief and the agreement</H2>
      <BulletList
        items={[
          ['Deliverables:', 'platform, format, number of posts, publishing dates and how long a post must stay up or pinned.'],
          ['Messaging:', 'facts the creator must get right, claims they must not make, and whether you approve a draft first.'],
          ['Disclosure:', 'the post must make clear that it is paid. Regulators in the US, the UK and elsewhere expect clear labelling of paid promotion, and rules differ by country, so check with a lawyer for your markets.'],
          ['No promises:', 'forbid guarantees about price or returns. They create legal risk for both sides.'],
          [
            'Payment:',
            <>
              split into stages, with the last part due after the posts are live and checked. Our guide to{' '}
              <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
                milestone payments and escrow
              </Link>{' '}
              shows how.
            </>,
          ],
          ['Exclusivity and conflicts:', 'say whether the creator may promote a competitor in the same window.'],
        ]}
      />

      <H2>5. Track results per creator</H2>
      <P>
        Give each creator a unique link with UTM parameters, or a code, so you can see who sent real
        users. Count the action you chose in step 1, not clicks. For on-chain actions, match wallet
        connects or deposits to the campaign window. Compare creators by cost per action, and keep
        the ones that worked.
      </P>

      <Callout>
        <b>Questions to ask a creator or an agency:</b> where is your audience, by country and
        language? Which projects did you promote in the last year? Can you share analytics from a
        past post? How will you disclose the paid post? What happens if the post is deleted early?
        Do you agree to staged payment?
      </Callout>

      <H2>Mistakes to avoid</H2>
      <BulletList
        items={[
          ['Judging by impressions:', 'they are cheap to inflate. Judge by the action you defined.'],
          ['Paying everything up front:', 'you lose leverage if the post is late or never appears.'],
          ['Skipping disclosure:', 'it can cause legal trouble and damages trust in both the creator and your project.'],
          ['Launching before the product can take users:', 'a campaign into a broken sign-up flow wastes the spike.'],
          ['No written terms:', 'a chat message is not a brief. Put it in an agreement.'],
        ]}
      />

      <P>
        If you hire an agency to run creators for you, see{' '}
        <Link href="/blog/how-to-choose-a-solana-marketing-agency" className="text-blue-deep">
          how to choose a Solana marketing agency
        </Link>
        . The glossary entry for <Link href="/solana-glossary/kol" className="text-blue-deep">KOL</Link>{' '}
        has the short definition, and the{' '}
        <Link href="/solana-marketing-growth-agencies" className="text-blue-deep">
          Solana marketing and growth agencies
        </Link>{' '}
        page lists verified providers.
      </P>

      <P>
        Also useful: <Link href="/blog/how-to-choose-a-web3-lawyer-for-a-token-launch" className="text-blue-deep">how to choose a Web3 lawyer</Link>.
      </P>
    </BlogPost>
  );
}
