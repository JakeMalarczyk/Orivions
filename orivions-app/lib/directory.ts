import { createClient } from '@supabase/supabase-js';

// Early access: until the first cohort of verified providers is listed, public
// pages do not show empty lists or zero counts. The directory, automatic Smart
// Match and live insights switch on by themselves once this many providers are
// verified; until then teams get a shortlist hand-picked by the Orivions team.
export const DIRECTORY_MIN_VERIFIED = 3;

export function isDirectoryOpen(verifiedCount: number): boolean {
  return verifiedCount >= DIRECTORY_MIN_VERIFIED;
}

/** Server-side count of verified providers. Fails closed (0) if Supabase is unreachable. */
export async function verifiedProviderCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 0;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { count, error } = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('account_type', 'provider')
      .eq('verified', true);
    return error ? 0 : count ?? 0;
  } catch {
    return 0;
  }
}
