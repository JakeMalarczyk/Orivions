import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { notifyAdmin } from '@/lib/notify';

// Pings the admin's Telegram about events that happen client-side (signups,
// verification requests). Contact requests to providers are saved and announced by
// /api/lead, behind the captcha. The caller only names
// the event; the message is built from what the server reads in Supabase, so
// nobody can push arbitrary text to the admin through this endpoint.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ADMIN_URL = 'https://orivions.com/admin';

interface CompanyRow {
  id: string;
  name: string;
  category: string | null;
  website: string | null;
  account_type: string;
  verification_requested: boolean;
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.json({ ok: false }, { status: 500 });
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await allowRequest(supabase, `notify:${ip}`, 10, 600))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { event?: unknown; companyId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const select = 'id, name, category, website, account_type, verification_requested';

  // signup / verification: require the user's own session and read their row.
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const { data: userData } = await supabase.auth.getUser(token);
  const user = userData.user;
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  // One ping per user and event per hour, whatever the IP.
  if (!(await allowRequest(supabase, `notify:${user.id}:${String(body.event)}`, 1, 3600))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const { data } = await supabase.from('companies').select(select).eq('id', user.id).maybeSingle();
  const company = data as CompanyRow | null;

  if (body.event === 'signup') {
    // Only for fresh accounts, so the endpoint can't be replayed for old ones.
    if (Date.now() - new Date(user.created_at).getTime() > 10 * 60 * 1000) {
      return NextResponse.json({ ok: false }, { status: 409 });
    }
    const type = company?.account_type ?? (user.user_metadata?.account_type as string | undefined) ?? 'unknown';
    await notifyAdmin([
      type === 'provider' ? '🆕 New provider signup' : '🆕 New client signup',
      `Name: ${company?.name ?? '-'}`,
      `Email: ${user.email ?? '-'}`,
      ADMIN_URL,
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body.event === 'verification') {
    if (!company?.verification_requested) return NextResponse.json({ ok: false }, { status: 409 });
    await notifyAdmin([
      '✅ Verification requested',
      `Provider: ${company.name}`,
      company.category && `Category: ${company.category}`,
      company.website && `Website: ${company.website}`,
      `Email: ${user.email ?? '-'}`,
      ADMIN_URL,
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
