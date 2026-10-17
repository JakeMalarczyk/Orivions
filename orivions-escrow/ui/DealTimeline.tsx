'use client';

/**
 * Orivions Escrow, drop-in UI (React/Tailwind, same tokens as the host app).
 *
 * ATTACH: copy to `components/escrow/DealTimeline.tsx`; render inside the
 * provider or client dashboard with the viewer role and data fetched by the
 * host (this component does no fetching, it renders and calls back).
 * Visual language follows the Orivions brandbook: ink/blue-deep/line/bg-soft.
 */

import type { Deal, FeeBreakdown, Milestone } from '@/escrow/core';

const DEAL_BADGE: Record<Deal['state'], { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-bg-soft text-gray' },
  proposed: { label: 'Awaiting acceptance', cls: 'bg-[#FEF3E8] text-[#B45309]' },
  active: { label: 'Active', cls: 'bg-[#E8F0FE] text-blue-deep' },
  completed: { label: 'Completed', cls: 'bg-[#E8F5EE] text-[#1FA971]' },
  cancelled: { label: 'Cancelled', cls: 'bg-bg-soft text-gray-soft' },
  disputed: { label: 'Disputed', cls: 'bg-[#FDEBE9] text-[#E4574C]' },
};

const MS_BADGE: Record<Milestone['state'], { label: string; cls: string }> = {
  pending: { label: 'In progress', cls: 'bg-bg-soft text-gray' },
  delivered: { label: 'Delivered: review', cls: 'bg-[#FEF3E8] text-[#B45309]' },
  approved: { label: '✓ Approved', cls: 'bg-[#E8F5EE] text-[#1FA971]' },
  rejected: { label: 'Changes requested', cls: 'bg-[#FDEBE9] text-[#E4574C]' },
};

export interface DealTimelineProps {
  deal: Deal;
  milestones: Milestone[];
  fees: FeeBreakdown;
  /** Which side of the table the viewer sits on (host derives from session). */
  viewer: 'provider' | 'client';
  /** Host wires this to POST /api/escrow. Component stays fetch-free. */
  onMilestoneAction: (milestoneId: string, to: Milestone['state']) => void;
  onDealAction: (to: Deal['state']) => void;
}

export default function DealTimeline({
  deal, milestones, fees, viewer, onMilestoneAction, onDealAction,
}: DealTimelineProps) {
  const badge = DEAL_BADGE[deal.state];
  const sorted = [...milestones].sort((a, b) => a.position - b.position);
  const firstUnapproved = sorted.find((m) => m.state !== 'approved')?.position ?? Infinity;

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold">{deal.title}</h3>
          <p className="mt-0.5 text-xs text-gray-soft">
            {deal.currency} · fee {(deal.feeRate * 100).toFixed(0)}% (locked at proposal)
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* Milestones */}
      <ol className="mt-5 space-y-3">
        {sorted.map((m) => {
          const mb = MS_BADGE[m.state];
          const canApprove = viewer === 'client' && m.state === 'delivered' && m.position <= firstUnapproved;
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  <span className="text-gray-soft">#{m.position}</span> {m.title}
                </div>
                <div className="mt-0.5 text-xs text-gray">
                  {m.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${mb.cls}`}>{mb.label}</span>
                {viewer === 'provider' && m.state === 'pending' && (
                  <button onClick={() => onMilestoneAction(m.id, 'delivered')}
                    className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                    Mark delivered
                  </button>
                )}
                {viewer === 'provider' && m.state === 'rejected' && (
                  <button onClick={() => onMilestoneAction(m.id, 'pending')}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">
                    Resume work
                  </button>
                )}
                {canApprove && (
                  <>
                    <button onClick={() => onMilestoneAction(m.id, 'approved')}
                      className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button onClick={() => onMilestoneAction(m.id, 'rejected')}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">
                      Request changes
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Fee summary, mirrors escrow_deal_fees view */}
      <div className="mt-5 flex flex-wrap gap-6 rounded-xl bg-bg-soft p-4 text-sm">
        <div><span className="text-gray-soft">Total</span>{' '}
          <b>{fees.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</b></div>
        <div><span className="text-gray-soft">Orivions fee</span>{' '}
          <b>{fees.feeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</b></div>
        <div><span className="text-gray-soft">Provider receives</span>{' '}
          <b className="text-[#1FA971]">{fees.providerNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</b></div>
      </div>

      {/* Deal-level actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {viewer === 'provider' && deal.state === 'draft' && (
          <button onClick={() => onDealAction('proposed')}
            className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white">
            Send to client
          </button>
        )}
        {viewer === 'client' && deal.state === 'proposed' && (
          <button onClick={() => onDealAction('active')}
            className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white">
            Accept deal
          </button>
        )}
        {deal.state === 'proposed' && (
          <button onClick={() => onDealAction('cancelled')}
            className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-gray">
            Cancel
          </button>
        )}
        {deal.state === 'active' && (
          <button onClick={() => onDealAction('disputed')}
            className="rounded-lg border border-[#E4574C]/40 px-4 py-2 text-xs font-semibold text-[#E4574C]">
            Raise a dispute
          </button>
        )}
      </div>
    </div>
  );
}
