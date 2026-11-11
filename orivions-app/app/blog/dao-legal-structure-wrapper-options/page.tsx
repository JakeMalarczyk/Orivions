import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'dao-legal-structure-wrapper-options';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="DAO legal structure"
      answer="A DAO needs a legal wrapper when it signs contracts, holds assets off-chain, pays contributors or wants its members protected from personal liability. Without one, some jurisdictions may treat it as a general partnership. Common wrappers are a Wyoming DAO LLC, a Marshall Islands DAO LLC, a Cayman foundation company and a Swiss association or foundation. The right choice depends on what the DAO does and where its people are."
      glance={{
        caption: 'Common legal wrappers for a DAO',
        head: ['Wrapper', 'Where', 'Typical use'],
        rows: [
          ['DAO LLC', 'Wyoming, US (state law from 2021)', 'DAOs that want an LLC with on-chain governance recognised in its rules'],
          ['DAO LLC', 'Marshall Islands (law from 2022)', 'DAOs that want a non-US company form built for DAOs'],
          ['Foundation company', 'Cayman Islands (law from 2017)', 'Token or ecosystem foundations with no owners'],
          ['Association or foundation', 'Switzerland', 'Protocol foundations and community bodies'],
          ['No entity', 'Anywhere', 'Fastest, but members may carry personal liability'],
        ],
        note: 'Rules change and depend on your facts. Treat this as a map for the conversation with your lawyer, not as advice.',
      }}
      summary={[
        'A wrapper is a legal entity that acts for the DAO off-chain: it signs contracts, opens accounts, employs or pays people and limits liability.',
        'With no wrapper, regulators or courts in some places may treat a DAO as a general partnership or an unincorporated association.',
        'There is no single best structure. It depends on what the DAO does, where members and contributors live, and what you need to limit.',
        'A wrapper does not by itself solve token, securities, tax or anti-money-laundering questions.',
        'Hire a lawyer who has worked on DAOs and ask for a written recommendation.',
      ]}
      cta={{
        title: 'Find a Web3 legal advisor',
        text: 'Describe your DAO, token and where your team sits. Smart Match suggests verified legal and compliance providers with a reason for each match. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Most DAOs start as a multisig, a Discord and a shared goal. That works until the DAO needs
        to sign a contract with a service provider, pay a contributor in fiat, open a bank account or
        protect the people who run it. At that point the lack of a legal entity becomes a problem,
        because the law needs someone to hold the rights and the duties.
      </P>

      <H2>What a legal wrapper does</H2>
      <BulletList
        items={[
          ['Signs contracts:', 'with auditors, developers, agencies and exchanges. A DAO without an entity usually cannot sign in its own name.'],
          ['Holds off-chain assets:', 'a bank account, intellectual property, trademarks and domain names.'],
          ['Pays contributors:', 'with proper agreements instead of informal promises.'],
          ['Limits liability:', 'so members and delegates are not personally exposed for the obligations of the DAO, to the extent the chosen law allows.'],
        ]}
      />

      <H2>Why no wrapper can be risky</H2>
      <P>
        Where no entity exists, the law may fill the gap. In the US, a federal regulator and courts
        have in some cases treated DAOs as unincorporated associations or general partnerships, which
        can expose participants to personal liability. Whether that applies to your DAO depends on
        its facts and on the law that governs it, which is exactly the question to ask a lawyer.
      </P>

      <H2>Common wrapper options</H2>
      <P>
        The table above lists the structures teams most often discuss. A few practical points:
      </P>
      <BulletList
        items={[
          ['DAO LLCs:', 'Wyoming and the Marshall Islands have laws written for DAOs, which let the rules of the LLC refer to on-chain governance. They are newer, so there is less case law.'],
          ['Foundation companies:', 'a foundation has no shareholders. Its directors or supervisors act under its charter, which suits an entity that supports a protocol or ecosystem rather than owning it.'],
          ['Swiss structures:', 'associations and foundations are used by several well-known crypto projects and have a long history, with their own formation and supervision rules.'],
          ['Two layers:', 'many projects use a foundation for the protocol and a separate operating company for the team. Each does a different job.'],
        ]}
      />

      <H2>How to choose</H2>
      <BulletList
        items={[
          ['What the DAO does:', 'builds software, funds grants, manages a treasury, issues a token. Each points to different structures.'],
          ['Who is involved:', 'where members, delegates and contributors live, because their local rules and taxes apply.'],
          ['What you must limit:', 'liability of the people who sign, of delegates, or of token holders.'],
          ['Costs and upkeep:', 'formation fees, annual filings, local directors or agents, accounting and audits.'],
          ['Token plans:', 'a token raises securities and consumer-protection questions that the wrapper does not answer.'],
        ]}
      />

      <Callout>
        <b>Questions to ask a lawyer:</b> which structure do you recommend for our activities and
        why? What exactly does it protect, and what does it not? What are the formation and yearly
        costs? Who signs for the entity, and how do on-chain votes bind it? Which parts of our token
        plan need separate advice?
      </Callout>

      <H2>What a wrapper does not solve</H2>
      <BulletList
        items={[
          ['Token and securities law:', 'whether and where a token is regulated.'],
          ['Tax:', 'for the entity, the treasury, contributors and token holders.'],
          ['Anti-money-laundering and sanctions rules:', 'duties can apply to the entity and its service providers.'],
          ['Governance in practice:', 'a wrapper on paper does not fix unclear decision rights or key-holder risk.'],
        ]}
      />

      <P>
        Start with a lawyer who has done this before. Our guide to{' '}
        <Link href="/blog/how-to-choose-a-web3-lawyer-for-a-token-launch" className="text-blue-deep">
          choosing a Web3 lawyer
        </Link>{' '}
        covers what to ask, the{' '}
        <Link href="/blog/solana-token-launch-checklist" className="text-blue-deep">
          Solana token launch checklist
        </Link>{' '}
        lists the legal items to settle before a token, and once the entity exists, structure vendor
        contracts with{' '}
        <Link href="/blog/milestone-payments-web3-service-contracts" className="text-blue-deep">
          milestone payments and escrow
        </Link>
        . You can browse{' '}
        <Link href="/solana-legal-compliance-firms" className="text-blue-deep">
          crypto lawyers and compliance firms for Solana
        </Link>{' '}
        on Orivions. This article is general information, not legal advice.
      </P>
    </BlogPost>
  );
}
