# Orivions Escrow

Milestone escrow core for the [Orivions](https://orivions.com) marketplace -
the trust layer that lets onchain teams hire with their funds protected.

This module tracks deals and milestones, enforces a strict state machine,
computes the success fee, and keeps an append-only event log. It is a standalone
component: attachable to the main product at any time, auditable in isolation.

> Polish version of this document: [README.pl.md](./README.pl.md).

## Status

| Part | State |
|------|-------|
| TypeScript core (types, state machine, fees, payment seam) | **Built, tested** - 262 assertions, 0 failures |
| Rust core (fees + state machine, canonical) | **Built, tested** - 11 tests, not re-run since the 6.11 audit (no cargo on the build machine) |
| Postgres schema + RLS + guard triggers | **Built, tested on real Postgres (PGlite)** - 73 assertions incl. the audit exploits; still validate once on a live Supabase project |
| Custody (holding/moving funds) | **Not in V1** - by design (see below) |

## What V1 does - and what it deliberately does not

**Does:** the full deal lifecycle (`draft -> proposed -> active -> completed /
cancelled / disputed`), milestones accepted in strict order, the success-fee
rate snapshotted on the deal at proposal time (**a single flat 10% - no tiers,
no subscriptions**), an immutable event log, and fee math that is identical in
TypeScript, Rust, and SQL.

**Does not (on purpose):** it does not hold or move money. Funds flow outside
the platform in V1; this module records and enforces the agreed process. Custody
is V2 (payment partner) / V3 (onchain program) - both plug into the single
`PaymentProvider` interface (`core/types.ts`) that the core already calls today
(served by a no-op `manualPaymentProvider` in V1). This sequencing follows the
project's legal risk analysis.

## Architecture - 4 layers, dependencies point only downward

```
ui/DealTimeline.tsx      React, no fetches - renders and fires callbacks
api/route.ts             thin Next.js adapter: identity -> core -> persist -> event
core/                    PURE functions: types, state machine, fees, payment seam
sql/001_escrow.sql       3 tables, RLS, guard triggers, accounting view
```

Invariant: **`api/` and `ui/` contain no business rules.** Every rule lives in
`core/` (tested) and is mirrored in SQL (the last line of defence).

## Double-validated transitions - mechanically guaranteed

The transition table exists in two places on purpose: `core/stateMachine.ts`
(good errors, early) and triggers in `sql/001_escrow.sql` (holds even if the API
is bypassed). So that "identical" is not just a claim, `tests/parity.test.mjs`
parses the trigger conditions out of the SQL and diffs them against the TS
tables - editing one side without the other fails CI.

## Key design decisions (for an auditor)

1. **`fee_rate` frozen on the deal** at proposal time - a future price change
   never re-prices a deal in flight. Snapshot > join. (V1 is one flat 10%.)
2. **Milestones accepted in strict order** (delivery can be parallel) - the fee
   ledger reads unambiguously.
3. **Append-only event log** - a trigger rejects UPDATE/DELETE. Every successful
   transition emits exactly one event type (mapped in `stateMachine.ts`, tested).
4. **Actor derived from identity, not from the request**: provider = `auth.uid()`
   equal to `provider_id`; client = the account that claimed a single-use invite
   token (e-mail is never an identity: sign-up does not verify it); admin =
   `service_role` only.
5. **Amounts in integer cents internally** (`core/fees.ts`) - no float drift;
   the `fee + net = total` invariant is fuzzed over 500 cases.

## Run the tests

```bash
npm install && npm test     # 262 TS + 73 SQL assertions: surface, stateMachine, fees, payments, parity, sql
cd rust && cargo test       # 11 Rust tests (core + SQL parity)
```

Requires Node 18+ and a stable Rust toolchain. CI runs both on every push
(`.github/workflows/ci.yml`).

## What was actually verified

- `tsc --strict`: clean compile (real compiler, real JS emit).
- **262 TS and 73 SQL assertions pass**, including the exhaustive 6x6x3 deal matrix (108)
  and 4x4x3 milestone matrix (48) - every state x state x actor combination
  checked against the table.
- **11 Rust tests** (including SQL parity) were green before the 6.11 audit; not re-run since (no cargo on the build machine).
- SQL has been structurally validated but **not yet run against a live
  Postgres**; run the migration on a throwaway Supabase project before
  production. (This is the one open checklist item.)

See [INTEGRATION.md](./INTEGRATION.md) to attach it to the product (~30 min),
[PARTNERS.md](./PARTNERS.md) for the payment-partner seam, and
[rust/VERIFY.md](./rust/VERIFY.md) for the Rust core.

## License

Source-available for review and audit only. See [LICENSE](./LICENSE).
All rights reserved - not an open-source license.
