import Link from 'next/link';

// Shared pieces for the early-access phase (see lib/directory.ts).

export function EarlyAccessBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-blue-light/40 bg-blue-light/10 px-3.5 py-1 text-xs font-semibold text-blue-deep ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-blue-light" />
      Early access
    </span>
  );
}

export function FoundingProviderCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-soft p-6 text-left">
      <div className="text-xs font-bold uppercase tracking-wide text-blue-deep">For providers</div>
      <div className="mt-1.5 font-heading text-lg font-semibold">Become a Founding Provider</div>
      <p className="mt-1 text-sm text-gray">
        We are verifying our first cohort of Solana service companies by hand.
      </p>
      {!compact && (
        <ul className="mt-3 space-y-1.5 text-sm text-[#27272E]">
          <li>★ Founding Provider badge, reserved for the first 20 verified companies</li>
          <li>✓ Free listing; a flat 10% success fee only on completed engagements</li>
          <li>→ First access to the briefs teams send us during early access</li>
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link
          href="/login?signup=provider"
          className="inline-block rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          Apply as a provider →
        </Link>
        <Link href="/founding-providers" className="text-sm font-semibold text-blue-deep">
          Learn more
        </Link>
      </div>
    </div>
  );
}
