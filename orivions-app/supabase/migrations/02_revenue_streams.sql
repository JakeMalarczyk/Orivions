-- ============================================================
-- ORIVIONS - Migracja: 9 strumieni przychodu
-- Bezpieczna do uruchomienia na już istniejącej bazie (IF NOT EXISTS wszędzie).
-- Wklej w Supabase → SQL Editor → Run, PO wcześniejszym schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- Sponsored / Featured placement (strumień #4)
-- Jawnie oznaczone, oddzielone od organicznego Leaders Board
-- ------------------------------------------------------------
alter table public.companies add column if not exists featured boolean not null default false;
alter table public.companies add column if not exists featured_until date;

-- ------------------------------------------------------------
-- Weryfikacja na żądanie (strumień #2)
-- Provider prosi o weryfikację, admin ręcznie potwierdza po opłacie
-- ------------------------------------------------------------
alter table public.companies add column if not exists verification_requested boolean not null default false;
alter table public.companies add column if not exists verification_requested_at timestamptz;

-- ------------------------------------------------------------
-- Program referralowy społecznościowy (strumień #7)
-- ------------------------------------------------------------
alter table public.companies add column if not exists referral_code text unique;

create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_company_id uuid not null references public.companies(id) on delete cascade,
  referred_email text not null,
  referred_type text not null default 'provider' check (referred_type in ('provider','client')),
  status text not null default 'pending' check (status in ('pending','signed_up','rewarded')),
  created_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

drop policy if exists "owners can view their referrals" on public.referrals;
create policy "owners can view their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_company_id);

drop policy if exists "owners can create referrals" on public.referrals;
create policy "owners can create referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_company_id);

-- ------------------------------------------------------------
-- Auto-generacja kodu referralowego przy rejestracji
-- ------------------------------------------------------------
create or replace function public.generate_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substring(md5(new.id::text) from 1 for 8));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_company_created_referral_code on public.companies;
create trigger on_company_created_referral_code
  before insert on public.companies
  for each row execute function public.generate_referral_code();

-- ------------------------------------------------------------
-- Concierge Matching requests (strumień #5) - proste zgłoszenia, obsługa ręczna
-- ------------------------------------------------------------
create table if not exists public.concierge_requests (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  client_email text not null,
  client_company text default '',
  project_description text default '',
  budget_range text default '',
  timeline text default '',
  repo_url text default '',
  category text default '',
  chain text default '',
  status text not null default 'new' check (status in ('new','in_progress','matched','closed')),
  created_at timestamptz not null default now()
);

-- Idempotent: if the table already existed from an earlier run, add the newer columns.
alter table public.concierge_requests add column if not exists timeline text default '';
alter table public.concierge_requests add column if not exists repo_url text default '';
alter table public.concierge_requests add column if not exists category text default '';
alter table public.concierge_requests add column if not exists chain text default '';
-- project_description no longer required (category is the main matching signal now)
alter table public.concierge_requests alter column project_description drop not null;
alter table public.concierge_requests alter column project_description set default '';

alter table public.concierge_requests enable row level security;

drop policy if exists "anyone can submit concierge request" on public.concierge_requests;
create policy "anyone can submit concierge request"
  on public.concierge_requests for insert
  with check (true);

-- Note: reading concierge_requests is intentionally NOT open to anon -
-- only accessible via the Supabase dashboard / a future admin role.
