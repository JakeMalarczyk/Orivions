// Orivions Escrow - fee accounting tests. Run: node tests/fees.test.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { computeFees } = require('../dist/fees.js');

let passed = 0, failed = 0;
const assert = (cond, label) => cond ? passed++ : (failed++, console.error('FAIL:', label));
const eq = (a, b) => Math.abs(a - b) < 1e-9;

// canonical example from all sales materials: $10,000 @ 10% -> fee 1000, net 9000
{
  const r = computeFees({ feeRate: 0.10 }, [{ amount: 10000 }]);
  assert(eq(r.feeAmount, 1000) && eq(r.providerNet, 9000) && eq(r.totalAmount, 10000), '10k @ 10%');
}
// another flat-rate case: $2,500 @ 10% -> fee 250, net 2250
{
  const r = computeFees({ feeRate: 0.10 }, [{ amount: 2500 }]);
  assert(eq(r.feeAmount, 250) && eq(r.providerNet, 2250), '2.5k @ 10%');
}
// multiple milestones sum before fee
{
  const r = computeFees({ feeRate: 0.10 }, [{ amount: 2500 }, { amount: 2500 }, { amount: 5000 }]);
  assert(eq(r.totalAmount, 10000) && eq(r.feeAmount, 1000), 'milestones sum');
}
// float-drift trap: 0.1 + 0.2 style amounts stay exact in cents
{
  const r = computeFees({ feeRate: 0.10 }, [{ amount: 33.1 }, { amount: 33.2 }]);
  assert(eq(r.totalAmount, 66.3), `no float drift (got ${r.totalAmount})`);
}
// rounding half-up at the fee boundary (10%): 100.04 -> 10.00 (down); 100.06 -> 10.01 (up); 100.05 -> 10.01 (half-up)
{
  const down = computeFees({ feeRate: 0.10 }, [{ amount: 100.04 }]);
  assert(eq(down.feeAmount, 10.0), `round down case (got ${down.feeAmount})`);
  const up = computeFees({ feeRate: 0.10 }, [{ amount: 100.06 }]);
  assert(eq(up.feeAmount, 10.01), `round up case (got ${up.feeAmount})`);
  const half = computeFees({ feeRate: 0.10 }, [{ amount: 100.05 }]);
  assert(eq(half.feeAmount, 10.01), `half-up case (got ${half.feeAmount})`);
}
// net + fee always reconstruct total exactly (ledger invariant), fuzz 500 cases
{
  let okAll = true;
  for (let i = 1; i <= 500; i++) {
    const amount = Math.round(Math.random() * 5000000) / 100 + 0.01;
    const r = computeFees({ feeRate: 0.10 }, [{ amount }]);
    if (!eq(r.feeAmount + r.providerNet, r.totalAmount)) { okAll = false; break; }
  }
  assert(okAll, 'invariant: fee + net === total (500 fuzz cases)');
}
// invalid inputs throw - any rate other than the flat 10% is a data bug
for (const [deal, ms, label] of [
  [{ feeRate: 0.05 }, [{ amount: 100 }], 'invalid rate rejected'],
  [{ feeRate: 0.08 }, [{ amount: 100 }], 'old 8% rate now rejected'],
  [{ feeRate: 0.07 }, [{ amount: 100 }], 'old 7% subscriber rate now rejected'],
  [{ feeRate: 0.10 }, [{ amount: 0 }], 'zero amount rejected'],
  [{ feeRate: 0.10 }, [{ amount: -5 }], 'negative amount rejected'],
  [{ feeRate: 0.10 }, [{ amount: NaN }], 'NaN rejected'],
]) {
  let threw = false;
  try { computeFees(deal, ms); } catch { threw = true; }
  assert(threw, label);
}

console.log(`\nfees: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
