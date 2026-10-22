-- ============================================================
-- ORIVIONS - Migration: lead handling in /admin
-- Run AFTER 01-10.
-- ============================================================

-- Admins work every inbound request (concierge requests and contact requests
-- sent to providers) from one inbox: change the status, add internal notes and
-- see the history. Notes and status changes are kept in admin_lead_events, an
-- admin-only table, so a provider reading its own leads never sees them.

create table if not exists public.admin_lead_events (
  id uuid primary key default uuid_generate_v4(),
  source text not null check (source in ('lead', 'concierge')),
  record_id uuid not null,
  kind text not null check (kind in ('note', 'status')),
  body text not null check (length(body) between 1 and 4000),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists admin_lead_events_record_idx
  on public.admin_lead_events (source, record_id, created_at);

alter table public.admin_lead_events enable row level security;
revoke all on public.admin_lead_events from anon;

drop policy if exists "admins can view lead events" on public.admin_lead_events;
create policy "admins can view lead events"
  on public.admin_lead_events for select
  using (public.is_admin());

drop policy if exists "admins can add lead events" on public.admin_lead_events;
create policy "admins can add lead events"
  on public.admin_lead_events for insert
  with check (public.is_admin());

-- Until now only the contacted provider could change a lead's status. During
-- early access the Orivions team handles leads too.
drop policy if exists "admins can update any lead" on public.leads;
create policy "admins can update any lead"
  on public.leads for update
  using (public.is_admin())
  with check (public.is_admin());
