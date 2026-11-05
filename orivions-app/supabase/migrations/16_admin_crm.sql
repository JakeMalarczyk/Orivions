-- ============================================================
-- ORIVIONS - Migration: CRM in /admin
-- Run AFTER 01-15.
-- ============================================================

-- Outreach CRM: every company the team talks to (providers, clients, supply-side
-- prospects, ecosystem partners), where the conversation stands, and what happens
-- next. Admin-only: contact details of third parties must never be readable by
-- anyone else, so RLS allows only public.is_admin() and anon has no grants.

create table if not exists public.crm_companies (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 200),
  side text not null default 'provider' check (side in ('provider', 'client', 'supply', 'ecosystem')),
  category text,
  country text,
  contact text,
  confidence text,
  source text,
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'replied', 'meeting', 'verification', 'active', 'declined')),
  next_step text,
  due date,
  owner text not null default 'Kuba',
  breakpoint text check (breakpoint in ('to_invite', 'invited', 'confirmed', 'paused')),
  meeting_at text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crm_companies_side_name_key on public.crm_companies (side, lower(name));
create index if not exists crm_companies_stage_due_idx on public.crm_companies (stage, due);

create table if not exists public.crm_notes (
  id bigint generated always as identity primary key,
  company_id bigint not null references public.crm_companies(id) on delete cascade,
  kind text not null default 'note' check (kind in ('note', 'reply', 'email', 'dm', 'call', 'stage')),
  body text not null check (length(body) between 1 and 4000),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists crm_notes_company_idx on public.crm_notes (company_id, created_at);

create or replace function public.crm_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_companies_touch on public.crm_companies;
create trigger crm_companies_touch
  before update on public.crm_companies
  for each row execute function public.crm_touch_updated_at();

alter table public.crm_companies enable row level security;
alter table public.crm_notes enable row level security;
revoke all on public.crm_companies from anon;
revoke all on public.crm_notes from anon;

drop policy if exists "admins manage crm companies" on public.crm_companies;
create policy "admins manage crm companies"
  on public.crm_companies for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins manage crm notes" on public.crm_notes;
create policy "admins manage crm notes"
  on public.crm_notes for all
  using (public.is_admin())
  with check (public.is_admin());
