import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-audit-subsidy-program';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana audit subsidy programs"
      answer="A Solana audit subsidy program pays part of a security audit for selected projects. Participating audit firms fund a pool of discounts, a review board picks projects in cohorts, and approved teams redeem the award against a quote from a participating firm. It usually covers a share of the quote, not the whole audit, so get comparable quotes and prepare your scope before you apply."
      glance={{
        caption: 'Audit subsidy at a glance',
        head: ['Question', 'Typical answer'],
        rows: [
          ['Who pays?', 'Participating audit firms, as a discount on their own quote'],
          ['How much?', 'A share of the quote. Public terms of the best-known Solana program mention a cap of about 30%, with past awards of roughly $5k to $50k'],
          ['Who decides?', 'A review board from the ecosystem, scoring projects against published criteria'],
          ['When?', 'In cohorts with fixed application deadlines'],
          ['What do you get?', 'An award or voucher that you redeem when you pick a participating firm'],
        ],
        note: 'Terms change between cohorts. Check the current rules on the program page before you plan your budget around a subsidy.',
      }}
      summary={[
        'An audit subsidy lowers the price of a quote. It does not replace the quote, the scope or the start date.',
        'Awards are capped at a share of the quote, so plan to pay most of the audit yourself.',
        'Reviewers look for ecosystem relevance, an experienced team, technical readiness and impact.',
        'A frozen commit, a short spec and tests that run make both the application and the audit stronger.',
        'Get comparable quotes on one brief first, then apply with real numbers and dates.',
      ]}
      cta={{
        title: 'Need quotes before you apply?',
        text: 'Send your scope once. We pass the same brief to up to three verified audit firms and you get comparable quotes, usually within 72 hours. Free for teams.',
        href: '/solana-audit-quotes?ref=subsidy-guide',
        label: 'Get audit quotes →',
      }}
    >
      <P>
        A Solana audit is often the biggest single bill before mainnet. Our{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          guide to Solana audit cost
        </Link>{' '}
        explains why quotes for the same code can differ several times. Audit subsidy programs exist
        to make that bill smaller for projects the ecosystem wants to see launch safely. They help,
        but only if you understand what they pay for and when.
      </P>

      <H2>How a Solana audit subsidy works</H2>
      <BulletList
        items={[
          ['A pool of discounts:', 'participating audit firms commit discounts to the program. The subsidy is money off their quote, not a cash grant paid to your team.'],
          ['Cohorts and deadlines:', 'applications are collected until a deadline, reviewed together, and the next cohort opens later. Missing a deadline can cost you a month.'],
          ['A review board:', 'people from the ecosystem score each application against published criteria and decide the award.'],
          ['An award you redeem:', 'approved teams see offers from participating firms and apply their award, often as a voucher code, when they pick one.'],
          ['A cap:', 'the award is limited to a share of the quote. Public terms of the best-known Solana program mention about 30%.'],
        ]}
      />

      <H2>What reviewers look for</H2>
      <P>
        Criteria differ by program, but published ones usually come down to four questions. Answer
        each one with evidence, not adjectives.
      </P>
      <BulletList
        items={[
          ['Relevance:', 'does the project add something the Solana ecosystem needs, and will real users or funds depend on it?'],
          ['Team:', 'have the builders shipped before? Link to deployed programs, repositories and past audit reports.'],
          ['Readiness:', 'is the code close to final, with tests and documentation, so the audit can start soon after approval?'],
          ['Impact:', 'what changes if the audit happens: users protected, value secured, launch date kept.'],
        ]}
      />
      <Callout>
        <b>Readiness is the easiest point to win.</b> A frozen commit, a one-page spec with
        invariants and tests that run with one command show that the subsidy will be used, not
        parked. Our{' '}
        <Link href="/blog/solana-audit-readiness-checklist" className="text-blue-deep">
          audit readiness checklist
        </Link>{' '}
        lists the twelve items to prepare.
      </Callout>

      <H2>How to prepare a strong application</H2>
      <BulletList
        items={[
          ['Fix the scope:', 'list the programs in scope, the lines of Rust, Anchor or native, and the external protocols or oracles you call.'],
          ['Know your price range:', <>estimate it with the free <Link href="/tools/solana-audit-cost-calculator" className="text-blue-deep">audit cost calculator</Link>, then confirm with real quotes.</>],
          ['Know your dates:', <>work backwards from launch with the <Link href="/tools/solana-audit-timeline-planner" className="text-blue-deep">audit timeline planner</Link>, so the cohort decision does not push your launch.</>],
          ['Write one brief:', <>use the <Link href="/tools/audit-rfp-generator" className="text-blue-deep">audit RFP generator</Link> so every firm quotes the same scope and the numbers can be compared.</>],
          ['Show the plan after the audit:', 'fix review, verifiable build, upgrade authority in a multisig and monitoring. Reviewers want to see the audit protect a real launch.'],
        ]}
      />

      <H2>Get quotes first, then apply</H2>
      <P>
        The subsidy is applied to a quote, so the quote comes first. Comparable quotes on one brief
        tell you the real price, the earliest start date and whether a fix review is included. They
        also make your application concrete: reviewers see a scope, a budget and a date instead of
        an estimate. If you want help, we send the same brief to up to three verified firms and you
        get{' '}
        <Link href="/solana-audit-quotes?ref=subsidy-guide" className="text-blue-deep">
          comparable Solana audit quotes
        </Link>
        , usually within 72 hours, free for your team. Ask each firm whether it takes part in a
        subsidy program you plan to apply to.
      </P>

      <H2>Other ways to lower the cost of an audit</H2>
      <BulletList
        items={[
          ['Shrink the scope:', 'audit the programs that hold funds or authority first. Front-end code and scripts can wait.'],
          ['Prepare well:', 'every hour an auditor spends on setup is billed. Readiness lowers the quote and the number of findings.'],
          ['Book early:', 'rush starts usually cost more. A planned slot gives you room to negotiate.'],
          ['Ask about the fix review:', 'a quote without it looks cheaper and then grows. Compare like with like.'],
          ['Check your grants:', 'if your team already holds an ecosystem grant, for example from the Solana Foundation, check whether its terms allow security work.'],
          ['Combine with a bug bounty later:', <>an audit before launch and a bounty after it catch different bugs. See <Link href="/blog/smart-contract-audit-vs-bug-bounty" className="text-blue-deep">audit vs bug bounty</Link>.</>],
        ]}
      />

      <H2>If you are not selected</H2>
      <P>
        Keep the audit date. A missed subsidy costs a share of one quote, a missed launch window
        often costs more. Tighten the scope, use the time to improve tests and documentation, and
        apply to the next cohort if the program runs one. Then check the rest of the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          Solana pre-launch security checklist
        </Link>{' '}
        so the audit is not the only thing standing between you and mainnet.
      </P>
    </BlogPost>
  );
}
