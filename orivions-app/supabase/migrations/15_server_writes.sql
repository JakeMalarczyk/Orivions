-- ============================================================
-- ORIVIONS - Migration: public writes only through the server
-- Run AFTER 14, and ONLY once SUPABASE_SERVICE_ROLE_KEY is set in Vercel and the
-- matching code is deployed (lib/supabaseServer.ts, /api/lead). Before that the
-- site still writes with the anon key and these changes would break it.
-- ============================================================

-- 1. No direct anon inserts: forms go through /api/waitlist, /api/concierge and
--    /api/lead, which check the captcha and the per-IP limit first.
drop policy if exists "anyone can join waitlist" on public.waitlist;
drop policy if exists "anyone can submit concierge request" on public.concierge_requests;
drop policy if exists "anyone can submit a lead" on public.leads;
drop policy if exists "anyone can subscribe" on public.newsletter_subscribers;

-- 2. Rate limiting and analytics are callable only by the server (service role),
--    so nobody can burn another visitor's bucket or inflate traffic and CTR.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('rate_limit_hit', 'track_page_view', 'track_event')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
