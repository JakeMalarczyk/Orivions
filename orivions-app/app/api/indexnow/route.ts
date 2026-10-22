import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/blog';
import { submitToIndexNow } from '@/lib/indexnow';
import { listVerifiedProviders } from '@/lib/providers';
import { allowRequest } from '@/lib/rateLimit';

// Submits changed URLs to IndexNow, so nobody has to ping by hand.
//
// GET /api/indexnow                  URLs whose sitemap lastModified is within
//                                    the last ?days= (default 3, max 30) days, plus
//                                    the always-changing hubs. Called by the daily
//                                    Vercel cron (vercel.json) and by the GitHub
//                                    Action after every production deploy.
// GET /api/indexnow?provider=<slug>  One provider profile, only if that provider
//                                    is verified. Called by /admin right after
//                                    a provider is verified.
//
// It only ever submits our own sitemap URLs, so it needs no secret; a global
// rate limit keeps it from being used to spam IndexNow. A request with
// "Authorization: Bearer <CRON_SECRET>" (Vercel cron sends it when the env var
// is set) skips the limit.

export const dynamic = 'force-dynamic';

const ALWAYS = ['/', '/providers', '/blog', '/sitemap.xml', '/llms.txt', '/llms-full.txt'];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  const trusted = !!secret && request.headers.get('authorization') === `Bearer ${secret}`;

  if (!trusted) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return NextResponse.json({ ok: false }, { status: 500 });
    const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    if (!(await allowRequest(supabase, 'indexnow', 12, 3600))) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }
  }

  const slug = url.searchParams.get('provider');
  if (slug !== null) {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) return NextResponse.json({ ok: false }, { status: 400 });
    const provider = (await listVerifiedProviders()).find((p) => p.slug === slug);
    if (!provider) return NextResponse.json({ ok: false, error: 'not_verified' }, { status: 404 });
    const urls = [`${SITE_URL}/providers/${slug}`, `${SITE_URL}/providers`, `${SITE_URL}/sitemap.xml`, `${SITE_URL}/llms.txt`];
    const result = await submitToIndexNow(urls);
    return NextResponse.json({ ok: result.status < 300, ...result, urls });
  }

  const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 3, 1), 30);
  const since = Date.now() - days * 86_400_000;
  const entries = await sitemap();
  const changed = entries
    .filter((e) => e.lastModified && new Date(e.lastModified).getTime() >= since)
    .map((e) => e.url);
  const urls = [...ALWAYS.map((p) => `${SITE_URL}${p}`), ...changed];
  const result = await submitToIndexNow(urls);
  return NextResponse.json({ ok: result.status < 300, ...result, days, urls });
}
