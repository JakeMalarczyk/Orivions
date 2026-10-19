import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'freelancer-vs-agency-solana-development';

export const metadata = postMetadata(SLUG);

const ROWS: [string, string, string][] = [
  ['Best for', 'One well-scoped task one person can own', 'A full product needing several roles'],
  ['Cost per hour', 'Usually lower', 'Usually higher'],
  ['Cost per outcome', 'Lower for small scope', 'Often comparable or lower for large scope'],
  ['Speed to start', 'Fast', 'Slower, but more parallel work'],
  ['Roles covered', 'One', 'Programs, frontend, design, DevOps, PM'],
  ['Who coordinates', 'You', 'The agency'],
  ['Continuity risk', 'High if the person leaves', 'Lower, others can take over'],
  ['Accountability', 'Individual contract', 'One company contract'],
];

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Freelancer vs agency"
      summary={[
        'Freelancers suit well-scoped tasks one person can own, especially next to your own engineers.',
        'Agencies suit full products that need several roles, a deadline and one accountable contract.',
        'Compare cost per finished outcome, not per hour.',
        'Continuity is the hidden risk with a single freelancer on critical code.',
        'Many teams combine both: an agency for the build, a freelancer for review or extra capacity.',
      ]}
      cta={{
        title: 'Find verified Solana developers',
        text: 'Describe what you are building. Smart Match suggests verified development teams that fit, with a reason for each. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        &quot;Should we hire a freelancer or an agency?&quot; is usually asked as a question about
        price. It is really a question about scope and risk: how many roles the work needs, who will
        coordinate them, and what happens if a key person disappears halfway through.
      </P>

      <H2>The comparison</H2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-soft">
            <tr>
              <th className="p-3 font-semibold"> </th>
              <th className="p-3 font-semibold">Freelancer</th>
              <th className="p-3 font-semibold">Agency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ROWS.map(([k, f, a]) => (
              <tr key={k}>
                <td className="p-3 font-semibold">{k}</td>
                <td className="p-3 text-gray">{f}</td>
                <td className="p-3 text-gray">{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Hire a freelancer when</H2>
      <BulletList
        items={[
          ['The scope is small and clear:', 'a single program, a feature, a migration or a prototype.'],
          ['You can review the work:', 'someone on your team understands Solana well enough to check it.'],
          ['You need specialist depth:', 'for example a code review by someone who knows a specific protocol or pattern deeply.'],
          ['You need extra capacity:', 'temporary help next to an existing team.'],
        ]}
      />

      <H2>Hire an agency when</H2>
      <BulletList
        items={[
          ['You need several roles:', 'on-chain programs, frontend, design, infrastructure and project management.'],
          ['There is a fixed deadline:', 'an agency can put more people on the work in parallel.'],
          ['You have no technical lead:', 'the agency takes over coordination and technical decisions you cannot make yourself.'],
          ['Continuity matters:', 'critical code should not depend on one person’s availability.'],
        ]}
      />

      <Callout>
        <b>Whichever you choose,</b> the same rules apply: you own the code, the repository and the
        upgrade authority, and you pay per accepted milestone. See{' '}
        <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
          milestone payments for Web3 contracts
        </Link>
        .
      </Callout>

      <H2>Combining both</H2>
      <P>
        A common setup for funded teams: an agency builds the product, and an independent
        freelancer or a security firm reviews critical parts before the external audit. It costs a
        little more and catches problems early, while one accountable party still owns delivery.
      </P>
      <P>
        Before you send out requests, prepare a brief with our{' '}
        <Link href="/blog/solana-project-brief-template" className="text-blue-deep">
          Solana project brief template
        </Link>
        , and use{' '}
        <Link href="/blog/how-to-hire-a-solana-development-company" className="text-blue-deep">
          the twelve questions to ask a development company
        </Link>{' '}
        to compare answers.
      </P>
    </BlogPost>
  );
}
