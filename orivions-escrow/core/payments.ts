/**
 * Orivions Escrow - V2 payment core (partner-agnostic).
 *
 * What this is: the logic layer between the escrow state machine and ANY
 * custodial partner (Stripe, Circle, Solana-native USDC rails). The partner is
 * abstracted behind `PartnerClient` (3 calls). Picking a partner later means
 * writing one small adapter and passing the conformance suite in
 * tests/payments.test.mjs - nothing here changes.
 *
 * Two hard problems this file owns (and tests prove):
 * 1. PAYMENT STATE MACHINE - a milestone's money moves
 *    none → funded → released | refunded, strictly forward, and must stay
 *    consistent with the milestone's own state.
 * 2. WEBHOOK IDEMPOTENCY - partners retry webhooks; processing the same event
 *    twice must be a no-op, and out-of-order/unknown events must be rejected
 *    without corrupting state. This is where real-world integrations break.
 */

import type { Deal, Milestone, PaymentProvider, PaymentResult } from './types';

// ---------------------------------------------------------------------------
// Payment states (per milestone)
// ---------------------------------------------------------------------------

export const PAYMENT_STATES = ['none', 'funding_pending', 'funded', 'released', 'refunded'] as const;
export type PaymentState = (typeof PAYMENT_STATES)[number];

/** from → allowed targets. Strictly forward; money never moves "back". */
export const PAYMENT_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  none: ['funding_pending'],
  funding_pending: ['funded', 'refunded'], // refunded = funding failed/expired
  funded: ['released', 'refunded'],
  released: [],
  refunded: [],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  return PAYMENT_TRANSITIONS[from].includes(to);
}

// ---------------------------------------------------------------------------
// Partner abstraction - the ONLY surface a real adapter implements
// ---------------------------------------------------------------------------

export interface PartnerClient {
  readonly name: string;
  /** Create a hold/payment-intent for a milestone. Returns partner's reference. */
  createHold(dealId: string, milestoneId: string, amountCents: number, currency: string): Promise<string>;
  /** Release held funds to the provider. */
  release(reference: string): Promise<void>;
  /** Refund held funds to the client. */
  refund(reference: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Webhook events - normalized shape every adapter maps its partner's into
// ---------------------------------------------------------------------------

export interface NormalizedWebhookEvent {
  /** Partner's unique event id - the idempotency key. */
  eventId: string;
  reference: string; // matches createHold's return
  kind: 'hold_funded' | 'hold_failed' | 'release_confirmed' | 'refund_confirmed';
}

export interface PaymentRecord {
  dealId: string;
  milestoneId: string;
  reference: string | null;
  state: PaymentState;
}

/** Host persists these; core stays storage-agnostic. */
export interface PaymentStore {
  get(milestoneId: string): Promise<PaymentRecord | null>;
  listByDeal(dealId: string): Promise<PaymentRecord[]>;
  getByReference(reference: string): Promise<PaymentRecord | null>;
  put(record: PaymentRecord): Promise<void>;
  /** Returns true if eventId was seen before; records it otherwise. Atomic. */
  seenEvent(eventId: string): Promise<boolean>;
}

export type WebhookOutcome =
  | { ok: true; applied: boolean; milestoneId: string; newState: PaymentState }
  | { ok: false; reason: string };

/**
 * The idempotent webhook processor. Rules:
 * - duplicate eventId → ok, applied:false (no-op, partner gets 200 so it stops retrying)
 * - unknown reference → error (never invent records from webhooks)
 * - illegal state transition → error, state untouched
 */
export async function processWebhook(store: PaymentStore, ev: NormalizedWebhookEvent): Promise<WebhookOutcome> {
  if (await store.seenEvent(ev.eventId)) {
    const rec = await store.getByReference(ev.reference);
    return { ok: true, applied: false, milestoneId: rec?.milestoneId ?? 'unknown', newState: rec?.state ?? 'none' };
  }
  const rec = await store.getByReference(ev.reference);
  if (!rec) return { ok: false, reason: `Unknown payment reference: ${ev.reference}` };

  const target: PaymentState =
    ev.kind === 'hold_funded' ? 'funded'
    : ev.kind === 'hold_failed' ? 'refunded'
    : ev.kind === 'release_confirmed' ? 'released'
    : 'refunded';

  if (!canTransitionPayment(rec.state, target)) {
    return { ok: false, reason: `Illegal payment transition ${rec.state} → ${target} (event ${ev.kind})` };
  }
  await store.put({ ...rec, state: target });
  return { ok: true, applied: true, milestoneId: rec.milestoneId, newState: target };
}

// ---------------------------------------------------------------------------
// PaymentProvider implementation over any PartnerClient
// ---------------------------------------------------------------------------

export function makePartnerPaymentProvider(client: PartnerClient, store: PaymentStore): PaymentProvider {
  return {
    kind: 'partner',
    async onDealActivated(deal: Deal, milestones: Milestone[]): Promise<PaymentResult> {
      try {
        for (const m of milestones) {
          const ref = await client.createHold(deal.id, m.id, Math.round(m.amount * 100), deal.currency);
          await store.put({ dealId: deal.id, milestoneId: m.id, reference: ref, state: 'funding_pending' });
        }
        return { ok: true, reference: null };
      } catch (e) {
        return { ok: false, reference: null, error: e instanceof Error ? e.message : 'createHold failed' };
      }
    },
    async onMilestoneApproved(_deal: Deal, milestone: Milestone): Promise<PaymentResult> {
      const rec = await store.get(milestone.id);
      if (!rec?.reference) return { ok: false, reference: null, error: 'No payment record for milestone' };
      if (rec.state !== 'funded') return { ok: false, reference: rec.reference, error: `Cannot release from state '${rec.state}'` };
      await client.release(rec.reference);
      // state flips to 'released' only when the release_confirmed webhook lands - never optimistically.
      return { ok: true, reference: rec.reference };
    },
    async onDealClosed(deal: Deal, finalState: 'completed' | 'cancelled'): Promise<PaymentResult> {
      if (finalState !== 'cancelled') return { ok: true, reference: null };
      // Refund every hold that is still holding money (pending or funded).
      try {
        for (const rec of await store.listByDeal(deal.id)) {
          if (rec.reference && (rec.state === 'funded' || rec.state === 'funding_pending')) {
            await client.refund(rec.reference);
            // state flips to 'refunded' when refund_confirmed webhook lands.
          }
        }
        return { ok: true, reference: null };
      } catch (e) {
        return { ok: false, reference: null, error: e instanceof Error ? e.message : 'refund failed' };
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Mock partner - in-memory, deterministic; powers the conformance suite NOW
// ---------------------------------------------------------------------------

export function makeMockPartner(): PartnerClient & { calls: string[] } {
  let n = 0;
  const calls: string[] = [];
  return {
    name: 'mock',
    calls,
    async createHold(dealId, milestoneId, amountCents, currency) {
      calls.push(`hold:${milestoneId}:${amountCents}:${currency}`);
      n += 1;
      return `mock_ref_${dealId.slice(0, 4)}_${n}`;
    },
    async release(reference) { calls.push(`release:${reference}`); },
    async refund(reference) { calls.push(`refund:${reference}`); },
  };
}

export function makeMemoryStore(): PaymentStore {
  const byMilestone = new Map<string, PaymentRecord>();
  const byDeal = new Map<string, Set<string>>();
  const byRef = new Map<string, PaymentRecord>();
  const events = new Set<string>();
  return {
    async get(id) { return byMilestone.get(id) ?? null; },
    async getByReference(ref) { return byRef.get(ref) ?? null; },
    async put(rec) {
      byMilestone.set(rec.milestoneId, rec);
      if (rec.reference) byRef.set(rec.reference, rec);
      if (!byDeal.has(rec.dealId)) byDeal.set(rec.dealId, new Set());
      byDeal.get(rec.dealId)!.add(rec.milestoneId);
    },
    async listByDeal(dealId) {
      return [...(byDeal.get(dealId) ?? [])].map((id) => byMilestone.get(id)!).filter(Boolean);
    },
    async seenEvent(id) {
      if (events.has(id)) return true;
      events.add(id);
      return false;
    },
  };
}
