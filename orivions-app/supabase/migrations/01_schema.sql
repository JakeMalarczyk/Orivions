-- ============================================================
-- ORIVIONS - Supabase schema
-- How to use: Supabase Dashboard → SQL Editor → paste this whole
-- file → Run. Takes ~10 seconds. Safe to re-run (uses IF NOT EXISTS
-- / DROP POLICY IF EXISTS where relevant).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- COMPANIES (one row per authenticated user - provider or client)
-- id = auth.users.id, so it's always 1:1 with a login account
-- ------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  category text default 'Development',
  chains text[] default array['Solana'],
  website text default '',
  account_type text not null default 'provider' check (account_type in ('provider','client')),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

-- Multichain: a provider can work on one or more chains. Solana-first (default),
-- expanding across chains. Idempotent for tables created before this column existed.
alter table public.companies add column if not exists chains text[] default array['Solana'];

-- Rich company profile fields (self-reported by providers in their dashboard).
alter table public.companies add column if not exists location text default '';
alter table public.companies add column if not exists team_size text default '';
alter table public.companies add column if not exists founded_year int;
alter table public.companies add column if not exists x_url text default '';
alter table public.companies add column if not exists github_url text default '';
alter table public.companies add column if not exists linkedin_url text default '';
alter table public.companies add column if not exists discord_url text default '';

drop policy if exists "companies are publicly readable" on public.companies;
create policy "companies are publicly readable"
  on public.companies for select
  using (true);

drop policy if exists "users can insert their own company row" on public.companies;
create policy "users can insert their own company row"
  on public.companies for insert
  with check (auth.uid() = id);

drop policy if exists "users can update their own company row" on public.companies;
create policy "users can update their own company row"
  on public.companies for update
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- PORTFOLIO ITEMS
-- ------------------------------------------------------------
create table if not exists public.portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text default '',
  created_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

drop policy if exists "portfolio is publicly readable" on public.portfolio_items;
create policy "portfolio is publicly readable"
  on public.portfolio_items for select
  using (true);

drop policy if exists "owners can manage their portfolio" on public.portfolio_items;
create policy "owners can manage their portfolio"
  on public.portfolio_items for all
  using (auth.uid() = company_id)
  with check (auth.uid() = company_id);

-- ------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  category text default 'Development',
  price_min integer default 0,
  price_max integer default 0,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "services are publicly readable" on public.services;
create policy "services are publicly readable"
  on public.services for select
  using (true);

drop policy if exists "owners can manage their services" on public.services;
create policy "owners can manage their services"
  on public.services for all
  using (auth.uid() = company_id)
  with check (auth.uid() = company_id);

-- ------------------------------------------------------------
-- LEADS (a client contacting a specific provider)
-- ------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_name text not null,
  client_company text default '',
  client_email text not null,
  message text default '',
  status text not null default 'new' check (status in ('new','contacted','won','lost')),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- anyone (including logged-out visitors) can create a lead for a provider
drop policy if exists "anyone can submit a lead" on public.leads;
create policy "anyone can submit a lead"
  on public.leads for insert
  with check (true);

-- only the provider being contacted can read/update their own leads
drop policy if exists "owners can view their leads" on public.leads;
create policy "owners can view their leads"
  on public.leads for select
  using (auth.uid() = company_id);

drop policy if exists "owners can update their leads" on public.leads;
create policy "owners can update their leads"
  on public.leads for update
  using (auth.uid() = company_id);

-- ------------------------------------------------------------
-- WAITLIST (generic landing-page "notify me" signups - no login needed)
-- ------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "anyone can join waitlist" on public.waitlist;
create policy "anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- ------------------------------------------------------------
-- Auto-create a companies row whenever someone signs up
-- (reads name/account_type from the signup metadata set in login.html)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.companies (id, name, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New account'),
    coalesce(new.raw_user_meta_data->>'account_type', 'provider')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
