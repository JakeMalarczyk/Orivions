import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Client for server-side writes (waitlist, concierge, leads, rate limiting, analytics).
// With SUPABASE_SERVICE_ROLE_KEY set it uses the service role, so the database can
// refuse these writes from the public anon key (supabase/migrations/15_server_writes.sql)
// and the captcha and rate limits cannot be bypassed by calling PostgREST directly.
// Without the key it falls back to the anon key, which keeps the site working until
// the variable is added; apply migration 15 only after that.
// Never import this from client components: the service role key bypasses RLS.

export function writeClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
