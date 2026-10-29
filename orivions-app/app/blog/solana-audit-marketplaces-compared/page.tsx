import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-audit-marketplaces-compared';

export const metadata = postMetadata(SLUG);

const ROWS: [string, string, string, string][] = [
  [
    'Procur3',
    'Collecting competing quotes from many audit firms',
    'Solana is listed among the supported chains; a testimonial on the site mentions finding Rust auditors for Solana programs',
    'You post a scope as a request for proposals to vetted security firms. It says it lists 70+ auditors and does not run audits itself',
  ],
  [
    'Areta (solana.areta.market)',
    'Free quote comparison for Solana builders',
    'Built around Solana: the page is titled "Solana Marketplace"',
    'Says it gives access to 20+ vetted auditors, competing quotes within 48 hours, and is free for builders',
  ],
  [
    'Sherlock',
    'Open competitions plus expert-led reviews for high-value protocols',
    'Solana is not listed as a named service on the homepage; it features a Solana case study (Meteora)',
    'Open competitions with hundreds of researchers, alongside expert-led and AI-assisted reviews',
  ],
  [
    'Cantina',
    'Hybrid audits and researcher-validated bug bounties',
    'Solana is not named on the homepage',
    'Hybrid audits with expert triage and live bounties; bounty reports are deduplicated and validated',
  ],
  [
    'Zinn Hub',
    'Small, well-scoped freelance tasks with escrow',
    'Not stated: it is a general freelance marketplace, not a security specialist',
    'Freelancers pass an ID check and a skill check; payment is held until you accept the delivery',
  ],
  [
    'Orivions',
    'A short, human-verified list across audits, development and marketing; free for teams',
    'Solana first',
    'A person checks the company, one portfolio project, a client reference and runs a call before the Verified badge. Early access: the verified list is still small and shortlists are hand-picked',
  ],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana audit marketplaces compared"
      answer="There is no single best marketplace for hiring a Solana smart contract auditor. Quote marketplaces such as Procur3 and Areta help you compare several audit firms at once, competition and bounty platforms such as Sherlock and Cantina bring many reviewers to a well-documented program, general freelance sites such as Zinn Hub suit small scoped tasks, and Orivions offers a short list of providers that a person has verified. Whichever you pick, check the auditor's Solana track record yourself."
      glance={{
        caption: 'Solana audit marketplaces at a glance',
        head: ['Marketplace', 'Best for', 'Solana fit', 'Verification / trust model'],
        rows: ROWS.map((r) => [...r]),
        note: 'Based on each service’s own homepage on 29 October 2026; we have not tested them. We build Orivions, so read it as one option among several.',
      }}
      summary={[
        'Quote marketplaces (Procur3, Areta) are the fastest way to compare several audit firms on price and timing.',
        'Competition and bounty platforms (Sherlock, Cantina) fit well-documented programs that want many reviewers.',
        '"Verified" means different things on each site: a vetted firm list, an ID and skill check, or a person checking a portfolio and a reference.',
        'No marketplace replaces your own check of an auditor’s public Solana reports.',
      ]}
      cta={{
        title: 'Want a short list instead of a comparison?',
        text: 'Describe your project and get up to three verified providers that fit, each with a reason. Free for teams.',
        href: '/smart-match',
        label: 'Get a shortlist →',
      }}
    >
      <P>
        Teams that search for &quot;a verified marketplace to hire a Solana auditor&quot; find several
        services that work in different ways. This guide compares them on the questions that matter: what
        each is best for, how well it fits Solana, and what &quot;verified&quot; actually means on each.
        Everything about other services below comes from what they say about themselves; check their sites
        before you rely on it.
      </P>

      <H2>The marketplaces, one by one</H2>
      <BulletList
        items={[
          ['Procur3:', 'a request-for-proposal marketplace. You describe the scope, vetted firms reply with quotes, and you compare price, timing and experience side by side. It says it does not perform audits itself.'],
          ['Areta:', 'a marketplace aimed at Solana builders. You submit an audit request and get competing quotes from its vetted auditors. It says it is free for builders.'],
          ['Sherlock:', 'a security company known for open competitions where many researchers review your code, and it also offers expert-led reviews. Its homepage features a Solana case study.'],
          ['Cantina:', 'a security platform with hybrid audits and bug bounties where reports are validated by researchers and triagers.'],
          ['Zinn Hub:', 'a general freelance marketplace with ID and skill checks and escrow. It is not a security specialist, so treat any Solana or Rust claim as something to verify.'],
          ['Orivions:', 'our own marketplace for onchain teams. Providers are checked by a person before they are called Verified, matching is free for teams, and a flat 10% success fee applies only to completed work. It is early access and the verified list is still small.'],
        ]}
      />

      <H2>How to choose</H2>
      <BulletList
        items={[
          ['You want several quotes fast:', 'a quote marketplace such as Procur3 or Areta.'],
          ['You have a well-documented program and want many reviewers:', 'a competition or bounty platform. See our guide on audit versus bug bounty.'],
          ['You want a short, pre-checked list across audits, development and marketing:', 'a vetted marketplace such as Orivions, used alongside your own checks.'],
          ['The task is small and well scoped:', 'a freelance marketplace with escrow can work, with extra care on Solana experience.'],
        ]}
      />

      <Callout>
        <b>Whatever the marketplace, verify the auditor.</b> Read two or three of their public Solana
        reports, check which programs they reviewed, and ask who actually does the work. Our guides on{' '}
        <Link href="/blog/how-to-compare-solana-audit-firms" className="text-blue-deep">
          comparing Solana audit firms
        </Link>{' '}
        and{' '}
        <Link href="/blog/how-to-choose-a-solana-smart-contract-auditor" className="text-blue-deep">
          choosing an auditor
        </Link>{' '}
        show how.
      </Callout>

      <H2>Next steps</H2>
      <P>
        Size the budget with the{' '}
        <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>,
        write a one-page brief with the{' '}
        <Link href="/blog/solana-project-brief-template" className="text-blue-deep">brief template</Link>, then
        browse{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">Solana auditors on Orivions</Link>{' '}
        or read the wider overview of{' '}
        <Link href="/blog/where-to-find-solana-service-providers" className="text-blue-deep">
          where to find Solana service providers
        </Link>
        . See{' '}
        <Link href="/how-we-verify" className="text-blue-deep">how we verify</Link> providers.
      </P>
    </BlogPost>
  );
}
