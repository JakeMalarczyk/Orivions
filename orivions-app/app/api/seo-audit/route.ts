import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/blog';

// Admin-only site audit: crawls the live sitemap and checks every page for the
// basics of SEO and GEO. Used by the "SEO & GEO" tab in /admin.
//
// POST with "Authorization: Bearer <supabase access token>". The token is checked
// with public.is_admin(), so nobody else can make the server crawl the site.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Severity = 'error' | 'warning';
interface Issue {
  sev: Severity;
  code: string;
  msg: string;
}
interface PageResult {
  path: string;
  status: number;
  title: string;
  titleLen: number;
  descLen: number;
  h1: number;
  words: number;
  schema: string[];
  issues: Issue[];
}
interface SiteCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const UA = 'OrivionsSiteAudit/1.0';

async function get(url: string, redirect: RequestRedirect = 'follow') {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    return await fetch(url, { redirect, signal: ctrl.signal, headers: { 'user-agent': UA }, cache: 'no-store' });
  } finally {
    clearTimeout(timer);
  }
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? '') : null;
}

function metaContent(html: string, key: string, value: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attr(tag, key)?.toLowerCase() === value) return attr(tag, 'content');
  }
  return null;
}

function collectTypes(node: unknown, out: Set<string>) {
  if (Array.isArray(node)) return node.forEach((n) => collectTypes(n, out));
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  const t = obj['@type'];
  if (typeof t === 'string') out.add(t);
  else if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && out.add(x));
  Object.values(obj).forEach((v) => collectTypes(v, out));
}

function audit(path: string, status: number, html: string): PageResult {
  const issues: Issue[] = [];
  const add = (sev: Severity, code: string, msg: string) => issues.push({ sev, code, msg });

  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' '));
  const desc = metaContent(html, 'name', 'description') ?? '';
  const robots = (metaContent(html, 'name', 'robots') ?? '').toLowerCase();
  const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? []).find((t) => attr(t, 'rel')?.toLowerCase() === 'canonical');
  const canonical = canonicalTag ? attr(canonicalTag, 'href') : null;

  const types = new Set<string>();
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectTypes(JSON.parse(m[1] ?? ''), types);
    } catch {
      add('error', 'jsonld-invalid', 'A JSON-LD block is not valid JSON.');
    }
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = decode(text).split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;

  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const noAlt = imgs.filter((t) => attr(t, 'alt') === null).length;
  const internal = new Set(
    [...html.matchAll(/<a\b[^>]*\shref\s*=\s*["']([^"'#]+)["']/gi)]
      .map((m) => m[1] ?? '')
      .filter((h) => (h.startsWith('/') && !h.startsWith('//')) || h.startsWith(SITE_URL))
      .map((h) => h.replace(SITE_URL, '').split('?')[0]),
  );

  if (status !== 200) add('error', 'status', `Returns HTTP ${status}.`);
  if (robots.includes('noindex')) add('error', 'noindex', 'Page has noindex.');
  if (!title) add('error', 'title-missing', 'No <title>.');
  else if (title.length > 65) add('warning', 'title-long', `Title is ${title.length} characters (max 65), it will be cut in results.`);
  else if (title.length < 25) add('warning', 'title-short', `Title is only ${title.length} characters.`);
  if (!desc) add('error', 'desc-missing', 'No meta description.');
  else if (desc.length > 160) add('warning', 'desc-long', `Description is ${desc.length} characters (max 160).`);
  else if (desc.length < 70) add('warning', 'desc-short', `Description is only ${desc.length} characters.`);
  if (h1 === 0) add('error', 'h1-missing', 'No <h1>.');
  else if (h1 > 1) add('warning', 'h1-multiple', `${h1} <h1> elements.`);
  if (!canonical) add('error', 'canonical-missing', 'No canonical URL.');
  else if (canonical.replace(/\/$/, '') !== `${SITE_URL}${path}`.replace(/\/$/, '')) {
    add('warning', 'canonical-other', `Canonical points to ${canonical}.`);
  }
  if (!metaContent(html, 'property', 'og:title') || !metaContent(html, 'property', 'og:image')) {
    add('warning', 'og-missing', 'Missing og:title or og:image.');
  }
  if (!types.size) add('warning', 'schema-missing', 'No JSON-LD structured data.');
  if (words < 250) add('warning', 'thin', `Only ${words} words of content.`);
  if (noAlt) add('warning', 'img-alt', `${noAlt} image(s) without an alt attribute.`);
  if (internal.size < 3) add('warning', 'few-links', `Only ${internal.size} internal links.`);

  return { path, status, title, titleLen: title.length, descLen: desc.length, h1, words, schema: [...types], issues };
}

async function siteChecks(): Promise<SiteCheck[]> {
  const checks: SiteCheck[] = [];
  const probe = async (name: string, fn: () => Promise<{ ok: boolean; detail: string }>) => {
    try {
      checks.push({ name, ...(await fn()) });
    } catch (e) {
      checks.push({ name, ok: false, detail: e instanceof Error ? e.message : 'request failed' });
    }
  };

  await probe('robots.txt lists the sitemap', async () => {
    const r = await get(`${SITE_URL}/robots.txt`);
    const t = await r.text();
    return { ok: r.ok && /sitemap:/i.test(t), detail: `HTTP ${r.status}` };
  });
  await probe('AI crawlers allowed (GPTBot, ClaudeBot, PerplexityBot)', async () => {
    const t = await (await get(`${SITE_URL}/robots.txt`)).text();
    const missing = ['GPTBot', 'ClaudeBot', 'PerplexityBot'].filter((b) => !t.includes(b));
    return { ok: missing.length === 0, detail: missing.length ? `Not listed: ${missing.join(', ')}` : 'All listed' };
  });
  for (const file of ['llms.txt', 'llms-full.txt', 'sitemap.xml', 'rss.xml', 'og-image.png', 'favicon.ico']) {
    await probe(`/${file} exists`, async () => {
      const r = await get(`${SITE_URL}/${file}`);
      return { ok: r.ok, detail: `HTTP ${r.status}` };
    });
  }
  await probe('www redirects to orivions.com', async () => {
    const r = await get('https://www.orivions.com/', 'manual');
    const loc = r.headers.get('location') ?? '';
    return { ok: [301, 308].includes(r.status) && loc.startsWith(SITE_URL), detail: `HTTP ${r.status} ${loc}` };
  });
  await probe('http redirects to https', async () => {
    const r = await get('http://orivions.com/', 'manual');
    const loc = r.headers.get('location') ?? '';
    return { ok: [301, 308].includes(r.status) && loc.startsWith('https://'), detail: `HTTP ${r.status}` };
  });
  await probe('Unknown URL returns 404', async () => {
    const r = await get(`${SITE_URL}/this-page-does-not-exist-audit`);
    return { ok: r.status === 404, detail: `HTTP ${r.status}` };
  });
  await probe('HSTS header', async () => {
    const r = await get(SITE_URL);
    const h = r.headers.get('strict-transport-security') ?? '';
    return { ok: /max-age=\d{7,}/.test(h), detail: h || 'missing' };
  });
  return checks;
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const auth = request.headers.get('authorization') ?? '';
  if (!url || !key || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const supabase = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: auth } } });
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sitemap = await (await get(`${SITE_URL}/sitemap.xml`)).text();
  const paths = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)]
    .map((m) => (m[1] ?? '').replace(SITE_URL, '') || '/')
    .filter((p) => p.startsWith('/'))
    .slice(0, 150);

  const pages: PageResult[] = [];
  let next = 0;
  async function worker() {
    while (next < paths.length) {
      const path = paths[next++]!;
      try {
        const r = await get(`${SITE_URL}${path}`);
        pages.push(audit(path, r.status, await r.text()));
      } catch {
        pages.push({ path, status: 0, title: '', titleLen: 0, descLen: 0, h1: 0, words: 0, schema: [], issues: [{ sev: 'error', code: 'fetch', msg: 'Request failed or timed out.' }] });
      }
    }
  }
  const [site] = await Promise.all([siteChecks(), ...Array.from({ length: 8 }, worker)]);

  // Duplicates across pages.
  const seen = new Map<string, string[]>();
  for (const p of pages) if (p.title) seen.set(p.title, [...(seen.get(p.title) ?? []), p.path]);
  for (const [t, list] of seen) {
    if (list.length > 1) {
      for (const p of pages.filter((x) => list.includes(x.path))) {
        p.issues.push({ sev: 'warning', code: 'title-duplicate', msg: `Same title as ${list.filter((x) => x !== p.path).join(', ')}.` });
      }
      void t;
    }
  }

  pages.sort((a, b) => a.path.localeCompare(b.path));
  const errors = pages.reduce((n, p) => n + p.issues.filter((i) => i.sev === 'error').length, 0) + site.filter((c) => !c.ok).length;
  const warnings = pages.reduce((n, p) => n + p.issues.filter((i) => i.sev === 'warning').length, 0);
  return NextResponse.json({ ranAt: new Date().toISOString(), pages, site, errors, warnings });
}
