import Link from 'next/link';
import BlogPost, { BulletList, Callout, H2, P, postMetadata } from '@/components/BlogPost';

const SLUG = 'solana-incident-response-plan';

export const metadata = postMetadata(SLUG);

export default function PostPage() {
  return (
    <BlogPost
      slug={SLUG}
      breadcrumbLabel="Solana incident response plan"
      answer="A Solana incident response plan is a short written document that says who decides, what you can switch off, whom you call and what you tell users when something goes wrong on a live program. Write it before launch, name one owner for each step, and test it once, because during an incident there is no time to design a process."
      glance={{
        caption: 'The seven parts of an incident response plan',
        head: ['Part', 'What to write down', 'Decide before launch'],
        rows: [
          ['Roles', 'Incident lead, technical lead, communications, legal contact', 'Names and backups, not job titles'],
          ['Severity levels', 'What counts as critical, high or low', 'Which level triggers a pause'],
          ['Containment', 'What you can pause, freeze or disable, and who holds the keys', 'Which instruction or key does it'],
          ['Fix path', 'How a patch is built, reviewed and deployed', 'Emergency route if upgrades sit behind a multisig or timelock'],
          ['Contacts', 'Auditor, RPC provider, security researchers, exchanges, legal', 'A reachable channel for each, tested'],
          ['Communication', 'Where and how often you update users', 'Draft messages and one official channel'],
          ['Review', 'Timeline, root cause, follow-up actions', 'Who writes it and when it is published'],
        ],
        note: 'One page that people can follow under stress is worth more than a long document nobody has read.',
      }}
      summary={[
        'Name an incident lead and a backup, and agree who is allowed to pause the program.',
        'Know in advance what you can switch off: an on-chain pause, a frontend, a keeper or a single market.',
        'Plan the emergency fix path, because a multisig and a timelock slow an upgrade on purpose.',
        'Keep a tested list of contacts: your auditor, RPC provider, legal adviser and security researchers.',
        'Publish one official channel for updates, and write the post-incident review after the fix.',
      ]}
      cta={{
        title: 'Need an auditor or a legal adviser on call?',
        text: 'Tell us what you are launching. We suggest providers we checked by hand that can support a live program, with a reason for each. Free for teams.',
        href: '/smart-match',
        label: 'Get matched →',
      }}
    >
      <P>
        Most teams think about security before launch and about incidents only when one happens. A
        live program holds user funds or controls something users depend on, so a bug, a leaked key
        or a failing dependency can turn into a loss within hours. A response plan does not prevent
        that, but it removes the delay and the confusion that make an incident worse.
      </P>

      <H2>1. Assign roles and decision rights</H2>
      <P>
        Pick an incident lead who can make the call to pause or contain, a technical lead who
        investigates and builds the fix, a person who communicates with users and partners, and a
        legal contact. Name a backup for each, since incidents do not wait for holidays. Write down
        who is allowed to trigger a pause without asking anyone, and for what kind of event.
      </P>

      <H2>2. Define severity levels</H2>
      <BulletList
        items={[
          ['Critical:', 'funds are at risk or being drained, or a privileged key is compromised. Contain first, investigate after.'],
          ['High:', 'a confirmed bug that could cause loss but is not being exploited, or a key that may be exposed. Fix quickly and decide whether to pause.'],
          ['Medium:', 'degraded behaviour, such as stale oracle data, failing keepers or an unreachable RPC provider, without direct loss.'],
          ['Low:', 'a report or an anomaly that needs a look but does not change how the program runs.'],
        ]}
      />
      <P>
        The point is to agree in advance which level triggers which action, so the first hour is not
        spent arguing about whether this is serious.
      </P>

      <H2>3. Know what you can contain</H2>
      <P>
        List every switch you have and who holds it. Some programs include a pause instruction or a
        way to disable a single market. Some depend on a keeper or a frontend that can be turned
        off. Others have no switch at all and the only option is a program upgrade or doing
        nothing. Check this before launch, because adding a pause later is itself a code change that
        needs review. A pause is also a trust decision, so tell users who can use it and when.
      </P>
      <P>
        If the{' '}
        <Link href="/solana-glossary/upgrade-authority" className="text-blue-deep">
          upgrade authority
        </Link>{' '}
        sits in a{' '}
        <Link href="/solana-glossary/multisig" className="text-blue-deep">multisig</Link>, make sure the
        signers can actually be reached quickly. Our guide on{' '}
        <Link href="/blog/solana-program-upgrade-authority-multisig" className="text-blue-deep">
          securing the upgrade authority
        </Link>{' '}
        covers the setup.
      </P>

      <H2>4. Plan the fix path</H2>
      <BulletList
        items={[
          ['Build and review:', 'who writes the patch, who reviews it, and whether your auditor can look at it on short notice. A rushed fix can add a new bug.'],
          ['Deploy:', 'how the new program version is built and deployed, and how users can verify it came from the published source (see the glossary entry on a verifiable build).'],
          ['Emergency route:', 'a timelock delays upgrades on purpose. Decide whether you have a separate emergency path, who may use it and how you explain it to users.'],
          ['Recovery:', 'how you check balances and state after the fix, and whether anything needs to be migrated or refunded.'],
        ]}
      />

      <H2>5. Keep a contact list that works</H2>
      <BulletList
        items={[
          ['Your auditor:', 'a direct contact and the terms for urgent work, ideally agreed before you need them.'],
          ['Infrastructure:', 'your RPC and node provider, because rate limits and failover matter during a spike.'],
          ['Security researchers:', 'a published way to reach you, such as a security.txt in the program or a bug bounty page, so a report reaches a person and not a public thread.'],
          ['Exchanges and token issuers:', 'some can flag or freeze funds when they are contacted quickly. Know whom to reach and what evidence they need.'],
          ['Legal adviser:', 'disclosure duties and communication rules differ by country, so ask a lawyer who knows your setup. This is not legal advice.'],
        ]}
      />

      <H2>6. Prepare the communication</H2>
      <P>
        Choose one official channel, such as a status page or a pinned post, and tell users where it
        is before anything happens. Keep early messages short and factual: what you know, what you
        have done, what users should do and when the next update comes. Do not guess about the cause
        or promise a result you cannot control. Draft templates in advance so the person writing is
        not starting from a blank page.
      </P>

      <Callout>
        <b>A first-hour checklist:</b> open an incident channel and name the lead; confirm what is
        happening and how far it reaches; contain (pause, disable or stop the keeper) if the severity
        calls for it; preserve logs and transaction signatures; notify the auditor and the legal
        contact; post the first public update; and set a time for the next one.
      </Callout>

      <H2>7. Test it and review afterwards</H2>
      <P>
        Run a short tabletop exercise before launch: pick a scenario, such as a leaked admin key or
        a bug in a withdraw instruction, and walk through the plan with the people named in it.
        You will find missing contacts and unclear decisions in an hour. After a real incident,
        write a review with the timeline, the cause, what worked, what did not and who owns each
        follow-up. Publishing a version of it builds trust.
      </P>

      <H2>How this fits with the rest of your security work</H2>
      <P>
        An audit lowers the chance of a bug, a{' '}
        <Link href="/blog/smart-contract-audit-vs-bug-bounty" className="text-blue-deep">
          bug bounty
        </Link>{' '}
        gives researchers a way to tell you, and{' '}
        <Link href="/blog/solana-program-monitoring-and-alerts" className="text-blue-deep">
          monitoring
        </Link>{' '}
        tells you that something is wrong. The response plan is what you do next. If you are still
        preparing for launch, use the{' '}
        <Link href="/blog/solana-pre-launch-security-checklist" className="text-blue-deep">
          pre-launch security checklist
        </Link>
        . To find an adviser for the legal side, read{' '}
        <Link href="/blog/how-to-choose-a-web3-lawyer-for-a-token-launch" className="text-blue-deep">
          how to choose a Web3 lawyer
        </Link>
        , and browse the{' '}
        <Link href="/solana-smart-contract-audits" className="text-blue-deep">
          Solana smart contract audit providers
        </Link>{' '}
        we have checked.
      </P>

      <P>
        Not sure who can upgrade your program today? Paste its address into the free{' '}
        <Link href="/tools/solana-program-check" className="text-blue-deep">
          upgrade authority checker
        </Link>
        .
      </P>
    </BlogPost>
  );
}
