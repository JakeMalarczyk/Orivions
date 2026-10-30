import Link from 'next/link';
import BlogPost, { Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'red-flags-hiring-web3-service-providers';

export const metadata = postMetadata(SLUG);

const GROUPS: { title: string; flags: [string, string][] }[] = [
  {
    title: 'Before the first call',
    flags: [
      ['A portfolio you cannot verify.', 'Logos and screenshots without program addresses, repositories or client contacts prove nothing.'],
      ['Guaranteed outcomes.', 'Guaranteed followers, listings, token prices or "zero bugs" are promises nobody honest can make.'],
      ['Pressure to decide fast.', '"Our slot closes today" is a sales tactic, not a scheduling fact.'],
      ['No identifiable people.', 'An anonymous team with no public track record and no references carries risk you cannot measure.'],
    ],
  },
  {
    title: 'During scoping',
    flags: [
      ['A big fixed price from a two-line brief.', 'Without understanding your project, any precise number is a guess.'],
      ['No questions about your users or goals.', 'Teams that only talk about their stack will build what is easy for them, not what you need.'],
      ['Vague answers about who does the work.', 'The senior person on the call should tell you who will actually write the code or the report.'],
      ['No mention of testing or audits.', 'For anything that holds funds, a team that does not raise security itself is a concern.'],
    ],
  },
  {
    title: 'In the contract',
    flags: [
      ['Full payment upfront.', 'Fair terms tie payment to accepted milestones, with at most a modest deposit.'],
      ['They keep the keys.', 'Upgrade authority, treasury, deployment keys and admin roles must sit with you, ideally in a multisig.'],
      ['They keep the code.', 'All IP should transfer to you, and the repository should live in your organisation from day one.'],
      ['No exit clause.', 'You should be able to stop after any milestone and take the work done so far.'],
    ],
  },
  {
    title: 'During the work',
    flags: [
      ['No access to progress.', 'You should see the repository and a demo or written update at least weekly.'],
      ['Changed payment details.', 'A new wallet address "because of an issue" is a classic fraud pattern. Confirm through a second channel.'],
      ['Silence before deadlines.', 'Problems discovered on delivery day were usually known much earlier.'],
    ],
  },
];

export default function PostPage() {
  let n = 0;
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Red flags when hiring"
      summary={[
        'Unverifiable portfolios and guaranteed results are the most common early warning signs.',
        'A precise quote from a vague brief is a guess, not an estimate.',
        'Never let a provider hold your upgrade authority, treasury or deployment keys.',
        'Pay per accepted milestone and keep the right to stop after any of them.',
        'Treat changed payment details as fraud until confirmed through a second channel.',
      ]}
      cta={{
        title: 'Start with verified providers',
        text: 'Every provider on Orivions was checked by a person before getting the Verified badge. Describe your project and get matched. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Most bad hires in Web3 are not a surprise in hindsight. The signs were visible in the
        portfolio, the first call or the contract. None of the flags below is proof on its own, but
        each one deserves a direct question, and several together are a reason to walk away.
      </P>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <H2>{g.title}</H2>
          {g.flags.map(([flag, why]) => {
            n += 1;
            return (
              <div key={flag} className="mt-4 rounded-2xl border border-line p-5">
                <h3 className="font-semibold">
                  {n}. {flag}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink/90">{why}</p>
              </div>
            );
          })}
        </section>
      ))}

      <Callout>
        <b>One question catches many of these:</b> &quot;Can you show me something you shipped on
        Solana mainnet, and put me in touch with that client?&quot; Good providers answer it
        easily.
      </Callout>

      <P>
        For a fast way to check a provider, follow{' '}
        <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">
          how to verify a Web3 agency in 30 minutes
        </Link>
        . For contract terms, see{' '}
        <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
          milestone payments and escrow
        </Link>
        , and for marketing specifically,{' '}
        <Link href="/blog/how-to-choose-a-solana-marketing-agency" className="text-blue-deep">
          how to choose a Solana marketing agency
        </Link>
        .
      </P>
    </BlogPost>
  );
}
