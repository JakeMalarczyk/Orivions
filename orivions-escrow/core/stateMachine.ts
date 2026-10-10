/**
 * Orivions Escrow - state machine.
 *
 * Pure functions only: no I/O, no dates generated inside (callers pass state,
 * we return verdicts). This is what makes the module trivially unit-testable
 * and what an auditor should read FIRST.
 *
 * The same transition table lives, deliberately duplicated, in
 * sql/001_escrow.sql as a Postgres trigger - DB is the last line of defense
 * if anyone bypasses the API. Keep both in sync; tests/parity.test.mjs
 * asserts the TS side against the table below.
 */

import type { Actor, Deal, DealState, EventType, Milestone, MilestoneState } from './types';

// ---------------------------------------------------------------------------
// Transition tables - the single human-readable source of truth
// ---------------------------------------------------------------------------

/** deal: from → { to: allowed actors } */
export const DEAL_TRANSITIONS: Record<DealState, Partial<Record<DealState, Actor[]>>> = {
  draft: {
    proposed: ['provider'],
    cancelled: ['provider'],
  },
  proposed: {
    active: ['client'], // acceptance is the client's act alone
    cancelled: ['provider', 'client'], // either side can walk away pre-acceptance
  },
  active: {
    completed: ['admin'], // system/admin finalizes once all milestones approved (guard below)
    cancelled: ['admin'], // mutual cancellation is recorded by admin after both confirm
    disputed: ['provider', 'client'],
  },
  disputed: {
    active: ['admin'], // dispute resolved, work continues
    cancelled: ['admin'], // dispute resolved by termination
    completed: ['admin'], // dispute resolved by acceptance of delivered work
  },
  completed: {}, // terminal
  cancelled: {}, // terminal
};

/** milestone: from → { to: allowed actors } */
export const MILESTONE_TRANSITIONS: Record<MilestoneState, Partial<Record<MilestoneState, Actor[]>>> = {
  pending: {
    delivered: ['provider'],
  },
  delivered: {
    approved: ['client'],
    rejected: ['client'],
  },
  rejected: {
    pending: ['provider'], // provider revises and the cycle repeats
  },
  approved: {}, // terminal
};

// ---------------------------------------------------------------------------
// Verdicts
// ---------------------------------------------------------------------------

export type Verdict = { ok: true } | { ok: false; reason: string };

const deny = (reason: string): Verdict => ({ ok: false, reason });
const allow: Verdict = { ok: true };

// ---------------------------------------------------------------------------
// Deal transitions
// ---------------------------------------------------------------------------

export function canTransitionDeal(
  deal: Pick<Deal, 'state'>,
  to: DealState,
  actor: Actor,
  milestones: Pick<Milestone, 'state'>[]
): Verdict {
  const allowedActors = DEAL_TRANSITIONS[deal.state]?.[to];
  if (!allowedActors) {
    return deny(`Illegal transition: ${deal.state} → ${to}`);
  }
  if (!allowedActors.includes(actor)) {
    return deny(`Actor '${actor}' cannot perform ${deal.state} → ${to}`);
  }

  // Structural guards beyond the table:
  if (to === 'proposed' && milestones.length === 0) {
    return deny('A deal needs at least one milestone before it can be proposed');
  }
  if (to === 'completed' && deal.state === 'active') {
    const unapproved = milestones.filter((m) => m.state !== 'approved').length;
    if (unapproved > 0) {
      return deny(`Cannot complete: ${unapproved} milestone(s) not yet approved`);
    }
  }
  return allow;
}

// ---------------------------------------------------------------------------
// Milestone transitions
// ---------------------------------------------------------------------------

export function canTransitionMilestone(
  deal: Pick<Deal, 'state'>,
  milestone: Pick<Milestone, 'state' | 'position'>,
  to: MilestoneState,
  actor: Actor,
  allMilestones: Pick<Milestone, 'state' | 'position'>[]
): Verdict {
  // Milestones only move while the deal is active.
  if (deal.state !== 'active') {
    return deny(`Milestones can change only in an active deal (deal is '${deal.state}')`);
  }

  const allowedActors = MILESTONE_TRANSITIONS[milestone.state]?.[to];
  if (!allowedActors) {
    return deny(`Illegal transition: ${milestone.state} → ${to}`);
  }
  if (!allowedActors.includes(actor)) {
    return deny(`Actor '${actor}' cannot perform ${milestone.state} → ${to}`);
  }

  // Strict ordering: a milestone can be approved only when every EARLIER
  // milestone is already approved. (Delivery out of order is allowed -
  // providers often work in parallel - but acceptance follows the agreed order
  // so the fee ledger reads unambiguously.)
  if (to === 'approved') {
    const earlierUnapproved = allMilestones.filter(
      (m) => m.position < milestone.position && m.state !== 'approved'
    );
    if (earlierUnapproved.length > 0) {
      return deny(
        `Milestone #${milestone.position} cannot be approved before earlier milestone(s): ` +
          earlierUnapproved.map((m) => `#${m.position}`).join(', ')
      );
    }
  }
  return allow;
}

// ---------------------------------------------------------------------------
// Event mapping - every successful transition emits exactly one event type
// ---------------------------------------------------------------------------

export function dealEventFor(from: DealState, to: DealState): EventType {
  if (to === 'proposed') return 'deal_proposed';
  if (to === 'active' && from === 'proposed') return 'deal_accepted';
  if (to === 'active' && from === 'disputed') return 'dispute_resolved';
  if (to === 'completed' && from === 'disputed') return 'dispute_resolved';
  if (to === 'completed') return 'deal_completed';
  if (to === 'cancelled' && from === 'disputed') return 'dispute_resolved';
  if (to === 'cancelled') return 'deal_cancelled';
  if (to === 'disputed') return 'deal_disputed';
  throw new Error(`No event mapped for deal ${from} → ${to}`);
}

export function milestoneEventFor(from: MilestoneState, to: MilestoneState): EventType {
  if (to === 'delivered') return 'milestone_delivered';
  if (to === 'approved') return 'milestone_approved';
  if (to === 'rejected') return 'milestone_rejected';
  if (to === 'pending' && from === 'rejected') return 'milestone_reopened';
  throw new Error(`No event mapped for milestone ${from} → ${to}`);
}
