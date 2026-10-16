-- ============================================================
-- ORIVIONS - Migration: admin role for the /admin panel
-- Run AFTER 01-07.
-- ============================================================

-- Until now "admin" meant service_role, i.e. the Supabase dashboard. This adds
-- a real admin role for signed-in users listed in public.admins, so the /admin
-- page can verify providers and read inbound requests with the normal anon key
-- (no service-role key in the app).
--
-- Granting admin is a manual SQL step, never something the app can do:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- verified / featured / founding_provider: service_role OR an admin.
create or replace function public.prevent_privileged_column_changes()
returns trigger as $$
begin
  if (new.verified is distinct from old.verified)
     or (new.featured is distinct from old.featured)
     or (new.featured_until is distinct from old.featured_until)
     or (new.founding_provider is distinct from old.founding_provider) then
    if auth.role() is distinct from 'service_role' and not public.is_admin() then
      raise exception 'verified/featured/founding_provider can only be changed by an administrator';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Admins can update any company (verification, featured, founding badge).
drop policy if exists "admins can update any company" on public.companies;
create policy "admins can update any company"
  on public.companies for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can read every inbound table.
drop policy if exists "admins can view all leads" on public.leads;
create policy "admins can view all leads"
  on public.leads for select
  using (public.is_admin());

drop policy if exists "admins can view waitlist" on public.waitlist;
create policy "admins can view waitlist"
  on public.waitlist for select
  using (public.is_admin());

drop policy if exists "admins can view newsletter" on public.newsletter_subscribers;
create policy "admins can view newsletter"
  on public.newsletter_subscribers for select
  using (public.is_admin());

drop policy if exists "admins can view concierge requests" on public.concierge_requests;
create policy "admins can view concierge requests"
  on public.concierge_requests for select
  using (public.is_admin());

drop policy if exists "admins can update concierge requests" on public.concierge_requests;
create policy "admins can update concierge requests"
  on public.concierge_requests for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can view referrals" on public.referrals;
create policy "admins can view referrals"
  on public.referrals for select
  using (public.is_admin());

-- One round trip for the overview cards. Returns null for non-admins.
create or replace function public.admin_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return null;
  end if;
  return json_build_object(
    'providers',              (select count(*) from companies where account_type = 'provider'),
    'providers_verified',     (select count(*) from companies where account_type = 'provider' and verified),
    'verification_requested', (select count(*) from companies where account_type = 'provider' and verification_requested and not verified),
    'clients',                (select count(*) from companies where account_type = 'client'),
    'services',               (select count(*) from services),
    'leads',                  (select count(*) from leads),
    'leads_new',              (select count(*) from leads where status = 'new'),
    'concierge_open',         (select count(*) from concierge_requests where status in ('new', 'in_progress')),
    'waitlist',               (select count(*) from waitlist),
    'newsletter',             (select count(*) from newsletter_subscribers where status = 'active')
  );
end;
$$;

revoke all on function public.admin_stats() from public;
grant execute on function public.admin_stats() to authenticated;
