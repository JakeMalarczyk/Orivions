//! Fee accounting - pure integer math (cents), mirrors ../../core/fees.ts.
//! Rounding: half-up at the fee boundary, implemented with integer arithmetic
//! only, so results are platform-exact and identical to the SQL view.

use crate::FeeRate;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct FeeBreakdown {
    pub total_cents: i64,
    pub fee_cents: i64,
    pub provider_net_cents: i64,
    pub rate: FeeRate,
}

#[derive(Debug, PartialEq, Eq)]
pub enum FeeError {
    /// A milestone amount was zero or negative.
    NonPositiveAmount(i64),
    /// Total overflowed i64 (practically unreachable; checked anyway).
    Overflow,
}

/// Canonical API: amounts already in cents (what the DB, and later the
/// on-chain program, actually store).
pub fn compute_fees_cents(rate: FeeRate, amounts_cents: &[i64]) -> Result<FeeBreakdown, FeeError> {
    let mut total: i64 = 0;
    for &a in amounts_cents {
        if a <= 0 {
            return Err(FeeError::NonPositiveAmount(a));
        }
        total = total.checked_add(a).ok_or(FeeError::Overflow)?;
    }
    // fee = round_half_up(total * pct / 100) in pure integers:
    // (total * pct + 50) / 100 for non-negative operands.
    let pct = rate.percent();
    let raw = total.checked_mul(pct).ok_or(FeeError::Overflow)?;
    let fee = (raw + 50) / 100;
    Ok(FeeBreakdown {
        total_cents: total,
        fee_cents: fee,
        provider_net_cents: total - fee,
        rate,
    })
}

// ---------------------------------------------------------------------------
// Unit tests (fees)
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_10k_at_10_percent() {
        // The example every sales document uses: $10,000 @ 10% → fee $1,000, net $9,000.
        let r = compute_fees_cents(FeeRate::Standard, &[1_000_000]).unwrap();
        assert_eq!(r.fee_cents, 100_000);
        assert_eq!(r.provider_net_cents, 900_000);
        assert_eq!(r.total_cents, 1_000_000);
    }

    #[test]
    fn milestones_sum_before_fee() {
        let r = compute_fees_cents(FeeRate::Standard, &[250_000, 250_000, 500_000]).unwrap();
        assert_eq!(r.total_cents, 1_000_000);
        assert_eq!(r.fee_cents, 100_000);
    }

    #[test]
    fn rounding_half_up_at_boundary() {
        // 100.04 USD = 10004c @10% → 1000.4c → rounds down to 1000c
        assert_eq!(
            compute_fees_cents(FeeRate::Standard, &[10_004]).unwrap().fee_cents,
            1000
        );
        // 100.06 USD = 10006c @10% → 1000.6c → rounds up to 1001c
        assert_eq!(
            compute_fees_cents(FeeRate::Standard, &[10_006]).unwrap().fee_cents,
            1001
        );
        // exact half: 100.05 USD = 10005c @10% → 1000.5c → half-up to 1001c
        assert_eq!(
            compute_fees_cents(FeeRate::Standard, &[10_005]).unwrap().fee_cents,
            1001
        );
    }

    #[test]
    fn ledger_invariant_fuzz_500() {
        // Deterministic LCG (no deps) - fee + net must equal total, always.
        let mut seed: u64 = 0x5EED_1234_ABCD_EF01;
        for i in 0..500u64 {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            let amount = ((seed >> 16) % 500_000_000 + 1) as i64; // 0.01 .. 5,000,000.00 USD
            let rate = FeeRate::Standard;
            let r = compute_fees_cents(rate, &[amount]).unwrap();
            assert_eq!(r.fee_cents + r.provider_net_cents, r.total_cents);
        }
    }

    #[test]
    fn invalid_amounts_rejected() {
        assert_eq!(
            compute_fees_cents(FeeRate::Standard, &[0]),
            Err(FeeError::NonPositiveAmount(0))
        );
        assert_eq!(
            compute_fees_cents(FeeRate::Standard, &[-500]),
            Err(FeeError::NonPositiveAmount(-500))
        );
    }
}
