import { createClient } from '@supabase/supabase-js';
import type { Company, PortfolioItem, Service } from '@/lib/supabase';

// Server-side reads for the public directory and /providers/<slug> pages, so
// crawlers and AI agents get real HTML instead of a client-side "Loading…".
// Uses the anon key: only columns granted to anon (see migrations 06 and 10).

export interface PublicProvider extends Company {
  slug: string;
  updated_at: string;
  location: string | null;
  team_size: string | null;
  founded_year: number | null;
  x_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
}

const COLUMNS =
  'id, slug, name, description, category, website, verified, featured, founding_provider, verification_requested, account_type, created_at, updated_at, location, team_size, founded_year, x_url, github_url, linkedin_url';

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Same rule as public.company_base_slug() in migration 10. */
export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'provider';
}

export function providerPath(p: { slug?: string | null; name: string }): string {
  return `/providers/${p.slug || slugify(p.name)}`;
}

/** Normalizes a website field ("acme.xyz" or "https://acme.xyz") to a full URL. */
export function websiteUrl(website: string | null): string | null {
  if (!website) return null;
  return `https://${website.replace(/^https?:\/\//, '')}`;
}

/** All provider rows, verified first. Fails soft (empty list) if Supabase is unreachable. */
export async function listProviders(): Promise<PublicProvider[]> {
  const supabase = client();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(COLUMNS)
      .eq('account_type', 'provider')
      .order('verified', { ascending: false })
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return (data as unknown as PublicProvider[]).map((p) => ({ ...p, slug: p.slug || slugify(p.name) }));
  } catch {
    return [];
  }
}

/** Verified providers only: the ones with a public profile page. */
export async function listVerifiedProviders(): Promise<PublicProvider[]> {
  return (await listProviders()).filter((p) => p.verified);
}

export async function getVerifiedProvider(slug: string): Promise<{
  provider: PublicProvider;
  portfolio: PortfolioItem[];
  services: Service[];
} | null> {
  const provider = (await listVerifiedProviders()).find((p) => p.slug === slug);
  const supabase = client();
  if (!provider || !supabase) return null;
  const [{ data: pf }, { data: sv }] = await Promise.all([
    supabase.from('portfolio_items').select('*').eq('company_id', provider.id),
    supabase.from('services').select('*').eq('company_id', provider.id),
  ]);
  return {
    provider,
    portfolio: (pf ?? []) as PortfolioItem[],
    services: (sv ?? []) as Service[],
  };
}
