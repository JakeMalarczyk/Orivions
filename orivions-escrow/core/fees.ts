/**
 * Orivions Escrow - fee accounting.
 *
 * One function, zero dependencies, rounding defined EXACTLY (half-up to
 * 2 decimals via integer cents) so the SQL view in sql/001_escrow.sql can
 * mirror it 1:1. If you change rounding here, change it there - the parity
 * comment in the SQL file points back to this line.
 */

import type { Deal, FeeBreakdown, Milestone } from './types';

/** Valid fee rate in V1: a single flat 10% success fee. Snapshotted on the deal; anything else is a data bug. */
export const VALID_FEE_RATES = [0.10] as const;

export function computeFees(
  deal: Pick<Deal, 'feeRate'>,
  milestones: Pick<Milestone, 'amount'>[]
): FeeBreakdown {
  if (!VALID_FEE_RATES.includes(deal.feeRate as (typeof VALID_FEE_RATES)[number])) {
    throw new Error(`Invalid feeRate ${deal.feeRate} - expected one of ${VALID_FEE_RATES.join(', ')}`);
  }
  for (const m of milestones) {
    if (!Number.isFinite(m.amount) || m.amount <= 0) {
      throw new Error(`Milestone amounts must be positive numbers (got ${m.amount})`);
    }
  }

  // Work in integer cents to avoid float drift; round half-up at each boundary.
  const toCents = (v: number) => Math.round(v * 100);
  const totalCents = milestones.reduce((sum, m) => sum + toCents(m.amount), 0);
  const feeCents = Math.round(totalCents * deal.feeRate);

  return {
    totalAmount: totalCents / 100,
    feeRate: deal.feeRate,
    feeAmount: feeCents / 100,
    providerNet: (totalCents - feeCents) / 100,
  };
}
