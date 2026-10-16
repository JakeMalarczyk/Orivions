import Link from 'next/link';
import BlogPost, { Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-hire-a-solana-development-company';

export const metadata = postMetadata(SLUG);

const QUESTIONS: { q: string; why: string }[] = [
  {
    q: 'Which Solana programs have you shipped to mainnet?',
    why: 'Ask for program addresses, repositories or live products, not logos. Mainnet experience with real users is different from hackathon demos and devnet prototypes.',
  },
  {
    q: 'Anchor or native Rust — and why for our project?',
    why: 'Anchor removes a lot of boilerplate and many classes of account-validation mistakes; native Rust gives more control over compute and account layout. A good team explains the trade-off for your case instead of defaulting to whatever they always use.',
  },
  {
    q: 'Who exactly will work on this, and how much of their time?',
    why: 'Get names, seniority and allocation. The senior engineer on the sales call is not always the one writing your program.',
  },
  {
    q: 'How do you scope and estimate?',
    why: 'Look for a short paid discovery or specification phase, milestones with clear acceptance criteria and an explicit list of assumptions. A large fixed quote from a two-paragraph brief is a guess.',
  },
  {
    q: 'How will you design the accounts and keep within compute limits?',
    why: 'Account layout, PDAs, transaction size and compute units shape what is possible on Solana. Teams that think about these early avoid expensive rewrites later.',
  },
  {
    q: 'How do you test on-chain code?',
    why: 'Expect unit and integration tests run against a local validator or a lightweight test runtime such as LiteSVM, tests for failure paths (wrong signer, wrong account) and, for anything holding funds, fuzzing or invariant tests.',
  },
  {
    q: 'How do you handle security reviews and the external audit?',
    why: 'Internal peer review is the minimum. For programs that hold user funds, plan an independent audit before mainnet and agree who coordinates it and who fixes the findings. Our guide to choosing an auditor covers what to look for.',
  },
  {
    q: 'What off-chain infrastructure does this need?',
    why: 'Indexers, RPC providers, keepers or cranks, monitoring and alerting are often where projects break in production. Make sure they are part of the scope and the budget.',
  },
  {
    q: 'Who owns the code, the repository and the upgrade authority?',
    why: 'You should own all IP, the repository should live in your organisation from day one, and the program upgrade authority and deployment keys should sit in a wallet or multisig you control.',
  },
  {
    q: 'How will we communicate and track progress?',
    why: 'Agree a weekly demo or written update, access to the repository and issue tracker, and a single accountable contact on their side.',
  },
  {
    q: 'What happens after launch?',
    why: 'Ask about bug-fix warranties, maintenance retainers, response times for incidents and how knowledge is handed over if you take development in-house.',
  },
  {
    q: 'How are payments tied to delivery?',
    why: 'Pay per accepted milestone, not per month of activity. Fixed-price per milestone works for well-scoped work; time-and-materials with a cap works better for exploratory work.',
  },
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Hiring a Solana development company"
      summary={[
        'Judge a Solana team by what it has shipped to mainnet, not by its pitch deck.',
        'Insist on named engineers, a written scope with milestones and explicit assumptions.',
        'Ask how they test on-chain code and who runs the external audit before launch.',
        'Own your code, repository, upgrade authority and deployment keys from day one.',
        'Tie payments to accepted milestones, and plan for maintenance after launch.',
      ]}
      cta={{
        title: 'Find a verified Solana development team',
        text: 'Describe what you are building in plain English. Smart Match suggests verified development companies with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Most bad outsourcing outcomes are visible in the first call, if you ask the right
        questions. Whether you need a full product team or a few engineers to extend an existing
        protocol, these are the twelve questions we would ask any Solana development company before
        signing.
      </P>

      {QUESTIONS.map(({ q, why }, i) => (
        <section key={q}>
          <H2>
            {i + 1}. {q}
          </H2>
          <P>{why}</P>
        </section>
      ))}

      <Callout>
        <b>A simple rule:</b> if a team cannot show you something they shipped on Solana mainnet,
        will not tell you who will do the work, or wants the upgrade authority in their own
        wallet, keep looking.
      </Callout>

      <P>
        Related reading:{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana smart contract auditor
        </Link>
        . To compare verified teams and indicative price ranges, see{' '}
        <Link href="/solana-development-companies" className="text-blue-deep">
          Solana development companies
        </Link>
        .
      </P>
    </BlogPost>
  );
}
