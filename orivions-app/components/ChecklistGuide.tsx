import Link from 'next/link';
import { H2 } from '@/components/BlogPost';

// Cross-links the Solana checklists with distinct anchor text, so each page has a
// clear job for search engines: program security before mainnet, Anchor code checks,
// token launch, audit preparation and Breakpoint launch week.
const CHECKLISTS = [
  {
    slug: 'solana-pre-launch-security-checklist',
    anchor: 'Solana pre-launch security checklist',
    job: 'keys, upgrade authority, deployment and monitoring before mainnet',
  },
  {
    slug: 'anchor-security-checklist',
    anchor: 'Solana Anchor security checklist',
    job: '16 code-level checks for Anchor programs',
  },
  {
    slug: 'solana-audit-readiness-checklist',
    anchor: 'Solana audit readiness checklist',
    job: 'what to prepare so the audit starts on time',
  },
  {
    slug: 'solana-token-launch-checklist',
    anchor: 'Solana token launch checklist',
    job: 'mint and freeze authorities, metadata, liquidity and legal review for a token',
  },
  {
    slug: 'breakpoint-2026-pre-launch-checklist',
    anchor: 'Breakpoint 2026 launch-week checklist',
    job: 'what to book and sort out before launching around the event',
  },
];

export default function ChecklistGuide({ current }: { current: string }) {
  return (
    <>
      <H2>Which Solana checklist do you need?</H2>
      <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-ink/90">
        {CHECKLISTS.filter((c) => c.slug !== current).map((c) => (
          <li key={c.slug}>
            <Link href={`/blog/${c.slug}`} className="text-blue-deep">
              {c.anchor}
            </Link>
            : {c.job}.
          </li>
        ))}
      </ul>
    </>
  );
}
