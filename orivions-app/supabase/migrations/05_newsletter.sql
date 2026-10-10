-- Orivions - newsletter subscribers
-- Run AFTER the core schema. Order-independent from the others (no shared objects).

create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  role text not null default 'client' check (role in ('client','provider')),
  source text default '',
  status text not null default 'active' check (status in ('active','unsubscribed')),
  created_at timestamptz not null default now()
);

-- One row per email: a repeat signup is a no-op, not a duplicate.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

-- Anyone (anon) may subscribe...
drop policy if exists "anyone can subscribe" on public.newsletter_subscribers;
create policy "anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- ...but the list itself is NOT readable by anon. Read it via the Supabase
-- dashboard (or a future admin role). This prevents scraping your list.
-- No select policy = no anon read.
