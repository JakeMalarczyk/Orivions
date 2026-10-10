// Orivions Escrow - TS ↔ SQL parity test. Run: node tests/parity.test.mjs
//
// The module's core safety promise is that the SAME transition table is
// enforced in TypeScript (first line) and in Postgres triggers (last line).
// This test makes that promise mechanical: it parses the trigger conditions
// out of sql/001_escrow.sql and diffs them against DEAL_TRANSITIONS /
// MILESTONE_TRANSITIONS from the compiled core. Any edit to one side without
// the other fails CI.

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { DEAL_TRANSITIONS, MILESTONE_TRANSITIONS } = require('../dist/stateMachine.js');
const sql = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../sql/001_escrow.sql'), 'utf8');

let passed = 0, failed = 0;
const assert = (cond, label) => cond ? passed++ : (failed++, console.error('FAIL:', label));

// ---------------------------------------------------------------------------
// Extract (from, to, actor) tuples from the SQL trigger condition lines, e.g.:
//   (old.state = 'active' and new.state = 'disputed' and actor in ('provider','client')) or
//   (old.state = 'disputed' and new.state in ('active','cancelled','completed') and actor = 'admin')
// ---------------------------------------------------------------------------
function extractTuples(block) {
  const tuples = new Set();
  const lineRe = /old\.state = '(\w+)'\s+and\s+new\.state (?:= '(\w+)'|in \(([^)]+)\))\s+and\s+actor (?:= '(\w+)'|in \(([^)]+)\))/g;
  let m;
  while ((m = lineRe.exec(block)) !== null) {
    const from = m[1];
    const tos = m[2] ? [m[2]] : m[3].split(',').map((s) => s.trim().replace(/'/g, ''));
    const actors = m[4] ? [m[4]] : m[5].split(',').map((s) => s.trim().replace(/'/g, ''));
    for (const to of tos) for (const a of actors) tuples.add(`${from}→${to}:${a}`);
  }
  return tuples;
}

function tsTuples(table) {
  const tuples = new Set();
  for (const [from, tos] of Object.entries(table)) {
    for (const [to, actors] of Object.entries(tos)) {
      for (const a of actors) tuples.add(`${from}→${to}:${a}`);
    }
  }
  return tuples;
}

// Isolate the two trigger function BODIES. Anchor on the full declaration -
// bare function names also appear in the header comment (detach instructions),
// which is exactly the kind of trap this test exists to catch.
const dealFnStart = sql.indexOf('create or replace function public.escrow_guard_deal_transition');
const msFnStart = sql.indexOf('create or replace function public.escrow_guard_milestone_transition');
const dealBlock = sql.slice(dealFnStart, msFnStart);
const msBlock = sql.slice(msFnStart);

const sqlDeal = extractTuples(dealBlock);
const tsDeal = tsTuples(DEAL_TRANSITIONS);
const sqlMs = extractTuples(msBlock);
const tsMs = tsTuples(MILESTONE_TRANSITIONS);

function diff(name, a, b, aLabel, bLabel) {
  const onlyA = [...a].filter((x) => !b.has(x));
  const onlyB = [...b].filter((x) => !a.has(x));
  assert(onlyA.length === 0, `${name}: present only in ${aLabel}: ${onlyA.join(', ')}`);
  assert(onlyB.length === 0, `${name}: present only in ${bLabel}: ${onlyB.join(', ')}`);
}

assert(sqlDeal.size > 0, 'parsed deal tuples from SQL (parser sanity)');
assert(sqlMs.size > 0, 'parsed milestone tuples from SQL (parser sanity)');
diff('deal table', tsDeal, sqlDeal, 'TypeScript', 'SQL');
diff('milestone table', tsMs, sqlMs, 'TypeScript', 'SQL');
assert(tsDeal.size === sqlDeal.size, `deal tuple counts equal (TS ${tsDeal.size} vs SQL ${sqlDeal.size})`);
assert(tsMs.size === sqlMs.size, `milestone tuple counts equal (TS ${tsMs.size} vs SQL ${sqlMs.size})`);

console.log(`\nparity: ${passed} passed, ${failed} failed  (deal tuples: ${tsDeal.size}, milestone tuples: ${tsMs.size})`);
process.exit(failed ? 1 : 0);
