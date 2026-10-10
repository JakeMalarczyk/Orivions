import { createBrowserClient } from '@supabase/ssr';

// AUTH ARCHITECTURE FIX (per external audit finding 2.1):
// The previous version used plain createClient from @supabase/supabase-js,
// which stores the session in localStorage — invisible to Next.js middleware.
// createBrowserClient from @supabase/ssr stores the session in COOKIES, which
// the middleware can actually read. Without this, every logged-in user hit a
// redirect loop on /provider-dashboard and /client-dashboard.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly and early at build/runtime instead of silently breaking every
  // Supabase call later — this is the #1 cause of confusing "it just doesn't work"
  // bugs in the original site, where a missing/placeholder key failed deep inside
  // unrelated code paths.
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.local.example to .env.local and fill in your Supabase project values.'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ---- Shared types, so every component gets compile-time checking instead of
// trusting whatever shape the database happens to return at runtime. ----

export type ProviderCategory =
  | 'Development'
  | 'Security & Audits'
  | 'Infrastructure'
  | 'Legal & Compliance'
  | 'Market Making & Trading'
  | 'Advisory'
  | 'Recruiting & Talent'
  | 'Fundraising & Grants Advisory'
  | 'Data & Analytics'
  | 'DevOps & Technical Support'
  | 'Marketing & Growth'
  | 'PR & Media Relations'
  | 'Community Management'
  | 'Design & Branding'
  | 'Content & Education'
  | 'Customer Support';

export const PROVIDER_CATEGORIES: ProviderCategory[] = [
  'Development',
  'Security & Audits',
  'Infrastructure',
  'Legal & Compliance',
  'Market Making & Trading',
  'Advisory',
  'Recruiting & Talent',
  'Fundraising & Grants Advisory',
  'Data & Analytics',
  'DevOps & Technical Support',
  'Marketing & Growth',
  'PR & Media Relations',
  'Community Management',
  'Design & Branding',
  'Content & Education',
  'Customer Support',
];

export interface Company {
  id: string;
  name: string;
  description: string | null;
  category: ProviderCategory;
  website: string | null;
  verified: boolean;
  featured: boolean;
  founding_provider: boolean;
  verification_requested: boolean;
  referral_code: string | null;
  account_type: 'provider' | 'client';
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
}

export interface Service {
  id: string;
  company_id: string;
  name: string;
  category: ProviderCategory;
  price_min: number;
  price_max: number;
}

export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';

export interface Lead {
  id: string;
  company_id: string;
  client_name: string;
  client_company: string | null;
  client_email: string;
  message: string;
  status: LeadStatus;
  created_at: string;
}
