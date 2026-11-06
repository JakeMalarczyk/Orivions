-- ============================================================
-- ORIVIONS - Migration: richer provider profiles
-- Run AFTER 18. Safe to run twice.
-- ============================================================
-- location, team_size, founded_year, chains and the social links already exist
-- (migration 01); the dashboard now edits them. These are the new fields.
alter table public.companies
  add column if not exists tagline text default '',
  add column if not exists specialties text default '',
  add column if not exists languages text default '',
  add column if not exists min_project_usd int,
  add column if not exists typical_timeline text default '',
  add column if not exists availability text default '';

alter table public.companies drop constraint if exists companies_profile_lengths;
alter table public.companies add constraint companies_profile_lengths check (
  char_length(coalesce(tagline, '')) <= 140
  and char_length(coalesce(specialties, '')) <= 300
  and char_length(coalesce(languages, '')) <= 100
  and char_length(coalesce(typical_timeline, '')) <= 60
  and char_length(coalesce(availability, '')) <= 80
  and (min_project_usd is null or min_project_usd between 0 and 10000000)
);

-- Column-level SELECT (see 06): new public columns must be granted too.
grant select (tagline, specialties, languages, min_project_usd, typical_timeline, availability)
  on public.companies to anon, authenticated;
