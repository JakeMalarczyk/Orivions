import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyAdmin } from '@/lib/notify';
import { writeClient } from '@/lib/supabaseServer';

// Newsletter signups. Same guards as /api/waitlist (captcha, per-IP limit), plus an
// explicit consent flag that is stored with the row. When BUTTONDOWN_API_KEY is set
// the address is also handed to Buttondown, which sends its own confirmation email
// (double opt-in) and owns unsubscribes; the row is then 'active'. Without the key the
// row stays 'pending' and nobody is mailed.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_TEXT =
  'I agree to receive the Orivions newsletter by email. I can unsubscribe at any time.';

async function sendToButtondown(email: string, role: string, source: string): Promise<string | null> {
  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        tags: [role],
        metadata: { source },
        referrer_url: `https://orivions.com${source}`,
      }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string };
    return data.id ?? 'ok';
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Server misconfigured: Supabase env vars not set.' }, { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(supabase, `newsletter:${ip}`, 5, 600))) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: { email?: unknown; role?: unknown; consent?: unknown; source?: unknown; captchaToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: 'Please tick the consent box.' }, { status: 400 });
  }
  const role = body.role === 'provider' ? 'provider' : 'client';
  const source =
    typeof body.source === 'string' && body.source.startsWith('/') ? body.source.slice(0, 80) : '/newsletter';

  if (!(await verifyTurnstile(body.captchaToken, ip))) {
    return NextResponse.json({ error: 'Captcha check failed.' }, { status: 403 });
  }

  const external = await sendToButtondown(email, role, source);
  const now = new Date().toISOString();
  const { error } = await (writeClient() ?? supabase).from('newsletter_subscribers').insert({
    email,
    role,
    source,
    status: external ? 'active' : 'pending',
    consent_at: now,
    consent_text: CONSENT_TEXT,
    external_id: external,
  });
  // 23505 = already on the list: report success so the form cannot be used to probe addresses.
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: 'Could not save your email.' }, { status: 500 });
  }
  if (!error) await notifyAdmin(['📰 New newsletter signup', `${email} (${role})`, source]);
  return NextResponse.json({ ok: true });
}
