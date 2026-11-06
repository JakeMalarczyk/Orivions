import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyAdmin } from '@/lib/notify';
import { writeClient } from '@/lib/supabaseServer';

// Concierge requests: a team asks for a hand-picked shortlist instead of (or
// after) an automatic Smart Match. Rows land in concierge_requests and show up
// in the admin panel's Concierge tab.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Optional detail fields are free-form but capped; the dropdown ones are
// whitelisted so the admin table stays clean.
const STAGES = ['Idea', 'Building', 'Testnet', 'Pre-mainnet', 'Live'];
const FUNDING = ['Bootstrapped', 'Pre-seed', 'Seed', 'Series A+', 'Grant funded'];
const TEAM = ['Solo', '2-5', '6-15', '16+'];
const CHAINS = ['Solana', 'Ethereum / EVM', 'Multi-chain', 'Other'];
const NEEDS = ['Security audit', 'Legal / compliance', 'Marketing / growth', 'Development', 'Other'];
function pick(value: unknown, allowed: string[]): string {
  return typeof value === 'string' && allowed.includes(value) ? value : '';
}
// A website or GitHub link: keep it only if it looks like a URL, never executable.
function link(value: unknown): string {
  const v = field(value, 200);
  if (!v) return '';
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes('.') ? u.toString().slice(0, 200) : '';
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Server misconfigured: Supabase env vars not set.' }, { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(supabase, `concierge:${ip}`, 3, 600))) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const name = field(body.name, 120);
  const email = field(body.email, 254).toLowerCase();
  const need = field(body.need, 2000);
  if (name.length < 2 || !EMAIL_RE.test(email) || need.length < 10) {
    return NextResponse.json({ error: 'Enter your name, a valid email and a short project description.' }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.captchaToken, ip))) {
    return NextResponse.json({ error: 'Captcha check failed.' }, { status: 403 });
  }

  const company = field(body.company, 120);
  const budget = field(body.budget, 60);
  const timeline = field(body.timeline, 60);
  const source = field(body.source, 60);
  const website = link(body.website);
  const stage = pick(body.stage, STAGES);
  const chain = pick(body.chain, CHAINS);
  const funding = pick(body.funding, FUNDING);
  const team = pick(body.team, TEAM);
  const needCategory = pick(body.needCategory, NEEDS);
  const { error } = await (writeClient() ?? supabase).from('concierge_requests').insert({
    client_name: name,
    client_email: email,
    client_company: company,
    project_description: need,
    budget_range: budget,
    timeline,
    category: source,
    repo_url: website,
    chain,
    project_stage: stage,
    funding,
    team_size: team,
    need_category: needCategory,
  });
  if (error) {
    return NextResponse.json({ error: 'Could not save your request.' }, { status: 500 });
  }
  await notifyAdmin([
    '🔥 New shortlist request (concierge)',
    `${name}${company ? ` · ${company}` : ''} <${email}>`,
    (budget || timeline) && [budget, timeline].filter(Boolean).join(' · '),
    needCategory && `Needs: ${needCategory}`,
    [stage, chain, funding, team && `team ${team}`].filter(Boolean).join(' · '),
    website && `Site: ${website}`,
    source && `Source: ${source}`,
    '',
    need.slice(0, 800),
    '',
    'https://orivions.com/admin',
  ]);
  return NextResponse.json({ ok: true });
}
