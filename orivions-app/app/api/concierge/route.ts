import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';

// Concierge requests: a team asks for a hand-picked shortlist instead of (or
// after) an automatic Smart Match. Rows land in concierge_requests and show up
// in the admin panel's Concierge tab.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
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

  const { error } = await supabase.from('concierge_requests').insert({
    client_name: name,
    client_email: email,
    client_company: field(body.company, 120),
    project_description: need,
    budget_range: field(body.budget, 60),
    timeline: field(body.timeline, 60),
    category: field(body.source, 60),
  });
  if (error) {
    return NextResponse.json({ error: 'Could not save your request.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
