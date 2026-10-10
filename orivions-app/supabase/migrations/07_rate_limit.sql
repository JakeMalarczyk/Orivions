-- ============================================================
-- ORIVIONS - Migration: shared rate limiter for the AI API routes
-- Run AFTER 01-06.
-- ============================================================

-- The old limiter in /api/smart-match and /api/ai-proposal kept counters in
-- process memory, so every serverless instance had its own budget. This moves
-- the counter into Postgres so all instances share it.
--
-- The table is not readable or writable by anon/authenticated (RLS on, no
-- policies, privileges revoked). The only way in is rate_limit_hit(), which
-- validates its arguments, serialises hits per bucket with an advisory lock and
-- returns true when the request is allowed.

create table if not exists public.rate_limit_hits (
  bucket text not null,
  hit_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_hit_at_idx
  on public.rate_limit_hits (bucket, hit_at);

alter table public.rate_limit_hits enable row level security;
revoke all on public.rate_limit_hits from anon, authenticated;

create or replace function public.rate_limit_hit(p_bucket text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if p_bucket is null or length(p_bucket) = 0 or length(p_bucket) > 200
     or p_max < 1 or p_max > 100
     or p_window_seconds < 1 or p_window_seconds > 3600 then
    raise exception 'invalid rate limit arguments';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_bucket));

  delete from public.rate_limit_hits
  where bucket = p_bucket
    and hit_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into n from public.rate_limit_hits where bucket = p_bucket;
  if n >= p_max then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket) values (p_bucket);

  -- Occasionally drop rows from buckets nobody has hit for an hour,
  -- so abandoned buckets do not accumulate.
  if random() < 0.01 then
    delete from public.rate_limit_hits where hit_at < now() - interval '1 hour';
  end if;

  return true;
end;
$$;

revoke all on function public.rate_limit_hit(text, int, int) from public;
grant execute on function public.rate_limit_hit(text, int, int) to anon, authenticated;
