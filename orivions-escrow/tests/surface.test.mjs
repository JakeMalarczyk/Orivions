// Orivions Escrow - public surface test.
// WHY THIS EXISTS: core/payments.ts shipped unreachable - index.ts did not
// re-export it, and no test noticed because every suite imported the internal
// modules directly. This asserts the contract the host app actually uses:
// "the host imports ONLY from core/index".
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const api = require('../dist/index.js');

let pass = 0, fail = 0;
const ok = (c, l) => c ? pass++ : (fail++, console.error('FAIL: missing from public surface →', l));

const REQUIRED = [
  // state machine
  'DEAL_TRANSITIONS', 'MILESTONE_TRANSITIONS', 'canTransitionDeal', 'canTransitionMilestone',
  'dealEventFor', 'milestoneEventFor',
  // domain lists (tests and hosts iterate these)
  'DEAL_STATES', 'MILESTONE_STATES', 'ACTORS', 'EVENT_TYPES',
  // fees
  'computeFees', 'VALID_FEE_RATES',
  // payments V2 - the one that was missing
  'PAYMENT_STATES', 'PAYMENT_TRANSITIONS', 'canTransitionPayment',
  'processWebhook', 'makePartnerPaymentProvider', 'makeMockPartner', 'makeMemoryStore',
  // V1 provider
  'manualPaymentProvider',
];
for (const name of REQUIRED) ok(typeof api[name] !== 'undefined', name);

// The surface must be usable end-to-end through index alone (no deep imports).
const store = api.makeMemoryStore();
const provider = api.makePartnerPaymentProvider(api.makeMockPartner(), store);
ok(provider.kind === 'partner', 'partner provider constructible via index');
ok(api.computeFees({ feeRate: 0.10 }, [{ amount: 10000 }]).feeAmount === 1000, 'fees usable via index');
ok(api.canTransitionPayment('funded', 'released') === true, 'payment machine usable via index');

console.log(`\nsurface: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
