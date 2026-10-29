import type { SupabaseClient } from '@supabase/supabase-js';
import { writeClient } from '@/lib/supabaseServer';

// Shared rate limiter for the AI API routes. The counter lives in Postgres
// (rate_limit_hit() in supabase/migrations/07_rate_limit.sql), so every
// serverless instance sees the same budget. The call goes through the service role
// client when configured, so anon callers cannot poke other people's buckets. If the RPC fails (Supabase outage,
// migration not applied yet) we fall back to a per-instance in-memory counter
// rather than letting every request through.

const memoryHits = new Map<string, number[]>();

function memoryAllow(bucket: string, max: number, windowSeconds: number): boolean {
  const now = Date.now();
  const recent = (memoryHits.get(bucket) ?? []).filter((t) => now - t < windowSeconds * 1000);
  if (recent.length >= max) {
    memoryHits.set(bucket, recent);
    return false;
  }
  recent.push(now);
  memoryHits.set(bucket, recent);
  return true;
}

export async function allowRequest(
  supabase: SupabaseClient,
  bucket: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await (writeClient() ?? supabase).rpc('rate_limit_hit', {
    p_bucket: bucket,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== 'boolean') {
    return memoryAllow(bucket, max, windowSeconds);
  }
  return data;
}
