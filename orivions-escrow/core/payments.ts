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
import { toCents } from './fees';

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
  /**
   * Create a hold/payment-intent for a milestone. Returns partner's reference.
   * `idempotencyKey` is stable per milestone: calling again with the same key MUST
   * return the same reference and never create a second hold (retries are normal).
   */
  createHold(
    dealId: string,
    milestoneId: string,
    amountCents: number,
    currency: string,
    idempotencyKey: string
  ): Promise<string>;
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
  /** True if this webhook event was already processed. Read-only: it does NOT record the event. */
  hasEvent(eventId: string): Promise<boolean>;
  /**
   * Atomically (one DB transaction / compare-and-set) store `record` AND mark `eventId`
   * as processed, but only if the event was not processed yet and the stored record is
   * still in `expectedState`. Returns false (writes nothing) when either condition fails.
   * This is what makes a retried or concurrent webhook safe: an event is "seen" only
   * together with the state change it caused, never before.
   */
  commitEvent(eventId: string, record: PaymentRecord, expectedState: PaymentState): Promise<boolean>;
}

export type WebhookOutcome =
  | { ok: true; applied: boolean; milestoneId: string; newState: PaymentState }
  /**
   * retry=true: answer the partner with a 5xx so it redelivers (e.g. the event arrived
   * before our record exists). retry=false: permanent rejection, answer 4xx/2xx per your policy.
   */
  | { ok: false; reason: string; retry: boolean };

/**
 * The idempotent webhook processor. Rules:
 * - an event is marked processed only TOGETHER with its state change (commitEvent),
 *   so a failure before that leaves it retryable
 * - duplicate eventId → ok, applied:false (no-op, partner gets 200 so it stops retrying)
 * - unknown reference → error with retry:true (record may not be written yet; never invent records)
 * - illegal state transition → error retry:false, state untouched
 */
export async function processWebhook(store: PaymentStore, ev: NormalizedWebhookEvent): Promise<WebhookOutcome> {
  const duplicate = async (): Promise<WebhookOutcome> => {
    const rec = await store.getByReference(ev.reference);
    return { ok: true, applied: false, milestoneId: rec?.milestoneId ?? 'unknown', newState: rec?.state ?? 'none' };
  };
  if (await store.hasEvent(ev.eventId)) return duplicate();

  const rec = await store.getByReference(ev.reference);
  if (!rec) return { ok: false, reason: `Unknown payment reference: ${ev.reference}`, retry: true };

  const target: PaymentState =
    ev.kind === 'hold_funded' ? 'funded'
    : ev.kind === 'hold_failed' ? 'refunded'
    : ev.kind === 'release_confirmed' ? 'released'
    : 'refunded';

  if (!canTransitionPayment(rec.state, target)) {
    return { ok: false, reason: `Illegal payment transition ${rec.state} → ${target} (event ${ev.kind})`, retry: false };
  }
  const committed = await store.commitEvent(ev.eventId, { ...rec, state: target }, rec.state);
  if (!committed) {
    // Lost a race: either this very event was committed meanwhile (duplicate) or the state moved.
    if (await store.hasEvent(ev.eventId)) return duplicate();
    return { ok: false, reason: 'Payment state changed concurrently, retry', retry: true };
  }
  return { ok: true, applied: true, milestoneId: rec.milestoneId, newState: target };
}

// ---------------------------------------------------------------------------
// Funding gate
// ---------------------------------------------------------------------------

/**
 * V2 activation gate: a deal may be marked active only when EVERY milestone has a
 * payment record that is 'funded'. Hosts call this before the proposed → active
 * transition; otherwise an approval could arrive for money that never landed.
 */
export async function isDealFullyFunded(
  store: PaymentStore,
  dealId: string,
  milestoneIds: string[]
): Promise<boolean> {
  if (milestoneIds.length === 0) return false;
  const records = new Map((await store.listByDeal(dealId)).map((r) => [r.milestoneId, r]));
  return milestoneIds.every((id) => records.get(id)?.state === 'funded');
}

// ---------------------------------------------------------------------------
// PaymentProvider implementation over any PartnerClient
// ---------------------------------------------------------------------------

export function makePartnerPaymentProvider(client: PartnerClient, store: PaymentStore): PaymentProvider {
  return {
    kind: 'partner',
    async onDealActivated(deal: Deal, milestones: Milestone[]): Promise<PaymentResult> {
      // Resumable: milestones that already have a hold are skipped, and the partner call carries a
      // stable idempotency key, so a retry after a partial failure creates no duplicate or orphan holds.
      try {
        for (const m of milestones) {
          const existing = await store.get(m.id);
          if (existing?.reference) continue;
          const ref = await client.createHold(deal.id, m.id, toCents(m.amount), deal.currency, `${deal.id}:${m.id}`);
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
      try {
        await client.release(rec.reference);
      } catch (e) {
        return { ok: false, reference: rec.reference, error: e instanceof Error ? e.message : 'release failed' };
      }
      // state flips to 'released' only when the release_confirmed webhook lands - never optimistically.
      return { ok: true, reference: rec.reference };
    },
    async onDealClosed(deal: Deal, finalState: 'completed' | 'cancelled'): Promise<PaymentResult> {
      if (finalState !== 'cancelled') return { ok: true, reference: null };
      // Refund every hold that is still holding money (pending or funded).
      try {
        // Refund every hold even if one fails, then report all failures (one bad hold must not strand the rest).
        const failures: string[] = [];
        for (const rec of await store.listByDeal(deal.id)) {
          if (rec.reference && (rec.state === 'funded' || rec.state === 'funding_pending')) {
            try {
              await client.refund(rec.reference);
              // state flips to 'refunded' when refund_confirmed webhook lands.
            } catch (e) {
              failures.push(`${rec.reference}: ${e instanceof Error ? e.message : 'refund failed'}`);
            }
          }
        }
        return failures.length
          ? { ok: false, reference: null, error: `refund failed for ${failures.join('; ')}` }
          : { ok: true, reference: null };
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
  const byKey = new Map<string, string>();
  return {
    name: 'mock',
    calls,
    async createHold(dealId, milestoneId, amountCents, currency, idempotencyKey) {
      const known = byKey.get(idempotencyKey);
      if (known) return known; // same key → same hold, never a second one
      calls.push(`hold:${milestoneId}:${amountCents}:${currency}`);
      n += 1;
      const ref = `mock_ref_${dealId.slice(0, 4)}_${n}`;
      byKey.set(idempotencyKey, ref);
      return ref;
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
    async hasEvent(id) { return events.has(id); },
    async commitEvent(id, rec, expectedState) {
      if (events.has(id)) return false;
      if (byMilestone.get(rec.milestoneId)?.state !== expectedState) return false;
      events.add(id);
      byMilestone.set(rec.milestoneId, rec);
      if (rec.reference) byRef.set(rec.reference, rec);
      return true;
    },
  };
}
