'use client';

import { useState } from 'react';
import type { ConciergeRequest } from './LeadInbox';

// Requests per client offer page. Every offer form posts to /api/concierge with its own
// source, stored in concierge_requests.category, so this is a plain count by category.
// Visitors come from the Traffic data (top 10 pages, last 30 days); an offer outside the
// top 10 shows a dash.

const OFFERS: { source: string; label: string; path: string }[] = [
  { source: 'audit-quotes', label: 'Small Solana audit quotes', path: '/solana-audit-quotes' },
  { source: 'audit-fixes', label: 'Audit fixes and multisig', path: '/solana-audit-fixes' },
  { source: 'dapp-quotes', label: 'dApp development quotes', path: '/solana-dapp-development-quotes' },
  { source: 'rpc-match', label: 'RPC provider match', path: '/solana-rpc-provider-match' },
  { source: 'market-maker-offers', label: 'Market maker offers', path: '/crypto-market-maker-offers' },
  { source: 'token-launch-package', label: 'Token launch package', path: '/token-launch-package' },
  { source: 'token-legal-review', label: 'Token launch legal review', path: '/token-launch-legal-review' },
];

const DAY = 86_400_000;

export default function OffersPanel({
  concierge,
  pages,
}: {
  concierge: ConciergeRequest[];
  pages: { path: string; visitors: number }[];
}) {
  // Fixed when the panel mounts, so renders stay pure.
  const [now] = useState(() => Date.now());
  const offerSources = new Set(OFFERS.map((o) => o.source));

  const rows = OFFERS.map((o) => {
    const reqs = concierge.filter((c) => c.category === o.source);
    const age = (c: ConciergeRequest) => now - new Date(c.created_at).getTime();
    const visitors = pages.find((p) => p.path === o.path)?.visitors;
    const last30 = reqs.filter((c) => age(c) <= 30 * DAY).length;
    return {
      ...o,
      d7: reqs.filter((c) => age(c) <= 7 * DAY).length,
      d30: last30,
      all: reqs.length,
      open: reqs.filter((c) => c.status === 'new' || c.status === 'in_progress').length,
      last: reqs[0]?.created_at,
      visitors,
      rate: visitors ? `${Math.round((last30 / visitors) * 1000) / 10}%` : '-',
    };
  });

  const other = new Map<string, number>();
  for (const c of concierge) {
    const key = c.category && !offerSources.has(c.category) ? c.category : !c.category ? '(none)' : null;
    if (key) other.set(key, (other.get(key) ?? 0) + 1);
  }

  const th = 'px-4 py-3 font-semibold';
  const td = 'px-4 py-3';

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft text-left text-xs uppercase text-gray-soft">
              <th className={th}>Offer</th>
              <th className={th}>Requests 7d</th>
              <th className={th}>Requests 30d</th>
              <th className={th}>All</th>
              <th className={th}>Open</th>
              <th className={th}>Visitors 30d</th>
              <th className={th}>Request rate</th>
              <th className={th}>Last request</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.source} className="border-b border-line last:border-0">
                <td className={td}>
                  <a href={r.path} target="_blank" rel="noopener" className="font-semibold text-ink hover:text-blue-deep">
                    {r.label}
                  </a>
                  <div className="text-xs text-gray-soft">{r.source}</div>
                </td>
                <td className={`${td} tabular-nums`}>{r.d7}</td>
                <td className={`${td} tabular-nums`}>{r.d30}</td>
                <td className={`${td} tabular-nums`}>{r.all}</td>
                <td className={`${td} tabular-nums ${r.open > 0 ? 'font-semibold text-danger' : ''}`}>{r.open}</td>
                <td className={`${td} tabular-nums`}>{r.visitors ?? '-'}</td>
                <td className={`${td} tabular-nums`}>{r.rate}</td>
                <td className={td}>{r.last ? new Date(r.last).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-soft">
        Visitors come from the Traffic tab (top 10 pages of the last 30 days). A dash means the page is not in the top 10 yet.
        Open = status new or in progress in the Leads tab.
      </p>

      <div>
        <h3 className="font-heading text-lg font-semibold">Other request sources</h3>
        {other.size === 0 ? (
          <p className="mt-2 text-sm text-gray">None yet.</p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {[...other.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <li key={k} className="flex justify-between rounded-xl border border-line bg-white px-4 py-2.5 text-sm">
                  <span>{k}</span>
                  <span className="font-semibold tabular-nums">{n}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
