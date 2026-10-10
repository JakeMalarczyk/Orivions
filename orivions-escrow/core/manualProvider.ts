/**
 * Orivions Escrow - V1 payment provider: manual.
 *
 * Moves NO money. Its whole job is to make the seam real: core logic already
 * calls the PaymentProvider hooks, so swapping in a custodial partner (V2)
 * or an on-chain program (V3) later touches nothing but this one binding.
 */

import type { Deal, Milestone, PaymentProvider, PaymentResult } from './types';

const ok: PaymentResult = { ok: true, reference: null };

export const manualPaymentProvider: PaymentProvider = {
  kind: 'manual',
  async onDealActivated(_deal: Deal, _milestones: Milestone[]): Promise<PaymentResult> {
    // V1: payment happens off-platform per the deal's terms. Nothing to lock.
    return ok;
  },
  async onMilestoneApproved(_deal: Deal, _milestone: Milestone): Promise<PaymentResult> {
    // V1: approval is the accounting event; the invoice flow (manual, per
    // COO SLA: invoice within 48h of Won) picks it up from the events table.
    return ok;
  },
  async onDealClosed(_deal: Deal, _finalState: 'completed' | 'cancelled'): Promise<PaymentResult> {
    return ok;
  },
};
