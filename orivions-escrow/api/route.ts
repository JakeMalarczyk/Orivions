/**
 * Orivions Escrow - Next.js API adapter (drop-in).
 *
 * ATTACH: copy to `app/api/escrow/route.ts` in the host Next.js app.
 * Deliberately THIN: identity → core verdict → persist → append event → payment hook.
 * All business rules live in core/stateMachine.ts (tested) and are enforced again
 * by DB triggers (sql/001_escrow.sql). This file must never grow rules.
 *
 * Endpoint: POST /api/escrow
 * Body: { action: 'transition_deal',      dealId, to, note? }
 *     | { action: 'transition_milestone', milestoneId, to, note? }
 * Auth: Authorization: Bearer <supabase access token>
 */

import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  canTransitionDeal,
  canTransitionMilestone,
  dealEventFor,
  milestoneEventFor,
  manualPaymentProvider,
  type Actor,
  type Deal,
  type DealState,
  type Milestone,
  type MilestoneState,
} from '@/escrow/core';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Body =
  | { action: 'transition_deal'; dealId: string; to: DealState; note?: string }
  | { action: 'transition_milestone'; milestoneId: string; to: MilestoneState; note?: string };

type Row = Record<string, unknown>;

const toDeal = (r: Row): Deal => ({
  id: r.id as string,
  providerId: r.provider_id as string,
  clientEmail: r.client_email as string,
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
 * Identity, derived - never taken from the request body.
 * Returns null for a stranger so the caller answers 403 instead of guessing a
 * role. (RLS would block them anyway, but code must not label a non-party
 * 'client' - that reads as a lie during an audit.)
 */
function deriveActor(userId: string, userEmail: string | undefined, deal: Deal): Actor | null {
  if (userId === deal.providerId) return 'provider';
  if ((userEmail ?? '').toLowerCase() === deal.clientEmail) return 'client';
  return null;
}

const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status });

async function fetchDeal(db: SupabaseClient, id: string): Promise<Deal | null> {
  const { data } = await db.from('escrow_deals').select('*').eq('id', id).single();
  return data ? toDeal(data as Row) : null;
}

async function fetchMilestones(db: SupabaseClient, dealId: string): Promise<Milestone[]> {
  const { data } = await db.from('escrow_milestones').select('*').eq('deal_id', dealId);
  return ((data ?? []) as Row[]).map(toMilestone);
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return fail('Server misconfigured.', 500);

  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer /, '');
  if (!token) return fail('Authentication required.', 401);

  // User-scoped client: RLS applies and DB triggers see the real identity.
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: authError } = await db.auth.getUser(token);
  if (authError || !userData.user) return fail('Invalid or expired session.', 401);
  const user = userData.user;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail('Invalid JSON body.', 400);
  }

  try {
    // ---- Resolve context: both actions need a deal, its milestones, and an actor.
    let deal: Deal | null;
    let milestone: Milestone | null = null;

    if (body.action === 'transition_deal') {
      deal = await fetchDeal(db, body.dealId);
    } else if (body.action === 'transition_milestone') {
      const { data } = await db.from('escrow_milestones').select('*').eq('id', body.milestoneId).single();
      if (!data) return fail('Milestone not found.', 404);
      milestone = toMilestone(data as Row);
      deal = await fetchDeal(db, milestone.dealId);
    } else {
      return fail('Unknown action.', 400);
    }

    if (!deal) return fail('Deal not found.', 404);

    const actor = deriveActor(user.id, user.email, deal);
    if (!actor) return fail('You are not a party to this deal.', 403);

    const milestones = await fetchMilestones(db, deal.id);

    // ---- Verdict → persist → append event → payment hook.
    if (body.action === 'transition_deal') {
      const verdict = canTransitionDeal(deal, body.to, actor, milestones);
      if (!verdict.ok) return fail(verdict.reason, 422);

      const { error } = await db.from('escrow_deals').update({ state: body.to }).eq('id', deal.id);
      if (error) return fail(error.message, 422);

      await db.from('escrow_events').insert({
        deal_id: deal.id,
        milestone_id: null,
        type: dealEventFor(deal.state, body.to),
        actor,
        note: body.note ?? null,
      });

      if (body.to === 'active') {
        await manualPaymentProvider.onDealActivated({ ...deal, state: 'active' }, milestones);
      } else if (body.to === 'completed' || body.to === 'cancelled') {
        await manualPaymentProvider.onDealClosed({ ...deal, state: body.to }, body.to);
      }
      return NextResponse.json({ ok: true, state: body.to });
    }

    // ---- transition_milestone (milestone is non-null on this path)
    const ms = milestone as Milestone;
    const verdict = canTransitionMilestone(deal, ms, body.to, actor, milestones);
    if (!verdict.ok) return fail(verdict.reason, 422);

    const { error } = await db.from('escrow_milestones').update({ state: body.to }).eq('id', ms.id);
    if (error) return fail(error.message, 422);

    await db.from('escrow_events').insert({
      deal_id: deal.id,
      milestone_id: ms.id,
      type: milestoneEventFor(ms.state, body.to),
      actor,
      note: body.note ?? null,
    });

    if (body.to === 'approved') {
      await manualPaymentProvider.onMilestoneApproved(deal, { ...ms, state: 'approved' });
    }
    return NextResponse.json({ ok: true, state: body.to });
  } catch {
    return fail('Unexpected server error.', 500);
  }
}
