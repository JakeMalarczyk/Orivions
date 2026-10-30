import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'what-makes-a-solana-development-company-trustworthy';

export const metadata = postMetadata(SLUG);

const SIGNALS: { title: string; text: string; check: string }[] = [
  {
    title: 'Programs you can find on-chain',
    text: 'A trustworthy team can point to Solana programs it built, with addresses you can open in an explorer. The program exists, it is in use and it matches the project the team says it belongs to.',
    check: 'Ask for three program addresses and open each one yourself.',
  },
  {
    title: 'Public commit history from the people you meet',
    text: 'The engineers on the call have repositories with commits over months, not a single burst before a pitch. Rust and Anchor work should show up in their history.',
    check: 'Search their GitHub for the names you were given.',
  },
  {
    title: 'Named people and a registered company',
    text: 'You know who will write your code, who leads the project and which legal entity signs the contract. Anonymous teams are not automatically bad, but they carry more risk when money is at stake.',
    check: 'Ask for the legal entity, the registration number and the names of the engineers assigned.',
  },
  {
    title: 'Clients who answer when you contact them yourself',
    text: 'A reference you found through the client’s own channels is worth more than one the agency hands you. Past clients should confirm delivery, budget and who did the work.',
    check: 'Pick a client from their portfolio and message them directly.',
  },
  {
    title: 'A plan for testing and independent review',
    text: 'The team writes tests, expects an independent audit before mainnet and does not offer to audit its own code. A team that calls a self-review enough is a risk.',
    check: 'Ask what tests ship with the code and who they would recommend for the audit.',
  },
  {
    title: 'You own the code and the upgrade authority',
    text: 'The contract transfers all code and IP to you, the repository lives in your organisation, and the program upgrade authority is a wallet or multisig you control.',
    check: 'Read the IP clause and ask who holds the upgrade key.',
  },
  {
    title: 'Scope, milestones and payment that match',
    text: 'The proposal lists deliverables, acceptance criteria and a schedule. Payment follows milestones you can verify, not a large amount up front.',
    check: 'Look for a milestone table and a clear definition of done.',
  },
  {
    title: 'Direct answers about what they have not done',
    text: 'Trustworthy teams say when a task is outside their experience, name the parts they would subcontract and explain why. Overpromising is the most common warning sign.',
    check: 'Ask what the team would not take on, and what has gone wrong in a past project.',
  },
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Trustworthy Solana development company"
      summary={[
        'A trustworthy Solana development company shows work you can verify: on-chain programs, public commits, named engineers and clients who answer.',
        'Check the evidence yourself instead of relying on logos, followers or a polished deck.',
        'Make sure you own the code and the upgrade authority, and that payment follows milestones.',
        'Expect an independent audit before mainnet. A team that audits itself is a risk.',
        'No single check settles it. Several weak signals together are a reason to walk away.',
      ]}
      cta={{
        title: 'Start with teams that were checked',
        text: 'Providers on Orivions were reviewed by a person before getting the Verified badge. Describe your project and get matched. Free for teams.',
        href: '/smart-match',
        label: 'Find a development team →',
      }}
    >
      <P>
        <b>A trustworthy Solana development company is one whose work you can verify without taking its
        word for it.</b> That means programs on-chain, a public commit history, named engineers, a registered
        company and past clients who answer when you contact them. The eight signals below turn
        that into a short, checkable list.
      </P>

      {SIGNALS.map((s, i) => (
        <section key={s.title}>
          <H2>
            {i + 1}. {s.title}
          </H2>
          <P>{s.text}</P>
          <P>
            <b>How to check:</b> {s.check}
          </P>
        </section>
      ))}

      <Callout>
        <b>Trust is a stack, not a switch.</b> One missing signal has an explanation, such as work
        under NDA or a white-label engagement. Three or four missing signals do not.
      </Callout>

      <H2>What does not make a team trustworthy</H2>
      <BulletList
        items={[
          ['Famous logos:', 'a logo on a landing page is not a reference. Confirm the work with the client.'],
          ['Follower counts:', 'audience size says nothing about whether a team ships working programs.'],
          ['The lowest quote:', 'a price far below the rest usually means less experience or a smaller scope than you think.'],
          ['Fast replies on Discord:', 'responsiveness helps, but it is not evidence of skill.'],
        ]}
      />

      <H2>Where verification helps</H2>
      <P>
        Doing these checks for every candidate takes hours. On Orivions a person checks that each
        provider is a real, reachable company and that its portfolio and prices hold up before it
        gets the Verified badge. For a large engagement you should still talk to past clients. The
        full routine is in{' '}
        <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">
          how to verify a Web3 agency in 30 minutes
        </Link>
        , and the questions to ask on the first call are in{' '}
        <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
          how to hire a Solana development company
        </Link>
        . See{' '}
        <Link href="/how-we-verify" className="text-blue-deep">how verification works</Link> for the
        process.
      </P>
    </BlogPost>
  );
}
