/**
 * Orivions Escrow - domain types.
 *
 * Design notes (read before changing anything):
 * - This module is STANDALONE. It imports nothing from the main app and the
 *   main app imports only from `core/index.ts`. Attach/detach = add/remove
 *   the folder + run/rollback one SQL migration.
 * - V1 scope: milestone tracking + state machine + fee accounting + audit log.
 *   NO custody of funds. Money moves outside the platform; the module records
 *   and enforces the agreed process. The `PaymentProvider` interface is the
 *   single seam where a custodial partner (V2) or an on-chain program (V3)
 *   plugs in later - nothing else should need to change.
 * - Every state transition is validated twice, on purpose: in TypeScript
 *   (core/stateMachine.ts) and in Postgres (sql/001_escrow.sql trigger).
 *   The SQL trigger is the last line of defense; TS gives good errors early.
 *   Both MUST encode the same table of transitions - the unit tests assert
 *   the TS side, and the SQL file contains the same table as a comment for
 *   auditors to diff by eye.
 */

// ---------------------------------------------------------------------------
// Deal
// ---------------------------------------------------------------------------

export const DEAL_STATES = [
  'draft', // provider is assembling the offer; invisible to client
  'proposed', // sent to client; awaiting acceptance
  'active', // client accepted; milestones in progress
  'completed', // all milestones approved; fee due
  'cancelled', // terminated before completion by either party (from draft/proposed) or by agreement (from active)
  'disputed', // either party raised a dispute from active; resolved by admin
] as const;
export type DealState = (typeof DEAL_STATES)[number];

export const MILESTONE_STATES = [
  'pending', // agreed, work not yet delivered
  'delivered', // provider marked as delivered; awaiting client review
  'approved', // client accepted the delivery
  'rejected', // client rejected; goes back to provider (→ pending after revision)
] as const;
export type MilestoneState = (typeof MILESTONE_STATES)[number];

/** Who is performing an action. Admin = Orivions operator (service role). */
export const ACTORS = ['provider', 'client', 'admin'] as const;
export type Actor = (typeof ACTORS)[number];

export interface Milestone {
  id: string;
  dealId: string;
  /** 1-based position; milestones are approved strictly in order. */
  position: number;
  title: string;
  description: string | null;
  /** Amount in the deal's currency, minor-unit-free (e.g. 1500.00 USD). */
  amount: number;
  state: MilestoneState;
  deliveredAt: string | null;
  approvedAt: string | null;
}

export interface Deal {
  id: string;
  /** companies.id of the provider (auth.uid on the provider side). */
  providerId: string;
  /** Client is identified by verified session e-mail - same rule as leads RLS. */
  clientEmail: string;
  title: string;
  description: string | null;
  currency: 'USD' | 'USDC';
  state: DealState;
  /**
   * Success-fee rate SNAPSHOTTED at proposal time (0.10 flat from the
   * company_fee_rate view). Immutable afterwards, so a mid-deal subscription
   * change never re-prices an in-flight deal. Auditors: this is intentional.
   */
  feeRate: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Events - append-only audit trail
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  'deal_created',
  'deal_proposed',
  'deal_accepted',
  'deal_completed',
  'deal_cancelled',
  'deal_disputed',
  'dispute_resolved',
  'milestone_delivered',
  'milestone_approved',
  'milestone_rejected',
  'milestone_reopened',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface EscrowEvent {
  id: string;
  dealId: string;
  milestoneId: string | null;
  type: EventType;
  actor: Actor;
  /** Free-form context (rejection reason, dispute note). Never trusted as logic input. */
  note: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Payment seam (V2/V3 plug point)
// ---------------------------------------------------------------------------

/**
 * The ONLY interface future custodial integrations implement.
 * V1 ships `manualPaymentProvider` (records intent, moves no money).
 * V2 (payment partner) and V3 (on-chain program) implement the same three
 * hooks; core logic and UI stay untouched.
 */
export interface PaymentProvider {
  readonly kind: 'manual' | 'partner' | 'onchain';
  /** Called when a deal becomes active. May reserve/lock funds in V2/V3. */
  onDealActivated(deal: Deal, milestones: Milestone[]): Promise<PaymentResult>;
  /** Called when a milestone is approved. May release funds in V2/V3. */
  onMilestoneApproved(deal: Deal, milestone: Milestone): Promise<PaymentResult>;
  /** Called on cancellation/dispute resolution. May refund in V2/V3. */
  onDealClosed(deal: Deal, finalState: 'completed' | 'cancelled'): Promise<PaymentResult>;
}

export interface PaymentResult {
  ok: boolean;
  /** External reference (transfer id, tx signature). Null for manual. */
  reference: string | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Fee accounting result
// ---------------------------------------------------------------------------

export interface FeeBreakdown {
  /** Sum of all milestone amounts. */
  totalAmount: number;
  feeRate: number;
  /** Rounded to 2 decimals, half-up - must match SQL view exactly. */
  feeAmount: number;
  providerNet: number;
}
