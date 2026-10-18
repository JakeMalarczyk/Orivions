import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-verify-a-web3-agency';

export const metadata = postMetadata(SLUG);

const ROUTINE: { minutes: string; title: string; checks: [string, string][] }[] = [
  {
    minutes: 'Minutes 0-10',
    title: 'Check the work',
    checks: [
      ['Program addresses:', 'open each claimed program in a Solana explorer. Confirm it exists, is in use and matches the project they named.'],
      ['Repositories:', 'look at commit history on public repositories. Are their people actually committing, over months, not in one burst?'],
      ['Audit reports:', 'confirm the report also appears on the audited project’s own site or repository, and that findings are specific and technical.'],
      ['Campaign results:', 'for marketing agencies, ask for metrics you can check yourself, such as on-chain activity or public dashboards, not screenshots.'],
    ],
  },
  {
    minutes: 'Minutes 10-20',
    title: 'Check the company and the people',
    checks: [
      ['Company details:', 'a registered entity, a business address and a contract signed by that entity.'],
      ['The team:', 'the people on the call should have a public history consistent with what they claim, on GitHub, X or LinkedIn.'],
      ['Domain and email:', 'a company domain that is not brand new, and email from that domain rather than a free mailbox.'],
    ],
  },
  {
    minutes: 'Minutes 20-30',
    title: 'Check with past clients',
    checks: [
      ['Pick the reference yourself:', 'choose a client from their portfolio and contact them through the client’s own channels, not a contact the agency gives you.'],
      ['Ask three questions:', 'Did they deliver on time and on budget? Who did the work? Would you hire them again?'],
    ],
  },
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="How to verify a Web3 agency"
      summary={[
        'Verify the work before the pitch: program addresses, repositories, reports and checkable metrics.',
        'Confirm the company is a registered entity and the people on the call have a real public history.',
        'Contact a past client you pick yourself, through their own channels.',
        'Thirty minutes of checks prevents most bad hires.',
        'Third-party verification, such as the Verified badge on Orivions, is a head start, not a replacement.',
      ]}
      cta={{
        title: 'Skip the first round of checks',
        text: 'Providers on Orivions were checked by a person before being marked Verified. Describe your project and get matched in seconds. Free for teams.',
        href: '/smart-match',
        label: 'Find verified providers →',
      }}
    >
      <P>
        In Web3, anyone can put famous logos on a landing page. The good news is that most real work
        leaves public traces: programs on-chain, commits in repositories, reports on clients&apos;
        sites. This routine uses those traces to check a provider in about thirty minutes, before
        you invest time in calls and proposals.
      </P>

      {ROUTINE.map((step) => (
        <section key={step.title}>
          <H2>
            {step.minutes}: {step.title}
          </H2>
          <BulletList items={step.checks} />
        </section>
      ))}

      <Callout>
        <b>If something does not check out,</b> ask about it directly. Honest providers have simple
        explanations, such as work under NDA, a white-label engagement or a client that has since
        shut down. Evasive answers are themselves an answer.
      </Callout>

      <H2>How verification works on Orivions</H2>
      <P>
        Before a provider is marked Verified on Orivions, a person checks that it is a real,
        reachable company, that its portfolio holds up, and that its services and price ranges are
        specific enough to compare. Paying for visibility never buys the badge. It saves you the
        first round of checks, but for any significant engagement you should still speak to past
        clients. More on the process is on the{' '}
        <Link href="/about" className="text-blue-deep">about page</Link>.
      </P>
      <P>
        Next, read the{' '}
        <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
          red flags when hiring Web3 providers
        </Link>{' '}
        and, for audits,{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          how to choose a Solana auditor
        </Link>
        .
      </P>
    </BlogPost>
  );
}
