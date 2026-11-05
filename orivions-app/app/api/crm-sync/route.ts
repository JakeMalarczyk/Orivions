import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

// Two-way sync endpoint for the outreach CRM (tables crm_companies and crm_notes,
// supabase/migrations/16_admin_crm.sql). The local agent workspace keeps a working copy of the
// CRM; scripts there call this route to pull what the team changed in /admin and to push what
// the agents changed (new contacts, replies, follow-up dates).
//
// Auth: "Authorization: Bearer <CRM_SYNC_SECRET>". Without the secret set the route refuses
// every request. It needs the service role key, because the tables are admin-only under RLS.
//
// GET  -> { companies: [...], notes: [...] }
// POST -> body { companies: [{ id?, name, side, ... }], notes: [{ side, name, kind, body, created_at }] }
//         companies with an id are updated, the others are inserted; notes are matched to their
//         company by side + name and skipped when an identical note already exists.

export const dynamic = 'force-dynamic';

const COLUMNS = [
  'name',
  'side',
  'category',
  'country',
  'contact',
  'confidence',
  'source',
  'stage',
  'next_step',
  'due',
  'owner',
  'breakpoint',
  'meeting_at',
] as const;

type Row = Record<string, unknown>;

function authorized(request: Request): boolean {
  const secret = process.env.CRM_SYNC_SECRET;
  if (!secret || secret.length < 24) return false;
  const given = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function clean(row: Row): Row {
  const out: Row = {};
  for (const col of COLUMNS) {
    if (col in row) out[col] = row[col] === '' ? null : row[col];
  }
  return out;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const db = admin();
  if (!db) return NextResponse.json({ ok: false, error: 'no_service_key' }, { status: 500 });

  const [companies, notes] = await Promise.all([
    db.from('crm_companies').select('*').order('id', { ascending: true }).limit(5000),
    db.from('crm_notes').select('id, company_id, kind, body, created_at').order('id', { ascending: true }).limit(20000),
  ]);
  if (companies.error || notes.error) {
    return NextResponse.json({ ok: false, error: (companies.error ?? notes.error)?.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, companies: companies.data, notes: notes.data });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const db = admin();
  if (!db) return NextResponse.json({ ok: false, error: 'no_service_key' }, { status: 500 });

  let body: { companies?: Row[]; notes?: Row[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  const companies = Array.isArray(body.companies) ? body.companies.slice(0, 2000) : [];
  const notes = Array.isArray(body.notes) ? body.notes.slice(0, 5000) : [];

  let updated = 0;
  let inserted = 0;
  const errors: string[] = [];

  for (const row of companies) {
    const values = clean(row);
    if (typeof row.id === 'number') {
      const { error } = await db.from('crm_companies').update(values).eq('id', row.id);
      if (error) errors.push(`${row.name}: ${error.message}`);
      else updated += 1;
    } else if (typeof values.name === 'string' && typeof values.side === 'string') {
      const { error } = await db.from('crm_companies').insert(values);
      if (error) errors.push(`${values.name}: ${error.message}`);
      else inserted += 1;
    }
  }

  let notesAdded = 0;
  if (notes.length) {
    const { data: all } = await db.from('crm_companies').select('id, side, name').limit(5000);
    const byKey = new Map((all ?? []).map((c) => [`${c.side}|${String(c.name).toLowerCase()}`, c.id as number]));
    const { data: existing } = await db.from('crm_notes').select('company_id, kind, body').limit(20000);
    const seen = new Set((existing ?? []).map((n) => `${n.company_id}|${n.kind}|${n.body}`));
    const fresh: Row[] = [];
    for (const n of notes) {
      const id = byKey.get(`${n.side}|${String(n.name).toLowerCase()}`);
      if (!id || typeof n.body !== 'string' || !n.body) continue;
      const kind = typeof n.kind === 'string' ? n.kind : 'note';
      const key = `${id}|${kind}|${n.body}`;
      if (seen.has(key)) continue;
      seen.add(key);
      fresh.push({ company_id: id, kind, body: n.body.slice(0, 4000), ...(n.created_at ? { created_at: n.created_at } : {}) });
    }
    if (fresh.length) {
      const { error } = await db.from('crm_notes').insert(fresh);
      if (error) errors.push(`notes: ${error.message}`);
      else notesAdded = fresh.length;
    }
  }

  return NextResponse.json({ ok: !errors.length, updated, inserted, notesAdded, errors: errors.slice(0, 10) });
}
