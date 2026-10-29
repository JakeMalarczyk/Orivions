import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { writeClient } from '@/lib/supabaseServer';

// Page views and events for the admin Traffic and Campaigns tabs
// (supabase/migrations/09_page_views.sql, 12_seo_tracking.sql).
// Cookieless: the visitor id is a hash of IP + user agent + a salt that changes
// daily, so a person counts once per day and is never stored or tracked across days.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Any server-only secret works as the salt; it only has to be unknown to visitors.
const SALT = process.env.TRACKING_SALT || process.env.TURNSTILE_SECRET_KEY || 'orivions';
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python|node-fetch|axios|vercel/i;
const OWN_HOSTS = new Set(['orivions.com', 'www.orivions.com']);
const EVENTS = new Set([
  'cta_click',
  'outbound_click',
  'calculator_used',
  'concierge_submit',
  'waitlist_signup',
  'signup',
  'lead_sent',
  'smart_match_submit',
]);

function text(value: unknown, max: number, lower = false): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().slice(0, max);
  return v ? (lower ? v.toLowerCase() : v) : null;
}

// Older cached clients send only a referrer and utmSource.
function sourceOf(body: Record<string, unknown>): string | null {
  const direct = text(body.source, 100, true) ?? text(body.utmSource, 100, true);
  if (direct) return direct;
  if (typeof body.referrer !== 'string' || !body.referrer) return null;
  try {
    const host = new URL(body.referrer).hostname.replace(/^www\./, '');
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const path = typeof body.path === 'string' ? (body.path.split('?')[0] ?? '').slice(0, 300) : '';
  if (!path.startsWith('/')) return new NextResponse(null, { status: 400 });
  const isEvent = body.type === 'event';
  const name = text(body.name, 40);
  if (isEvent && (!name || !EVENTS.has(name))) return new NextResponse(null, { status: 400 });

  const supabase = writeClient() ?? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(supabase, `track:${ip}`, 200, 600))) {
    return new NextResponse(null, { status: 429 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash('sha256').update(`${SALT}|${day}|${ip}|${ua}`).digest('hex');
  const country = request.headers.get('x-vercel-ip-country');
  const source = sourceOf(body);
  const medium = text(body.medium, 60, true);
  const campaign = text(body.campaign, 100, true);

  if (isEvent) {
    await supabase.rpc('track_event', {
      p_visitor: visitor,
      p_name: name,
      p_path: path,
      p_label: text(body.label, 80),
      p_target: text(body.target, 200),
      p_placement: text(body.placement, 20, true),
      p_source: source,
      p_medium: medium,
      p_campaign: campaign,
      p_country: country,
    });
  } else {
    await supabase.rpc('track_page_view', {
      p_visitor: visitor,
      p_path: path,
      p_source: source,
      p_country: country,
      p_medium: medium,
      p_campaign: campaign,
    });
  }
  return new NextResponse(null, { status: 204 });
}
