-- ============================================================
-- ORIVIONS - Migration: public provider pages (/providers/<slug>)
-- Run AFTER 01-09.
-- ============================================================

-- Every provider gets a stable, URL-safe slug for its public profile page.
-- The "Verified on Orivions" badge links to /providers/<slug>, so a slug must
-- not change when a provider renames itself: it is generated once on insert
-- and only service_role or an admin can change it afterwards.
-- updated_at feeds the real lastModified date in the sitemap.

alter table public.companies add column if not exists slug text;
alter table public.companies add column if not exists updated_at timestamptz not null default now();

create or replace function public.company_base_slug(company_name text)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(trim(both '-' from regexp_replace(lower(coalesce(company_name, '')), '[^a-z0-9]+', '-', 'g')), ''),
    'provider'
  );
$$;

create or replace function public.company_unique_slug(company_name text, company_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base text := left(public.company_base_slug(company_name), 60);
  candidate text := base;
begin
  if exists (select 1 from public.companies where slug = candidate and id <> company_id) then
    candidate := base || '-' || left(replace(company_id::text, '-', ''), 6);
  end if;
  return candidate;
end;
$$;

-- Backfill existing rows (oldest first keeps the clean slug).
do $$
declare r record;
begin
  for r in select id, name from public.companies where slug is null order by created_at loop
    update public.companies set slug = public.company_unique_slug(r.name, r.id) where id = r.id;
  end loop;
end $$;

create unique index if not exists companies_slug_key on public.companies (slug);

create or replace function public.companies_slug_and_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.slug is null or new.slug = ''
       or (auth.role() is distinct from 'service_role' and not public.is_admin()) then
      new.slug := public.company_unique_slug(new.name, new.id);
    end if;
  else
    if new.slug is distinct from old.slug
       and auth.role() is distinct from 'service_role'
       and not public.is_admin() then
      new.slug := old.slug;
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists companies_slug_and_touch on public.companies;
create trigger companies_slug_and_touch
  before insert or update on public.companies
  for each row execute function public.companies_slug_and_touch();

-- Column-level SELECT (see 06): the new public columns must be granted too.
grant select (slug, updated_at) on public.companies to anon, authenticated;
