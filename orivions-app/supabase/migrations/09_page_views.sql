-- ============================================================
-- ORIVIONS - Migration: first-party page view counter
-- Run AFTER 01-08.
-- ============================================================

-- Cookieless visit counting for the /admin Traffic tab. /api/track hashes the
-- visitor's IP + user agent with a salt that changes every day, so the same
-- person counts once per day and nobody can be followed across days. No raw IP
-- or user agent is stored.
--
-- The table is closed to anon/authenticated (RLS on, no policies, privileges
-- revoked). Writes go through track_page_view(), reads through admin_traffic(),
-- which returns null unless public.is_admin() is true.

create table if not exists public.page_views (
  id bigserial primary key,
  visitor_hash text not null,
  path text not null,
  source text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at);

alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;
revoke all on sequence public.page_views_id_seq from anon, authenticated;

create or replace function public.track_page_view(p_visitor text, p_path text, p_source text, p_country text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor is null or length(p_visitor) <> 64
     or p_path is null or length(p_path) = 0 or left(p_path, 1) <> '/' then
    raise exception 'invalid page view';
  end if;
  insert into public.page_views (visitor_hash, path, source, country)
  values (
    p_visitor,
    left(p_path, 300),
    nullif(left(coalesce(p_source, ''), 100), ''),
    nullif(left(coalesce(p_country, ''), 2), '')
  );
end;
$$;

revoke all on function public.track_page_view(text, text, text, text) from public;
grant execute on function public.track_page_view(text, text, text, text) to anon, authenticated;

-- Everything the Traffic tab shows, in one round trip. Days are counted in
-- Polish time. "Visitors" over a range is the sum of daily unique visitors,
-- because the visitor hash rotates every day.
create or replace function public.admin_traffic()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz constant text := 'Europe/Warsaw';
  today date := (now() at time zone tz)::date;
begin
  if not public.is_admin() then
    return null;
  end if;

  return (
    with v as (
      select visitor_hash, path, source, country, (created_at at time zone tz)::date as day, created_at
      from public.page_views
    ),
    daily as (
      select day, count(distinct visitor_hash) as visitors, count(*) as views
      from v
      group by day
    ),
    recent as (
      select * from v where day > today - 30
    )
    select json_build_object(
      'live',          (select count(distinct visitor_hash) from v where created_at > now() - interval '30 minutes'),
      'today',         json_build_object(
                         'visitors', coalesce((select visitors from daily where day = today), 0),
                         'views',    coalesce((select views from daily where day = today), 0)),
      'last7',         json_build_object(
                         'visitors', coalesce((select sum(visitors) from daily where day > today - 7), 0),
                         'views',    coalesce((select sum(views) from daily where day > today - 7), 0)),
      'last30',        json_build_object(
                         'visitors', coalesce((select sum(visitors) from daily where day > today - 30), 0),
                         'views',    coalesce((select sum(views) from daily where day > today - 30), 0)),
      'total',         json_build_object(
                         'visitors', coalesce((select sum(visitors) from daily), 0),
                         'views',    (select count(*) from v)),
      'daily',         (select json_agg(json_build_object(
                                 'day', d::date,
                                 'visitors', coalesce(daily.visitors, 0),
                                 'views', coalesce(daily.views, 0)) order by d)
                        from generate_series(today - 29, today, interval '1 day') d
                        left join daily on daily.day = d::date),
      'pages',         (select coalesce(json_agg(p), '[]'::json) from (
                          select path, count(*) as views, count(distinct (visitor_hash, day)) as visitors
                          from recent group by path order by views desc limit 10) p),
      'sources',       (select coalesce(json_agg(s), '[]'::json) from (
                          select coalesce(source, 'Direct') as source, count(distinct (visitor_hash, day)) as visitors
                          from recent group by 1 order by visitors desc limit 10) s),
      'countries',     (select coalesce(json_agg(c), '[]'::json) from (
                          select coalesce(country, '??') as country, count(distinct (visitor_hash, day)) as visitors
                          from recent group by 1 order by visitors desc limit 10) c)
    )
  );
end;
$$;

revoke all on function public.admin_traffic() from public;
grant execute on function public.admin_traffic() to authenticated;
