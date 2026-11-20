// Orivions Escrow - SQL tests on a real Postgres (PGlite, WASM). Run: node tests/sql.test.mjs
// Reproduces every exploit from the 6.11.2026 audit against sql/001_escrow.sql
// and checks that the hardened schema blocks it. Supabase is emulated: roles
// anon/authenticated/service_role, auth.uid()/auth.role() reading the JWT claims,
// and default privileges that hand new tables to all three roles (the real
// Supabase default that made the audit's view finding exploitable).
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { computeFees } = require('../dist/fees.js');

let pass = 0, fail = 0;
const ok = (c, l) => (c ? pass++ : (fail++, console.error('FAIL:', l)));

const db = new PGlite();

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $$;
  create function auth.role() returns text language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', 'anon') $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  create table public.companies (id uuid primary key);
`);

const U = {
  P: '00000000-0000-0000-0000-00000000000a', // provider
  Q: '00000000-0000-0000-0000-00000000000b', // other provider
  C: '00000000-0000-0000-0000-00000000000c', // real client
  X: '00000000-0000-0000-0000-00000000000d', // squatter using the client's e-mail
};
await db.exec(`insert into public.companies values ('${U.P}'),('${U.Q}'),('${U.C}'),('${U.X}')`);
await db.exec(readFileSync(new URL('../sql/001_escrow.sql', import.meta.url), 'utf8'));

// --- helpers: run SQL as a role + identity, in its own transaction --------------
async function as(who, sql, params = []) {
  const claims =
    who === 'service' ? { role: 'service_role' }
    : who === 'anon' ? { role: 'anon' }
    : { role: 'authenticated', sub: U[who], email: who === 'X' ? 'c@x.com' : `${who}@t.io` };
  const role = who === 'service' ? 'service_role' : who === 'anon' ? 'anon' : 'authenticated';
  await db.exec(`reset role; select set_config('request.jwt.claims', '${JSON.stringify(claims)}', false); set role ${role};`);
  try {
    return { rows: (await db.query(sql, params)).rows };
  } catch (e) {
    return { error: String(e.message) };
  } finally {
    await db.exec('reset role');
  }
}
const okq = async (who, sql, label, params) => {
  const r = await as(who, sql, params);
  ok(!r.error, `${label} (unexpected error: ${r.error})`);
  return r.rows;
};
const bad = async (who, sql, re, label, params) => {
  const r = await as(who, sql, params);
  ok(r.error && re.test(r.error), `${label} (got: ${r.error ?? 'success'})`);
};
const events = async (dealId) =>
  (await as('service', 'select type, actor, note from escrow_events where deal_id=$1 order by created_at, id', [dealId])).rows;

// =============================================================================
// 1. Setup: provider drafts a deal with 2 milestones
// =============================================================================
const [deal] = await okq('P',
  `insert into escrow_deals (provider_id, client_email, title, currency) values ('${U.P}','c@x.com','Audit of Vault','USD') returning id, state, fee_rate`,
  'provider can create a draft deal');
ok(deal.state === 'draft' && Number(deal.fee_rate) === 0.1, 'new deal is draft with frozen fee_rate 0.10');
const D = deal.id;
await okq('P', `insert into escrow_milestones (deal_id, position, title, amount) values ($1,1,'Phase one',100.00),($1,2,'Phase two',200.00)`, 'provider adds milestones in draft', [D]);
ok((await events(D)).map((e) => e.type).join() === 'deal_created', 'deal_created event written by trigger');

// Audit #8: amounts have scale 2 (1.005 is stored as 1.01, same as TS cents rounding)
{
  const [r] = await okq('P', `insert into escrow_milestones (deal_id, position, title, amount) values ($1,3,'Odd cents',1.005) returning amount`, 'odd cents insert', [D]);
  ok(String(r.amount) === '1.01', `amount stored with scale 2 (got ${r?.amount})`);
  await as('service', 'delete from escrow_milestones where deal_id=$1 and position=3', [D]);
}

// =============================================================================
// 2. Audit #2: view and tables are not readable by anon / strangers
// =============================================================================
await bad('anon', 'select * from escrow_deal_fees', /permission denied/i, 'anon cannot read escrow_deal_fees');
await bad('anon', 'select * from escrow_deals', /permission denied/i, 'anon cannot read escrow_deals');
ok((await okq('Q', 'select * from escrow_deal_fees', 'other provider can query the view')).length === 0, 'view respects RLS (security_invoker): stranger sees no rows');
ok((await okq('P', 'select * from escrow_deal_fees', 'provider reads own fees view')).length === 1, 'provider sees own deal in the view');
await bad('P', 'select * from escrow_invites', /permission denied/i, 'invites table is closed to users');

// =============================================================================
// 3. Audit #3: immutable columns
// =============================================================================
await bad('P', `update escrow_deals set fee_rate = 0.0 where id=$1`, /permission denied/i, 'provider cannot change fee_rate', [D]);
await bad('P', `update escrow_deals set provider_id = '${U.Q}' where id=$1`, /permission denied/i, 'provider cannot reassign provider_id', [D]);
await bad('P', `update escrow_deals set client_user_id = '${U.X}' where id=$1`, /permission denied/i, 'provider cannot set client_user_id directly', [D]);
await bad('P', `update escrow_milestones set deal_id = gen_random_uuid() where deal_id=$1`, /permission denied/i, 'cannot move milestone to another deal', [D]);
await bad('P', `update escrow_milestones set approved_at = now() where deal_id=$1`, /permission denied/i, 'cannot forge approved_at', [D]);
await okq('P', `update escrow_deals set title = 'Audit of Vault v2' where id=$1`, 'provider can edit title in draft', [D]);
await okq('P', `update escrow_milestones set amount = 150.00 where deal_id=$1 and position=1`, 'provider can edit milestone amount in draft', [D]);
await okq('P', `update escrow_milestones set amount = 100.00 where deal_id=$1 and position=1`, 'provider restores amount in draft', [D]);

// =============================================================================
// 4. Audit #4: events cannot be forged
// =============================================================================
await bad('P', `insert into escrow_events (deal_id, type, actor) values ($1,'milestone_approved','client')`, /permission denied/i, 'user cannot insert events', [D]);
await bad('P', `update escrow_events set actor='client'`, /permission denied/i, 'user cannot update events');
await bad('service', `update escrow_events set note='x'`, /append-only/i, 'even service_role cannot update events');
await bad('service', `delete from escrow_events`, /append-only/i, 'even service_role cannot delete events');
await bad('service', `truncate escrow_events`, /append-only/i, 'TRUNCATE is blocked');

// =============================================================================
// 5. Audit #1: e-mail is NOT identity. Squatter with c@x.com gets nothing.
// =============================================================================
ok((await okq('X', 'select * from escrow_deals', 'squatter queries deals')).length === 0, 'squatter with matching e-mail sees nothing');
await bad('X', `select escrow_transition_deal($1,'proposed','draft')`, /not found|not visible|no longer/i, 'squatter cannot transition the deal', [D]);

// propose via the atomic RPC, with a note
await okq('P', `select escrow_transition_deal($1,'proposed','draft','sending offer')`, 'provider proposes via RPC', [D]);
{
  const ev = await events(D);
  const last = ev[ev.length - 1];
  ok(last.type === 'deal_proposed' && last.actor === 'provider' && last.note === 'sending offer', 'deal_proposed event: actor provider, note carried from RPC');
}
await bad('P', `update escrow_deals set title = 'Cheaper' where id=$1`, /frozen/i, 'terms frozen after proposal', [D]);
await bad('P', `update escrow_milestones set amount = 999 where deal_id=$1 and position=1`, /draft/i, 'milestone amount frozen after proposal', [D]);

// invite flow
await bad('X', `select escrow_create_invite($1)`, /not your deal/i, 'only the provider can mint an invite', [D]);
const [{ escrow_create_invite: token }] = await okq('P', `select escrow_create_invite($1)`, 'provider mints invite', [D]);
ok(typeof token === 'string' && token.length >= 60, 'invite token is long and random');
await bad('X', `select escrow_claim_deal($1,'wrong')`, /invalid or expired/i, 'squatter with wrong token cannot claim', [D]);
await bad('P', `select escrow_claim_deal($1,$2)`, /invalid or expired/i, 'provider cannot claim own deal', [D, token]);
await bad('anon', `select escrow_claim_deal($1,$2)`, /permission denied/i, 'anon cannot call claim', [D, token]);
await bad('C', `select escrow_transition_deal($1,'active','proposed')`, /no longer in state|not found|not visible/i, 'unclaimed client cannot accept (cannot even see the deal)', [D]);
await okq('C', `select escrow_claim_deal($1,$2)`, 'real client claims with the token', [D, token]);
await bad('X', `select escrow_claim_deal($1,$2)`, /invalid or expired/i, 'token is single-use (second claim fails)', [D, token]);
ok((await okq('C', 'select * from escrow_deals', 'client reads deals')).length === 1, 'client sees the deal after claiming');
ok((await okq('X', 'select * from escrow_deals', 'squatter reads deals')).length === 0, 'squatter still sees nothing');
await bad('service', `update escrow_deals set client_user_id = '${U.X}' where id=$1`, /cannot be changed once claimed/i, 'claimed client cannot be swapped', [D]);

// =============================================================================
// 6. Transitions + actors + atomic RPC
// =============================================================================
await bad('P', `select escrow_transition_deal($1,'active','proposed')`, /illegal deal transition/i, 'provider cannot accept own deal', [D]);
await bad('C', `select escrow_transition_deal($1,'active','draft')`, /no longer in state/i, 'stale expected state is rejected (race guard)', [D]);
await okq('C', `select escrow_transition_deal($1,'active','proposed','looks good')`, 'client accepts', [D]);
{
  const ev = await events(D);
  const last = ev[ev.length - 1];
  ok(last.type === 'deal_accepted' && last.actor === 'client', 'deal_accepted event actor is client');
}
await bad('P', `update escrow_deals set currency = 'USDC' where id=$1`, /frozen/i, 'currency frozen when active', [D]);

// milestones
await bad('C', `select escrow_transition_milestone(m.id,'delivered','pending') from escrow_milestones m where m.deal_id=$1 and position=1`, /illegal milestone transition/i, 'client cannot deliver', [D]);
await okq('P', `select escrow_transition_milestone(m.id,'delivered','pending') from escrow_milestones m where m.deal_id=$1`, 'provider delivers both milestones', [D]);
await bad('P', `select escrow_transition_milestone(m.id,'approved','delivered') from escrow_milestones m where m.deal_id=$1 and position=1`, /illegal milestone transition/i, 'provider cannot approve own work', [D]);
await bad('C', `select escrow_transition_milestone(m.id,'approved','delivered') from escrow_milestones m where m.deal_id=$1 and position=2`, /earlier milestones/i, 'cannot approve #2 before #1', [D]);
await okq('C', `select escrow_transition_milestone(m.id,'approved','delivered','ok') from escrow_milestones m where m.deal_id=$1 and position=1`, 'client approves #1', [D]);
await okq('C', `select escrow_transition_milestone(m.id,'approved','delivered') from escrow_milestones m where m.deal_id=$1 and position=2`, 'client approves #2', [D]);
ok((await as('service', `select count(*) c from escrow_milestones where deal_id=$1 and approved_at is not null`, [D])).rows[0].c === 2, 'approved_at set by trigger');
await bad('P', `update escrow_milestones set amount = 99999 where deal_id=$1`, /draft/i, 'amount cannot be raised after acceptance (audit #3 exploit)', [D]);

// complete: only admin
await bad('C', `select escrow_transition_deal($1,'completed','active')`, /illegal deal transition/i, 'client cannot complete', [D]);
await bad('P', `select escrow_transition_deal($1,'completed','active')`, /illegal deal transition/i, 'provider cannot complete', [D]);
await okq('service', `select escrow_transition_deal($1,'completed','active')`, 'admin (service_role) completes', [D]);
{
  const types = (await events(D)).map((e) => `${e.type}:${e.actor}`).join();
  ok(types === 'deal_created:provider,deal_proposed:provider,deal_accepted:client,milestone_delivered:provider,milestone_delivered:provider,milestone_approved:client,milestone_approved:client,deal_completed:admin',
    `full event trail is exactly the real actions (got ${types})`);
}

// completion guard + cancel-pre-acceptance on a second deal
{
  const [d2] = await okq('P', `insert into escrow_deals (provider_id, client_email, title) values ('${U.P}','z@x.com','Second deal') returning id`, 'second deal');
  await bad('P', `select escrow_transition_deal($1,'proposed','draft')`, /without milestones/i, 'cannot propose without milestones', [d2.id]);
  await okq('P', `insert into escrow_milestones (deal_id, position, title, amount) values ($1,1,'Only one',50)`, 'milestone for deal 2', [d2.id]);
  await okq('P', `select escrow_transition_deal($1,'proposed','draft')`, 'propose deal 2', [d2.id]);
  await bad('service', `update escrow_deals set state='active' where id=$1`, /illegal deal transition/i, 'admin cannot force-activate an unaccepted deal', [d2.id]);
  await okq('P', `select escrow_transition_deal($1,'cancelled','proposed')`, 'provider cancels before acceptance', [d2.id]);
  await bad('P', `select escrow_transition_deal($1,'proposed','cancelled')`, /illegal deal transition/i, 'cancelled is terminal', [d2.id]);
}

// =============================================================================
// 7. Parity: SQL fee view math == core/fees.ts (3000 random sums + ugly edges)
// =============================================================================
{
  const cents = [1, 5, 10, 15, 25, 99, 100, 101, 105, 995, 1005, 33333, 99999999];
  for (let i = 0; i < 3000; i++) cents.push(1 + Math.floor(Math.random() * 5_000_000));
  const rows = (await db.query(
    `select c, round(round(c::numeric/100, 2) * 0.10, 2) as fee from unnest($1::bigint[]) as t(c)`,
    [cents]
  )).rows;
  let diff = 0;
  for (const r of rows) {
    const ts = computeFees({ feeRate: 0.1 }, [{ amount: Number(r.c) / 100 }]).feeAmount;
    if (Math.abs(ts - Number(r.fee)) > 1e-9) diff++;
  }
  ok(diff === 0, `fee math identical in SQL and TS over ${rows.length} amounts (diffs: ${diff})`);
  const [v] = (await as('P', 'select total_amount, fee_amount, provider_net from escrow_deal_fees where deal_id=$1', [D])).rows;
  ok(Number(v.total_amount) === 300 && Number(v.fee_amount) === 30 && Number(v.provider_net) === 270, 'fee view: 300 total, 30 fee, 270 net');
}

console.log(`\nsql: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
