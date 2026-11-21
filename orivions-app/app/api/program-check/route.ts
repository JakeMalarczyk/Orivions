import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { checkProgram } from '@/lib/solanaProgram';

// Free tool: who can upgrade a Solana program. Public chain data only, no keys involved.
// Rate limited per IP (shared Postgres counter, see lib/rateLimit.ts).

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const WINDOW_SECONDS = 3600;
const MAX_REQUESTS = 30;

export async function POST(request: Request) {
  let body: { address?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  if (!address || address.length > 60) {
    return NextResponse.json({ error: 'Enter a program address.' }, { status: 400 });
  }
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0]!.trim();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    if (!(await allowRequest(supabase, `program-check:${ip}`, MAX_REQUESTS, WINDOW_SECONDS))) {
      return NextResponse.json({ error: 'Too many checks from this connection. Try again later.' }, { status: 429 });
    }
  }
  const result = await checkProgram(address);
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
