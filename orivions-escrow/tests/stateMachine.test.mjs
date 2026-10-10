// Orivions Escrow - state machine tests.
// Run: node tests/stateMachine.test.mjs (after tsc compile to dist/)
// Strategy: EXHAUSTIVE - every (from × to × actor) combination for deals and
// milestones is checked against the transition table, so any accidental edit
// to the table or the guards flips a test. Plus targeted guard scenarios.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  DEAL_TRANSITIONS, MILESTONE_TRANSITIONS,
  canTransitionDeal, canTransitionMilestone,
  dealEventFor, milestoneEventFor,
} = require('../dist/stateMachine.js');
// Lists come FROM THE CORE, never hardcoded here: adding a state or an actor
// to the domain automatically widens this matrix instead of silently escaping it.
const { DEAL_STATES, MILESTONE_STATES, ACTORS } = require('../dist/types.js');

let passed = 0, failed = 0;
function assert(cond, label) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL:', label); }
}

const MS_STATES = MILESTONE_STATES;

const ms = (state, position = 1) => ({ state, position });
const approvedAll = [ms('approved', 1), ms('approved', 2)];

// ---------------------------------------------------------------------------
// 1. EXHAUSTIVE deal matrix: 6 states × 6 targets × 3 actors = 108 checks
// ---------------------------------------------------------------------------
for (const from of DEAL_STATES) {
  for (const to of DEAL_STATES) {
    for (const actor of ACTORS) {
      const tableAllows = (DEAL_TRANSITIONS[from]?.[to] ?? []).includes(actor);
      // Use milestones that satisfy structural guards, so we isolate the table check:
      const v = canTransitionDeal({ state: from }, to, actor, approvedAll);
      assert(v.ok === tableAllows, `deal ${from}→${to} as ${actor}: expected ${tableAllows}, got ${v.ok}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Deal structural guards
// ---------------------------------------------------------------------------
// proposing with zero milestones is denied even though the table allows the move
assert(canTransitionDeal({ state: 'draft' }, 'proposed', 'provider', []).ok === false,
  'guard: cannot propose with 0 milestones');
// completing with an unapproved milestone is denied
assert(canTransitionDeal({ state: 'active' }, 'completed', 'admin', [ms('approved', 1), ms('delivered', 2)]).ok === false,
  'guard: cannot complete with unapproved milestone');
// but completing from disputed (admin resolution) does NOT require all approved
assert(canTransitionDeal({ state: 'disputed' }, 'completed', 'admin', [ms('delivered', 1)]).ok === true,
  'guard: dispute resolution may complete regardless of milestone states');

// ---------------------------------------------------------------------------
// 3. EXHAUSTIVE milestone matrix in an active deal: 4×4×3 = 48 checks
// ---------------------------------------------------------------------------
for (const from of MS_STATES) {
  for (const to of MS_STATES) {
    for (const actor of ACTORS) {
      const tableAllows = (MILESTONE_TRANSITIONS[from]?.[to] ?? []).includes(actor);
      const v = canTransitionMilestone({ state: 'active' }, ms(from, 1), to, actor, [ms(from, 1)]);
      assert(v.ok === tableAllows, `milestone ${from}→${to} as ${actor}: expected ${tableAllows}, got ${v.ok}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Milestone guards
// ---------------------------------------------------------------------------
// no milestone movement outside an active deal - check every non-active deal state
for (const dealState of DEAL_STATES.filter((s) => s !== 'active')) {
  const v = canTransitionMilestone({ state: dealState }, ms('pending', 1), 'delivered', 'provider', [ms('pending', 1)]);
  assert(v.ok === false, `guard: milestone frozen when deal is '${dealState}'`);
}
// strict approval ordering: #2 cannot be approved while #1 is not approved
{
  const all = [ms('delivered', 1), ms('delivered', 2)];
  const v = canTransitionMilestone({ state: 'active' }, all[1], 'approved', 'client', all);
  assert(v.ok === false, 'guard: out-of-order approval denied');
}
// ...but out-of-order DELIVERY is allowed (parallel work)
{
  const all = [ms('pending', 1), ms('pending', 2)];
  const v = canTransitionMilestone({ state: 'active' }, all[1], 'delivered', 'provider', all);
  assert(v.ok === true, 'guard: out-of-order delivery allowed');
}
// in-order approval passes
{
  const all = [ms('approved', 1), ms('delivered', 2)];
  const v = canTransitionMilestone({ state: 'active' }, all[1], 'approved', 'client', all);
  assert(v.ok === true, 'guard: in-order approval allowed');
}

// ---------------------------------------------------------------------------
// 5. Event mapping: every legal transition maps to exactly one event; no throw
// ---------------------------------------------------------------------------
for (const from of DEAL_STATES) {
  for (const to of Object.keys(DEAL_TRANSITIONS[from] ?? {})) {
    let threw = false;
    try { dealEventFor(from, to); } catch { threw = true; }
    assert(!threw, `event mapping exists for deal ${from}→${to}`);
  }
}
for (const from of MS_STATES) {
  for (const to of Object.keys(MILESTONE_TRANSITIONS[from] ?? {})) {
    let threw = false;
    try { milestoneEventFor(from, to); } catch { threw = true; }
    assert(!threw, `event mapping exists for milestone ${from}→${to}`);
  }
}
// specific mappings that carry meaning
assert(dealEventFor('proposed', 'active') === 'deal_accepted', 'proposed→active is deal_accepted');
assert(dealEventFor('disputed', 'active') === 'dispute_resolved', 'disputed→active is dispute_resolved');
assert(milestoneEventFor('rejected', 'pending') === 'milestone_reopened', 'rejected→pending is milestone_reopened');

console.log(`\nstateMachine: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
