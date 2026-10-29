import { NextResponse } from 'next/server';
import { allowRequest } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyAdmin } from '@/lib/notify';
import { writeClient } from '@/lib/supabaseServer';

// Direct message from a visitor to a provider. Saved as a lead (the provider reads it
// in their dashboard) and announced to the admin. Goes through the server so the
// captcha and the per-IP limit apply; the database refuses direct anon inserts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ADMIN_URL = 'https://orivions.com/admin';

function field(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const db = writeClient();
  if (!db) return NextResponse.json({ error: 'Server misconfigured: Supabase env vars not set.' }, { status: 500 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(db, `lead:${ip}`, 5, 600))) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const companyId = field(body.companyId, 64);
  const name = field(body.name, 120);
  const email = field(body.email, 254).toLowerCase();
  const message = field(body.message, 4000);
  if (!UUID_RE.test(companyId) || !name || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json({ error: 'Please fill in your name, email, and message.' }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.captchaToken, ip))) {
    return NextResponse.json({ error: 'Captcha check failed.' }, { status: 403 });
  }

  const { data: provider } = await db.from('companies').select('id, name').eq('id', companyId).maybeSingle();
  if (!provider) return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });

  const { error } = await db.from('leads').insert({
    company_id: companyId,
    client_name: name,
    client_company: field(body.company, 120),
    client_email: email,
    message,
    status: 'new',
  });
  if (error) return NextResponse.json({ error: 'Could not send your message.' }, { status: 500 });

  await notifyAdmin(['📩 New contact request', `To provider: ${provider.name}`, ADMIN_URL]);
  return NextResponse.json({ ok: true });
}
