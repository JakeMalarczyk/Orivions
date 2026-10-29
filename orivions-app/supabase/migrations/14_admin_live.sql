-- ============================================================
-- ORIVIONS - Migration: "on the site now" for the admin World map
-- Run AFTER 13.
-- ============================================================

-- People with at least one page view in the last p_minutes (default 5), per country.
-- A person is one distinct daily visitor hash. Admin only.
create or replace function public.admin_live(p_minutes int default 5)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  m int := greatest(1, least(coalesce(p_minutes, 5), 60));
begin
  if not public.is_admin() then
    return null;
  end if;

  return (
    with live as (
      select coalesce(country, '??') as c, visitor_hash as h
      from public.page_views
      where created_at >= now() - make_interval(mins => greatest(1, least(coalesce(p_minutes, 5), 60)))
    ),
    per as (select c, count(distinct h) as n from live group by c)
    select json_build_object(
      'minutes', m,
      'total', (select count(distinct h) from live),
      'rows', coalesce((select json_agg(json_build_object('country', c, 'visitors', n) order by n desc) from per), '[]'::json)
    )
  );
end;
$$;

revoke all on function public.admin_live(int) from public;
grant execute on function public.admin_live(int) to authenticated;
