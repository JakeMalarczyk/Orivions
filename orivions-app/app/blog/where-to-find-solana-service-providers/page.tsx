import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'where-to-find-solana-service-providers';

export const metadata = postMetadata(SLUG);

const OPTIONS: [string, string, string, string][] = [
  ['Ecosystem directories', 'solana.com/ecosystem and project lists', 'Seeing who builds what on Solana', 'Lists projects and tools, not vetted vendors with pricing'],
  ['Bounty and gig boards', 'Superteam Earn', 'Small, well-scoped tasks and early-stage help', 'Quality varies; you review every applicant'],
  ['Audit contest platforms', 'Code4rena, Sherlock, Cantina', 'Well-documented programs that want many reviewers', 'Less suited to deep, private reviews of complex protocols'],
  ['General freelance sites', 'Upwork, Fiverr', 'Largest pool of generic talent', 'Few verified Solana specialists; verification is on you'],
  ['Referrals and communities', 'Founder chats, Telegram and X, ecosystem events', 'Honest opinions from teams who shipped', 'Hard to scale and hard to compare prices'],
  ['Vetted marketplaces', 'Orivions', 'A short list of checked providers, free for teams', 'Newer, so the verified list is still small'],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Where to find Solana service providers"
      answer="There is no single dominant marketplace for Solana service providers. Teams combine ecosystem directories, bounty boards, audit contest platforms, general freelance sites and referrals, plus a few vetted marketplaces such as Orivions. Use directories to discover, contests and bounties for small scoped work, and a vetted source or your own checks for anything that touches production code or funds."
      glance={{
        caption: 'Where teams look for Solana providers',
        head: ['Source', 'Examples', 'Best for', 'Watch out for'],
        rows: OPTIONS.map((r) => [...r]),
        note: 'A neutral overview. We build Orivions, so it is listed with the same caveats as the rest.',
      }}
      summary={[
        'No single marketplace dominates Solana services; most teams use two or three sources together.',
        'Match the source to the job: directories to discover, contests for documented programs, vetted lists for production work.',
        'Whatever the source, verify the provider yourself: deployed programs, public reports, a client reference and the company behind the brand.',
        'Pay by milestone, not upfront, regardless of where you found the provider.',
      ]}
      cta={{
        title: 'Want a short list instead of a search?',
        text: 'Describe your project and get up to three verified Solana providers that fit, each with a reason. Free for teams.',
        href: '/smart-match',
        label: 'Get a shortlist →',
      }}
    >
      <P>
        &quot;Is there a marketplace for Solana service providers?&quot; is a fair question, and the honest
        answer is: several, but none that every team uses. Finding an auditor, a development team or a
        marketing agency still involves a mix of directories, communities and word of mouth. This guide
        maps the options so you can pick the right one for the job.
      </P>

      <H2>The main options</H2>
      <BulletList
        items={[
          ['Ecosystem directories:', 'solana.com/ecosystem and similar lists show who is building on Solana. They are good for discovery, but they list projects and tools rather than vendors you can hire with comparable pricing.'],
          ['Bounty and gig boards:', 'projects post tasks and builders apply. Useful for small, well-scoped work and for meeting active contributors; you carry the review work for every applicant.'],
          ['Audit contest platforms:', 'Code4rena, Sherlock and Cantina run competitive reviews where many researchers read your code. They fit well-documented programs, while complex protocols often still need a private audit by a named team.'],
          ['General freelance sites:', 'the biggest pool of people, but few with deployed Solana programs you can check. Fine for small tasks; for production code, ask for on-chain proof.'],
          ['Referrals and communities:', 'asking founders who shipped recently is still the most honest signal. It does not scale and gives no price comparison.'],
          ['Vetted marketplaces:', 'a smaller set of providers that someone has already checked, so you compare a short list instead of screening dozens. Orivions is one; its verified list is still growing.'],
        ]}
      />

      <P>
        Looking only for an auditor? See{' '}
        <Link href="/blog/solana-audit-marketplaces-compared" className="text-blue-deep">
          Solana audit marketplaces compared
        </Link>{' '}
        for a side by side view of Procur3, Areta, Sherlock, Cantina, Zinn Hub and Orivions.
      </P>

      <H2>How to choose by what you need</H2>
      <BulletList
        items={[
          ['Security audit:', 'start from public reports and referrals, then compare two or three firms on scope, engineer-days and timing. Our guides on how to choose an auditor and how long an audit takes cover this.'],
          ['Smart contract or dApp development:', 'shortlist teams with deployed Solana programs and a reference client; compare a freelancer and an agency honestly on risk and continuity.'],
          ['Marketing and growth:', 'ignore guaranteed follower numbers; ask for campaigns you can verify and agree what is measured.'],
        ]}
      />

      <Callout>
        <b>Whatever the source, verify.</b> A listing is not proof. Check deployed programs on-chain, read
        public audit reports, call a client reference and confirm the company behind the brand. The{' '}
        <Link href="/blog/how-to-verify-a-web3-agency" className="text-blue-deep">
          30-minute due-diligence routine
        </Link>{' '}
        and the{' '}
        <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
          list of red flags
        </Link>{' '}
        apply to every option above.
      </Callout>

      <H2>Where Orivions fits</H2>
      <P>
        We are building Orivions because screening providers one by one costs teams days. Providers are
        checked by a person before they are called verified (see{' '}
        <Link href="/how-we-verify" className="text-blue-deep">how we verify</Link>), teams use it for free,
        and providers pay a 10% fee only on completed work. It is in early access, so shortlists are
        hand-picked and the verified list is still small. If you are comparing options, use it as one
        source, not the only one.
      </P>

      <H2>Next steps</H2>
      <P>
        Write a one-page brief first; every source works better with one. Use the{' '}
        <Link href="/blog/solana-project-brief-template" className="text-blue-deep">brief template</Link>, size
        the budget with the{' '}
        <Link href="/tools" className="text-blue-deep">free calculators</Link>, then browse{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">Solana auditors</Link>,{' '}
        <Link href="/solana-development-companies" className="text-blue-deep">development companies</Link> or{' '}
        <Link href="/solana-marketing-growth-agencies" className="text-blue-deep">marketing agencies</Link>.
      </P>
    </BlogPost>
  );
}
