import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'anchor-vs-native-rust-solana';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Anchor vs native Rust"
      summary={[
        'Anchor is the sensible default for most Solana applications: faster development, generated IDL and clients, and fewer account-validation mistakes.',
        'Native Rust gives full control over compute units, account layout and binary size, at the cost of writing every check by hand.',
        'Choose native for performance-critical primitives that will be called a lot, or when you need layouts Anchor makes awkward.',
        'Security depends more on the team and the audit than on the framework, but Anchor removes several common pitfalls by default.',
        'Ask any development company to justify its choice for your project instead of defaulting to what it always uses.',
      ]}
      cta={{
        title: 'Talk to verified Solana developers',
        text: 'Describe your program and constraints. Smart Match suggests verified teams with Anchor or native Rust experience. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Every Solana program is Rust compiled to the Solana runtime. The real question is how much
        of the plumbing you write yourself. Anchor is a framework that generates most of it; native
        programs (sometimes built with lightweight libraries such as Pinocchio) write it by hand.
        Both are used in production by serious teams. The right choice depends on what your program
        does and who will maintain it.
      </P>

      <H2>What Anchor gives you</H2>
      <BulletList
        items={[
          ['Declarative account validation:', 'you describe the accounts an instruction expects (signer, owner, seeds, mutability) and Anchor generates the checks.'],
          ['Discriminators:', 'each account type gets a unique prefix, which protects against passing one account type where another is expected.'],
          ['An IDL:', 'a machine-readable description of your program that generates TypeScript clients and makes integrations easier for other teams.'],
          ['Ecosystem and hiring:', 'most Solana developers, examples, tutorials and auditors are familiar with Anchor, which lowers onboarding and review cost.'],
        ]}
      />

      <H2>What native Rust gives you</H2>
      <BulletList
        items={[
          ['Compute efficiency:', 'without framework overhead, instructions can use noticeably fewer compute units, which matters for programs called in hot paths such as AMMs and order books.'],
          ['Control over layout:', 'you decide exactly how bytes are stored and parsed, including zero-copy patterns for very large accounts.'],
          ['Smaller binaries:', 'which reduces deployment cost and can matter for complex programs close to size limits.'],
          ['No framework constraints:', 'useful when your design does not fit the patterns Anchor assumes.'],
        ]}
      />

      <Callout>
        <b>The trade-off in one sentence:</b> Anchor buys development speed and safe defaults with
        some compute and flexibility; native Rust buys efficiency and control with more code you must
        write, test and audit yourself.
      </Callout>

      <H2>When to choose which</H2>
      <P>
        <b>Choose Anchor</b> for most applications: NFT and token projects, games, DAOs, payments,
        staking and the majority of DeFi applications where compute is not the bottleneck. You will
        ship faster, hire more easily and give auditors code they read every day.
      </P>
      <P>
        <b>Choose native Rust</b> for performance-critical primitives that other programs will call
        thousands of times, for programs where every compute unit affects user costs or
        composability, or when you need account layouts the framework makes awkward. Make sure the
        team has shipped native programs before; the absence of guard rails is the point, and the
        risk.
      </P>
      <P>
        A common middle path is to keep most of the system in Anchor and write one or two hot-path
        programs natively.
      </P>

      <H2>Security: does the framework matter?</H2>
      <P>
        Anchor does not make a program secure, and native programs are not insecure. Anchor removes
        several classic mistakes (missing owner checks, type confusion between accounts) unless you
        opt out of its checks. In native code, every one of those checks is your responsibility, so
        reviews take longer and depend more on experience. Either way, budget for an independent
        audit; see{' '}
        <Link href="/blog/solana-smart-contract-audit-cost" className="text-blue-deep">
          what drives the cost of a Solana audit
        </Link>
        .
      </P>

      <H2>What to ask a development company</H2>
      <P>
        Ask which approach they recommend for your program and why, what compute budget they expect
        per instruction, and which native or Anchor programs they have shipped to mainnet. A good
        team explains the trade-off for your case. More questions to ask are in{' '}
        <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
          how to hire a Solana development company
        </Link>
        , and you can compare verified teams on the{' '}
        <Link href="/solana-development-companies" className="text-blue-deep">
          Solana development companies
        </Link>{' '}
        page.
      </P>
    </BlogPost>
  );
}
