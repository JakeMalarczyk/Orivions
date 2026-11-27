import Link from 'next/link';
import PageHero from '@/components/PageHero';

// No live supply or pricing numbers are shown: the early-access page only points to the
// free calculators and to the contact form.
export default function InsightsClient() {
  return (
    <>
      <PageHero
        align="center"
        eyebrow="Market insights"
        title="Solana Business Infrastructure: Market Insights"
        lede="Plan your budget with our free calculators. We can also put together a tailored market view on request."
      />
      <div className="mx-auto max-w-3xl px-8 pb-20 pt-12 text-center">
        <div className="grid gap-3 text-left sm:grid-cols-2">
          <Link href="/tools/solana-audit-cost-calculator" className="block rounded-2xl border border-line p-5 hover:border-blue-deep">
            <span className="font-semibold">Solana audit cost calculator →</span>
            <span className="mt-1 block text-sm text-gray">Price range and timeline for auditing your programs.</span>
          </Link>
          <Link href="/tools/solana-dapp-cost-calculator" className="block rounded-2xl border border-line p-5 hover:border-blue-deep">
            <span className="font-semibold">Solana dApp cost calculator →</span>
            <span className="mt-1 block text-sm text-gray">Build cost, timeline and maintenance for your dApp.</span>
          </Link>
        </div>
        <div className="mt-8 rounded-2xl bg-ink p-7 text-white">
          <h3 className="font-heading text-lg font-semibold">Need data for a report or program?</h3>
          <p className="mt-2 text-sm text-white/70">
            We can put together a tailored market view for accelerators, VCs and grant programs.
          </p>
          <Link href="/#ask" className="mt-3.5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">
            Get in touch
          </Link>
        </div>
      </div>
    </>
  );
}
