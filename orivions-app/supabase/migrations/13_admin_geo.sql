-- ============================================================
-- ORIVIONS - Migration: per-country numbers for the admin World map
-- Run AFTER 12.
-- ============================================================

-- One row per country (ISO 3166-1 alpha-2 from the x-vercel-ip-country header).
--   viewers   people who viewed a page (distinct visitor per day)
--   views     page views
--   clickers  people who clicked a tracked call to action
--   clients   client accounts created (signup event with label "client")
--   providers provider accounts created (signup event with label "provider")
--   requests  shortlist requests, waitlist signups, Smart Match runs and messages to providers
-- Accounts and requests are located only from the day the events table started
-- (migration 12), because earlier ones were stored without a country.
create or replace function public.admin_geo(p_days int default 30)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d int := greatest(1, least(coalesce(p_days, 30), 3650));
  since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 3650)));
begin
  if not public.is_admin() then
    return null;
  end if;

  return (
    with pv as (
      select coalesce(country, '??') as c, visitor_hash as h, (created_at at time zone 'Europe/Warsaw')::date as day
      from public.page_views where created_at >= since
    ),
    ev as (
      select coalesce(country, '??') as c, name, label, visitor_hash as h, (created_at at time zone 'Europe/Warsaw')::date as day
      from public.events where created_at >= since
    ),
    a as (select c, count(distinct (h, day)) as viewers, count(*) as views from pv group by c),
    b as (select c, count(distinct (h, day)) as clickers from ev where name = 'cta_click' group by c),
    cl as (select c, count(*) as n from ev where name = 'signup' and label = 'client' group by c),
    pr as (select c, count(*) as n from ev where name = 'signup' and label = 'provider' group by c),
    rq as (
      select c, count(*) as n from ev
      where name in ('concierge_submit', 'waitlist_signup', 'smart_match_submit', 'lead_sent') group by c
    ),
    countries as (
      select c from a union select c from b union select c from cl union select c from pr union select c from rq
    )
    select json_build_object(
      'days', d,
      'rows', coalesce((
        select json_agg(json_build_object(
          'country', countries.c,
          'viewers', coalesce(a.viewers, 0),
          'views', coalesce(a.views, 0),
          'clickers', coalesce(b.clickers, 0),
          'clients', coalesce(cl.n, 0),
          'providers', coalesce(pr.n, 0),
          'requests', coalesce(rq.n, 0)
        ) order by coalesce(a.viewers, 0) desc)
        from countries
        left join a on a.c = countries.c
        left join b on b.c = countries.c
        left join cl on cl.c = countries.c
        left join pr on pr.c = countries.c
        left join rq on rq.c = countries.c
      ), '[]'::json),
      'events_since', (select min(created_at) from public.events)
    )
  );
end;
$$;

revoke all on function public.admin_geo(int) from public;
grant execute on function public.admin_geo(int) to authenticated;
