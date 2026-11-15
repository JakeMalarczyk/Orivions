import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

// Read-only aggregated traffic report for the local agent workspace (same bearer secret as
// /api/crm-sync). Returns counts only: no visitor hashes, no emails, no message text.
//
// GET /api/stats-report?days=7 -> { ok, days, totals, by_day, top_paths, sources, countries,
//                                   events: [{ name, label, source, campaign, count }], tables }

export const dynamic = 'force-dynamic';

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

function top(rows: Row[], key: string, n: number): { value: string; count: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = String(r[key] ?? '(none)');
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: 'no_service_key' }, { status: 500 });
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const days = Math.min(90, Math.max(1, Number(new URL(request.url).searchParams.get('days') ?? '7') || 7));
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const [views, events] = await Promise.all([
    db.from('page_views').select('visitor_hash, path, source, country, created_at').gte('created_at', since).limit(50000),
    db.from('events').select('visitor_hash, name, path, label, source, campaign, created_at').gte('created_at', since).limit(50000),
  ]);
  if (views.error || events.error) {
    return NextResponse.json({ ok: false, error: (views.error ?? events.error)?.message }, { status: 500 });
  }
  const v = (views.data ?? []) as Row[];
  const e = (events.data ?? []) as Row[];

  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const r of v) {
    const d = String(r.created_at).slice(0, 10);
    const cur = byDay.get(d) ?? { views: 0, visitors: new Set<string>() };
    cur.views += 1;
    cur.visitors.add(String(r.visitor_hash));
    byDay.set(d, cur);
  }

  const evMap = new Map<string, { name: string; label: string; source: string; campaign: string; count: number }>();
  for (const r of e) {
    const k = [r.name, r.label, r.source, r.campaign].join('|');
    const cur = evMap.get(k) ?? {
      name: String(r.name ?? ''),
      label: String(r.label ?? ''),
      source: String(r.source ?? ''),
      campaign: String(r.campaign ?? ''),
      count: 0,
    };
    cur.count += 1;
    evMap.set(k, cur);
  }

  const counts = async (table: string, filter?: [string, string]) => {
    let q = db.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count } = await q;
    return count ?? null;
  };
  const [leads, concierge, waitlist, newsletter, providers, clients] = await Promise.all([
    counts('leads'),
    counts('concierge_requests'),
    counts('waitlist'),
    counts('newsletter_subscribers', ['status', 'active']),
    counts('companies', ['account_type', 'provider']),
    counts('companies', ['account_type', 'client']),
  ]);

  return NextResponse.json({
    ok: true,
    days,
    totals: { page_views: v.length, unique_visitors: new Set(v.map((r) => String(r.visitor_hash))).size, events: e.length },
    by_day: [...byDay.entries()].sort().map(([day, x]) => ({ day, views: x.views, visitors: x.visitors.size })),
    top_paths: top(v, 'path', 15),
    sources: top(v, 'source', 12),
    countries: top(v, 'country', 10),
    events: [...evMap.values()].sort((a, b) => b.count - a.count).slice(0, 40),
    tables: { leads, concierge_requests: concierge, waitlist, newsletter_active: newsletter, providers, clients },
  });
}
