import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';

// Page view counter for the admin Traffic tab (supabase/migrations/09_page_views.sql).
// Cookieless: the visitor id is a hash of IP + user agent + a salt that changes
// daily, so a person counts once per day and is never stored or tracked across days.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Any server-only secret works as the salt; it only has to be unknown to visitors.
const SALT = process.env.TRACKING_SALT || process.env.TURNSTILE_SECRET_KEY || 'orivions';
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python|node-fetch|axios|vercel/i;
const OWN_HOSTS = new Set(['orivions.com', 'www.orivions.com']);

function sourceOf(referrer: unknown, utmSource: unknown): string | null {
  if (typeof utmSource === 'string' && utmSource.trim()) return utmSource.trim().toLowerCase().slice(0, 100);
  if (typeof referrer !== 'string' || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    return OWN_HOSTS.has(host) || OWN_HOSTS.has(`www.${host}`) ? null : host;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const ua = request.headers.get('user-agent') ?? '';
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ua || BOT_RE.test(ua)) {
    return new NextResponse(null, { status: 204 });
  }

  let body: { path?: unknown; referrer?: unknown; utmSource?: unknown };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const path = typeof body.path === 'string' ? (body.path.split('?')[0] ?? '').slice(0, 300) : '';
  if (!path.startsWith('/')) return new NextResponse(null, { status: 400 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(supabase, `track:${ip}`, 100, 600))) {
    return new NextResponse(null, { status: 429 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash('sha256').update(`${SALT}|${day}|${ip}|${ua}`).digest('hex');
  await supabase.rpc('track_page_view', {
    p_visitor: visitor,
    p_path: path,
    p_source: sourceOf(body.referrer, body.utmSource),
    p_country: request.headers.get('x-vercel-ip-country'),
  });
  return new NextResponse(null, { status: 204 });
}
