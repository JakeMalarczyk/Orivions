import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyAdmin } from '@/lib/notify';
import { writeClient } from '@/lib/supabaseServer';

// Waitlist signups go through the server so we can check the captcha and
// rate-limit by IP before anything is written to Supabase.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Server misconfigured: Supabase env vars not set.' }, { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(supabase, `waitlist:${ip}`, 5, 600))) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: { email?: unknown; captchaToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.captchaToken, ip))) {
    return NextResponse.json({ error: 'Captcha check failed.' }, { status: 403 });
  }

  const { error } = await (writeClient() ?? supabase).from('waitlist').insert({ email });
  if (error) {
    return NextResponse.json({ error: 'Could not save your email.' }, { status: 500 });
  }
  await notifyAdmin(['📬 New waitlist signup', email]);
  return NextResponse.json({ ok: true });
}
