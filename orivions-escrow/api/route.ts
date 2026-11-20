/**
 * Orivions Escrow - Next.js API adapter (drop-in).
 *
 * ATTACH: copy to `app/api/escrow/route.ts` in the host Next.js app.
 * Deliberately THIN: validate input → identity → core verdict → ONE atomic RPC
 * (state change + audit event in a single transaction) → payment hook.
 * All business rules live in core/stateMachine.ts (tested) and are enforced again
 * by DB triggers (sql/001_escrow.sql). This file must never grow rules.
 *
 * Endpoint: POST /api/escrow
 * Body: { action: 'transition_deal',      dealId, to, note? }
 *     | { action: 'transition_milestone', milestoneId, to, note? }
 *     | { action: 'claim_invite',         dealId, token }          (client accepts an invite link)
 *     | { action: 'create_invite',        dealId }                 (provider; returns the token once)
 * Auth: Authorization: Bearer <supabase access token>
 *
 * Admin transitions (complete, cancel an active deal, resolve disputes) are NOT
 * exposed here on purpose: they run with the service role from an operator-only
 * route with its own authentication, never from this user-facing endpoint.
 */

import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  DEAL_STATES,
  MILESTONE_STATES,
  canTransitionDeal,
  canTransitionMilestone,
  manualPaymentProvider,
  type Actor,
  type Deal,
  type DealState,
  type Milestone,
  type MilestoneState,
  type PaymentResult,
} from '@/escrow/core';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use whatever name the host app already uses for its public (anon / publishable) key.
const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_NOTE = 2000;
const MAX_TOKEN = 128;

type Row = Record<string, unknown>;
type Parsed =
  | { action: 'transition_deal'; dealId: string; to: DealState; note: string | null }
  | { action: 'transition_milestone'; milestoneId: string; to: MilestoneState; note: string | null }
  | { action: 'claim_invite'; dealId: string; token: string }
  | { action: 'create_invite'; dealId: string };

/** Strict input validation. Returns an error message or the parsed body. */
function parseBody(raw: unknown): Parsed | string {
  if (typeof raw !== 'object' || raw === null) return 'Body must be a JSON object.';
  const b = raw as Record<string, unknown>;
  const id = (v: unknown) => (typeof v === 'string' && UUID.test(v) ? v : null);
  const note = (): string | null | undefined => {
    if (b.note === undefined || b.note === null) return null;
    if (typeof b.note !== 'string' || b.note.length > MAX_NOTE) return undefined;
    return b.note;
  };

  switch (b.action) {
    case 'transition_deal': {
      const dealId = id(b.dealId);
      const n = note();
      if (!dealId) return 'dealId must be a UUID.';
      if (typeof b.to !== 'string' || !(DEAL_STATES as readonly string[]).includes(b.to)) return 'Unknown target state.';
      if (n === undefined) return `note must be a string up to ${MAX_NOTE} characters.`;
      return { action: 'transition_deal', dealId, to: b.to as DealState, note: n };
    }
    case 'transition_milestone': {
      const milestoneId = id(b.milestoneId);
      const n = note();
      if (!milestoneId) return 'milestoneId must be a UUID.';
      if (typeof b.to !== 'string' || !(MILESTONE_STATES as readonly string[]).includes(b.to)) return 'Unknown target state.';
      if (n === undefined) return `note must be a string up to ${MAX_NOTE} characters.`;
      return { action: 'transition_milestone', milestoneId, to: b.to as MilestoneState, note: n };
    }
    case 'claim_invite': {
      const dealId = id(b.dealId);
      if (!dealId) return 'dealId must be a UUID.';
      if (typeof b.token !== 'string' || b.token.length < 16 || b.token.length > MAX_TOKEN) return 'Invalid token.';
      return { action: 'claim_invite', dealId, token: b.token };
    }
    case 'create_invite': {
      const dealId = id(b.dealId);
      if (!dealId) return 'dealId must be a UUID.';
      return { action: 'create_invite', dealId };
    }
    default:
      return 'Unknown action.';
  }
}

const toDeal = (r: Row): Deal => ({
  id: r.id as string,
  providerId: r.provider_id as string,
  clientEmail: r.client_email as string,
  clientUserId: (r.client_user_id as string) ?? null,
  title: r.title as string,
  description: (r.description as string) ?? null,
  currency: r.currency as Deal['currency'],
  state: r.state as DealState,
  feeRate: Number(r.fee_rate),
  createdAt: r.created_at as string,
});

const toMilestone = (r: Row): Milestone => ({
  id: r.id as string,
  dealId: r.deal_id as string,
  position: r.position as number,
  title: r.title as string,
  description: (r.description as string) ?? null,
  amount: Number(r.amount),
  state: r.state as MilestoneState,
  deliveredAt: (r.delivered_at as string) ?? null,
  approvedAt: (r.approved_at as string) ?? null,
});

/**
 * Identity, derived - never taken from the request body or from an e-mail address.
 * provider = the deal's provider account; client = the account that claimed the invite.
 * Returns null for a stranger so the caller answers 403.
 */
function deriveActor(userId: string, deal: Deal): Actor | null {
  if (userId === deal.providerId) return 'provider';
  if (deal.clientUserId && userId === deal.clientUserId) return 'client';
  return null;
}

const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status });

// Minimal per-instance limiter (fixed window). Serverless instances do not share
// memory, so this only blunts bursts; put a real shared limiter in front for production.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, { n: number; reset: number }>();
function limited(key: string): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(key, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  h.n += 1;
  return h.n > MAX_PER_WINDOW;
}

/** Distinguishes "not found / not visible" (null) from a database failure (throws). */
async function fetchOne(db: SupabaseClient, table: string, column: string, value: string): Promise<Row | null> {
  const { data, error } = await db.from(table).select('*').eq(column, value).maybeSingle();
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data as Row) ?? null;
}

async function fetchMilestones(db: SupabaseClient, dealId: string): Promise<Milestone[]> {
  const { data, error } = await db.from('escrow_milestones').select('*').eq('deal_id', dealId);
  if (error) throw new Error(`escrow_milestones: ${error.message}`);
  return ((data ?? []) as Row[]).map(toMilestone);
}

function paymentSummary(r: PaymentResult) {
  return r.ok ? { ok: true } : { ok: false, error: r.error ?? 'payment hook failed' };
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) return fail('Server misconfigured.', 500);

  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer /i, '');
  if (!token) return fail('Authentication required.', 401);

  // User-scoped client: RLS and column grants apply, DB triggers see the real identity.
  const db = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: authError } = await db.auth.getUser(token);
  if (authError || !userData.user) return fail('Invalid or expired session.', 401);
  const user = userData.user;

  if (limited(user.id)) return fail('Too many requests.', 429);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail('Invalid JSON body.', 400);
  }
  const body = parseBody(raw);
  if (typeof body === 'string') return fail(body, 400);

  try {
    // ---- Invites: pure RPC calls, the database decides.
    if (body.action === 'create_invite') {
      const { data, error } = await db.rpc('escrow_create_invite', { p_deal: body.dealId });
      if (error) return fail('Invite not available.', 422);
      return NextResponse.json({ ok: true, token: data as string });
    }
    if (body.action === 'claim_invite') {
      const { error } = await db.rpc('escrow_claim_deal', { p_deal: body.dealId, p_token: body.token });
      if (error) return fail('Invalid or expired invite.', 422);
      return NextResponse.json({ ok: true });
    }

    // ---- Resolve context: a deal, its milestones, and the caller's role.
    let milestone: Milestone | null = null;
    let dealRow: Row | null;
    if (body.action === 'transition_milestone') {
      const m = await fetchOne(db, 'escrow_milestones', 'id', body.milestoneId);
      if (!m) return fail('Milestone not found.', 404);
      milestone = toMilestone(m);
      dealRow = await fetchOne(db, 'escrow_deals', 'id', milestone.dealId);
    } else {
      dealRow = await fetchOne(db, 'escrow_deals', 'id', body.dealId);
    }
    if (!dealRow) return fail('Deal not found.', 404);
    const deal = toDeal(dealRow);

    const actor = deriveActor(user.id, deal);
    if (!actor) return fail('You are not a party to this deal.', 403);

    const milestones = await fetchMilestones(db, deal.id);

    // ---- Verdict → ONE atomic RPC (state + audit event commit together, expected-state guarded).
    if (body.action === 'transition_deal') {
      const verdict = canTransitionDeal(deal, body.to, actor, milestones);
      if (!verdict.ok) return fail(verdict.reason, 422);

      const { error } = await db.rpc('escrow_transition_deal', {
        p_deal: deal.id,
        p_to: body.to,
        p_expected: deal.state,
        p_note: body.note,
      });
      if (error) return fail(error.message, 409); // includes "no longer in state": the caller should refetch

      let payment: PaymentResult | null = null;
      if (body.to === 'active') {
        payment = await manualPaymentProvider.onDealActivated({ ...deal, state: 'active' }, milestones);
      } else if (body.to === 'completed' || body.to === 'cancelled') {
        payment = await manualPaymentProvider.onDealClosed({ ...deal, state: body.to }, body.to);
      }
      return respond(body.to, payment);
    }

    if (body.action !== 'transition_milestone' || !milestone) return fail('Unknown action.', 400);
    const verdict = canTransitionMilestone(deal, milestone, body.to, actor, milestones);
    if (!verdict.ok) return fail(verdict.reason, 422);

    const { error } = await db.rpc('escrow_transition_milestone', {
      p_milestone: milestone.id,
      p_to: body.to,
      p_expected: milestone.state,
      p_note: body.note,
    });
    if (error) return fail(error.message, 409);

    const payment =
      body.to === 'approved'
        ? await manualPaymentProvider.onMilestoneApproved(deal, { ...milestone, state: 'approved' })
        : null;
    return respond(body.to, payment);
  } catch (e) {
    console.error('escrow route error', e instanceof Error ? e.message : e);
    return fail('Unexpected server error.', 500);
  }
}

/**
 * The state change is already committed when the payment hook runs, so a failing
 * hook cannot roll it back. Report it explicitly (never swallow it) so the host can
 * alert and reconcile; the client sees the new state plus the payment status.
 */
function respond(state: string, payment: PaymentResult | null) {
  if (payment && !payment.ok) {
    console.error('escrow payment hook failed after commit', payment.error);
    return NextResponse.json({ ok: true, state, payment: paymentSummary(payment) }, { status: 202 });
  }
  return NextResponse.json({ ok: true, state });
}
