import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'how-to-choose-a-web3-lawyer-for-a-token-launch';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Choosing a Web3 lawyer"
      answer="To choose a Web3 lawyer for a token launch, pick counsel who practises in the jurisdictions where your team and buyers are, can name past crypto matters, and understands how token design affects legal classification. Agree the scope and a fixed or capped fee, and talk to them before the token exists, not after launch. This is general information, not legal advice."
      glance={{
        caption: 'What a token launch usually needs from legal',
        head: ['Workstream', 'Why it matters', 'When'],
        rows: [
          ['Structure and entity', 'Who issues and who owns the IP', 'Before design'],
          ['Token classification', 'Decides which rules apply', 'Before design'],
          ['Terms and privacy', 'Rules for users and data', 'Before launch'],
          ['Sale or distribution documents', 'What buyers are told and agree to', 'Before any sale'],
          ['Contributor and IP agreements', 'Who owns the code and the brand', 'Early'],
          ['Marketing and KOL rules', 'Disclosure of paid promotion', 'Before campaigns'],
        ],
        note: 'General information only. Requirements differ by country and token: ask counsel in your jurisdiction.',
      }}
      summary={[
        'Talk to a lawyer before the token exists. Design and marketing wording both affect how it is classified.',
        'Choose counsel for your jurisdictions and your token type, with named crypto matters you can ask about.',
        'Agree scope first, then a fixed or capped fee for defined work.',
        'Check that the lawyer understands what your program can do, such as mint and freeze authorities.',
        'Walk away from guaranteed outcomes and from anyone who will not name who does the work.',
      ]}
      cta={{
        title: 'Find a verified legal and compliance firm',
        text: 'Describe your project and the countries you operate in. Smart Match suggests verified legal and compliance providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Token launches fail on legal grounds about as often as on technical ones: a token sold
        with promises it should not have carried, a missing licence for a service, a team structure
        nobody can explain to a regulator or an exchange. A good lawyer is cheaper before launch
        than after. This article explains what to look for. It is general information, not legal
        advice, and rules differ by country.
      </P>

      <H2>What a Web3 lawyer should cover</H2>
      <BulletList
        items={[
          ['Structure:', 'which entity issues the token and which one builds the product, and where they are based.'],
          ['Token classification:', 'whether the token falls under securities, payments or crypto-asset rules where you and your buyers are. In the EU, the MiCA regulation applies to many tokens and services, and its transition periods for existing service providers have run out.'],
          ['Documents:', 'terms of service, privacy policy, and any sale or purchase agreements. See our own pages for an example of the first two.'],
          ['IP and contributors:', 'who owns the code, the brand and the repositories, and what contributors signed.'],
          ['Licensing:', 'whether your service needs a licence, for example if you hold or move customer funds.'],
          ['Sanctions and AML:', 'who may use the product, and the policies a counterparty, an exchange or a bank will ask for.'],
        ]}
      />

      <H2>How to choose</H2>
      <BulletList
        items={[
          ['Jurisdiction fit:', 'counsel should practise where your team and your users are. For more than one country, ask how they coordinate with local lawyers and who bills what.'],
          ['Named crypto experience:', 'ask which token launches, licences or protocols they advised on, in general terms, and what their role was.'],
          ['Technical understanding:', 'a useful lawyer can read what your program lets the team do. A mint or freeze authority, an upgrade key or an admin role affect control, and control often affects classification.'],
          ['Who does the work:', 'ask who the partner is, who drafts, and how many hours each will spend.'],
          ['Fee structure:', 'fixed or capped fees for defined work, hourly with a monthly cap for open advice.'],
          ['Speed and availability:', 'a launch has dates. Ask for response times and who covers during holidays.'],
        ]}
      />

      <Callout>
        <b>Bring the code facts.</b> Before the first call, list who holds the mint, freeze and upgrade
        authorities and what each admin instruction does. Our{' '}
        <Link href="/blog/solana-token-launch-checklist" className="text-blue-deep">
          token launch checklist
        </Link>{' '}
        and the guide to the{' '}
        <Link href="/blog/solana-program-upgrade-authority-multisig" className="text-blue-deep">
          upgrade authority
        </Link>{' '}
        show what to prepare.
      </Callout>

      <H2>Questions to ask in the first call</H2>
      <BulletList
        items={[
          ['What would you want to know about the token before advising?', 'a good lawyer asks about rights, distribution and control early.'],
          ['What is in scope and what is not?', 'ask for the deliverables in writing, such as a classification memo or a document set.'],
          ['What could change your advice?', 'a good answer names facts, such as where you sell or how you market.'],
          ['What do you not do?', 'if they never say no to a question, be careful.'],
        ]}
      />

      <H2>Red flags</H2>
      <BulletList
        items={[
          ['Guaranteed outcomes:', 'nobody can guarantee a regulator\'s view of your token.'],
          ['No named lawyer:', 'a firm that will not say who handles your matter.'],
          ['Template-only service for a token sale:', 'documents copied from another project, with names swapped.'],
          ['Pressure to launch first and fix later:', 'structure and marketing are the hardest things to change after buyers arrive.'],
        ]}
      />

      <P>
        When you sign, keep the engagement structure simple and tie payment to deliverables, as in{' '}
        <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
          milestone payments for Web3 contracts
        </Link>
        . The{' '}
        <Link href="/blog/red-flags-hiring-web3-service-providers" className="text-blue-deep">
          red flags when hiring Web3 providers
        </Link>{' '}
        apply to lawyers too. To see legal and compliance firms that Orivions verified, visit{' '}
        <Link href="/solana-legal-compliance-firms" className="text-blue-deep">
          Solana legal and compliance firms
        </Link>
        .
      </P>
    </BlogPost>
  );
}
