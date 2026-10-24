-- ============================================================
-- ORIVIONS - Migration: click-through measurement + SEO/GEO sheet
-- Run AFTER 01-10 (11 is independent).
-- ============================================================

-- 1. Attribution on page views (utm_medium / utm_campaign).
alter table public.page_views add column if not exists medium text;
alter table public.page_views add column if not exists campaign text;

drop function if exists public.track_page_view(text, text, text, text);

create or replace function public.track_page_view(
  p_visitor text,
  p_path text,
  p_source text,
  p_country text,
  p_medium text default null,
  p_campaign text default null
)
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
  insert into public.page_views (visitor_hash, path, source, country, medium, campaign)
  values (
    p_visitor,
    left(p_path, 300),
    nullif(left(coalesce(p_source, ''), 100), ''),
    nullif(left(coalesce(p_country, ''), 2), ''),
    nullif(left(coalesce(p_medium, ''), 60), ''),
    nullif(left(coalesce(p_campaign, ''), 100), '')
  );
end;
$$;

revoke all on function public.track_page_view(text, text, text, text, text, text) from public;
grant execute on function public.track_page_view(text, text, text, text, text, text) to anon, authenticated;

-- 2. Events: CTA clicks, outbound clicks, engagement and conversions.
-- Same privacy model as page_views: no cookies, a visitor hash that rotates daily.
create table if not exists public.events (
  id bigserial primary key,
  visitor_hash text not null,
  name text not null,
  path text not null,
  label text,
  target text,
  placement text,
  source text,
  medium text,
  campaign text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_name_idx on public.events (name, created_at);

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
revoke all on sequence public.events_id_seq from anon, authenticated;

create or replace function public.track_event(
  p_visitor text,
  p_name text,
  p_path text,
  p_label text,
  p_target text,
  p_placement text,
  p_source text,
  p_medium text,
  p_campaign text,
  p_country text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor is null or length(p_visitor) <> 64
     or p_path is null or left(p_path, 1) <> '/'
     or p_name not in ('cta_click', 'outbound_click', 'calculator_used', 'concierge_submit',
                       'waitlist_signup', 'signup', 'lead_sent', 'smart_match_submit') then
    raise exception 'invalid event';
  end if;
  insert into public.events (visitor_hash, name, path, label, target, placement, source, medium, campaign, country)
  values (
    p_visitor,
    p_name,
    left(p_path, 300),
    nullif(left(coalesce(p_label, ''), 80), ''),
    nullif(left(coalesce(p_target, ''), 200), ''),
    nullif(left(coalesce(p_placement, ''), 20), ''),
    nullif(left(coalesce(p_source, ''), 100), ''),
    nullif(left(coalesce(p_medium, ''), 60), ''),
    nullif(left(coalesce(p_campaign, ''), 100), ''),
    nullif(left(coalesce(p_country, ''), 2), '')
  );
end;
$$;

revoke all on function public.track_event(text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.track_event(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- 3. Everything the Campaigns tab shows, in one round trip.
-- "Visitors" = distinct visitor hashes (one per person per day). Click-through of a
-- page or channel = visitors who clicked at least one tracked CTA / visitors.
create or replace function public.admin_campaigns(p_days int default 30)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz constant text := 'Europe/Warsaw';
  d int := greatest(1, least(coalesce(p_days, 30), 365));
  since timestamptz := ((date_trunc('day', now() at time zone 'Europe/Warsaw')) at time zone 'Europe/Warsaw')
                       - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)) - 1);
begin
  if not public.is_admin() then
    return null;
  end if;

  return (
    with pv as (
      select visitor_hash as h, path, coalesce(source, 'Direct') as source, coalesce(medium, '') as medium,
             coalesce(campaign, '') as campaign, (created_at at time zone tz)::date as day
      from public.page_views where created_at >= since
    ),
    ev as (
      select visitor_hash as h, name, path, label, target, coalesce(placement, '') as placement,
             coalesce(source, 'Direct') as source, coalesce(medium, '') as medium,
             coalesce(campaign, '') as campaign, (created_at at time zone tz)::date as day
      from public.events where created_at >= since
    ),
    clk as (select * from ev where name = 'cta_click'),
    conv as (select * from ev where name in ('concierge_submit', 'waitlist_signup', 'signup', 'lead_sent', 'smart_match_submit')),
    ch_pv as (select source, medium, count(distinct h) visitors, count(*) views from pv group by 1, 2),
    ch_clk as (select source, medium, count(distinct h) clickers from clk group by 1, 2),
    ch_conv as (select source, medium, count(distinct h) converters, count(*) conversions from conv group by 1, 2),
    cm_pv as (select source, medium, campaign, count(distinct h) visitors from pv where campaign <> '' group by 1, 2, 3),
    cm_clk as (select source, medium, campaign, count(distinct h) clickers from clk where campaign <> '' group by 1, 2, 3),
    cm_conv as (select source, medium, campaign, count(distinct h) converters, count(*) conversions from conv where campaign <> '' group by 1, 2, 3),
    pg as (select path, count(distinct h) visitors, count(*) views from pv group by path),
    pg_clk as (select path, count(distinct h) clickers from clk group by path),
    pg_conv as (select path, count(distinct h) converters from conv group by path)
    select json_build_object(
      'days', d,
      'totals', json_build_object(
        'visitors',    (select count(distinct h) from pv),
        'views',       (select count(*) from pv),
        'clickers',    (select count(distinct h) from clk),
        'clicks',      (select count(*) from clk),
        'outbound',    (select count(*) from ev where name = 'outbound_click'),
        'converters',  (select count(distinct h) from conv),
        'conversions', (select count(*) from conv)),
      'channels', (select coalesce(json_agg(x), '[]'::json) from (
        select a.source, a.medium, a.visitors, a.views,
               coalesce(b.clickers, 0) clickers, coalesce(c.converters, 0) converters, coalesce(c.conversions, 0) conversions
        from ch_pv a
        left join ch_clk b using (source, medium)
        left join ch_conv c using (source, medium)
        order by a.visitors desc limit 25) x),
      'campaigns', (select coalesce(json_agg(x), '[]'::json) from (
        select a.source, a.medium, a.campaign, a.visitors,
               coalesce(b.clickers, 0) clickers, coalesce(c.converters, 0) converters, coalesce(c.conversions, 0) conversions
        from cm_pv a
        left join cm_clk b using (source, medium, campaign)
        left join cm_conv c using (source, medium, campaign)
        order by a.visitors desc limit 25) x),
      'ctas', (select coalesce(json_agg(x), '[]'::json) from (
        select label, placement, target, count(*) clicks, count(distinct h) clickers
        from clk group by label, placement, target order by clicks desc limit 30) x),
      'pages', (select coalesce(json_agg(x), '[]'::json) from (
        select pg.path, pg.visitors, pg.views, coalesce(pg_clk.clickers, 0) clickers, coalesce(pg_conv.converters, 0) converters
        from pg left join pg_clk using (path) left join pg_conv using (path)
        order by pg.visitors desc limit 25) x),
      'events', (select coalesce(json_agg(x), '[]'::json) from (
        select name, count(*) n, count(distinct h) visitors from ev group by name order by n desc) x),
      'outbound', (select coalesce(json_agg(x), '[]'::json) from (
        select coalesce(target, label, '?') target, count(*) clicks
        from ev where name = 'outbound_click' group by 1 order by clicks desc limit 15) x),
      'daily', (select json_agg(json_build_object(
                  'day', g::date,
                  'visitors',   (select count(distinct h) from pv where day = g::date),
                  'clickers',   (select count(distinct h) from clk where day = g::date),
                  'converters', (select count(distinct h) from conv where day = g::date)) order by g)
                from generate_series((since at time zone tz)::date, (now() at time zone tz)::date, interval '1 day') g)
    )
  );
end;
$$;

revoke all on function public.admin_campaigns(int) from public;
grant execute on function public.admin_campaigns(int) to authenticated;

-- 4. SEO / GEO sheet. Admin-only: every policy checks public.is_admin().
create table if not exists public.seo_tasks (
  id bigserial primary key,
  key text unique,
  area text not null check (area in ('technical', 'onpage', 'content', 'authority', 'geo')),
  title text not null,
  detail text,
  priority int not null default 2 check (priority between 1 and 3),
  status text not null default 'todo' check (status in ('todo', 'doing', 'done', 'skip')),
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_metrics (
  id bigserial primary key,
  day date not null,
  channel text not null check (channel in ('google', 'bing', 'other')),
  impressions int,
  clicks int,
  avg_position numeric(5, 1),
  indexed_pages int,
  note text,
  created_at timestamptz not null default now(),
  unique (day, channel)
);

create table if not exists public.geo_checks (
  id bigserial primary key,
  checked_on date not null default current_date,
  engine text not null check (engine in ('chatgpt', 'perplexity', 'gemini', 'claude', 'google_ai', 'copilot')),
  prompt text not null,
  cited boolean not null default false,
  mentioned boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_listings (
  id bigserial primary key,
  key text unique,
  name text not null,
  url text,
  kind text not null default 'directory' check (kind in ('directory', 'citation', 'backlink', 'profile')),
  status text not null default 'todo' check (status in ('todo', 'submitted', 'live', 'rejected')),
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_audits (
  id bigserial primary key,
  ran_at timestamptz not null default now(),
  pages int not null,
  errors int not null,
  warnings int not null,
  result jsonb not null
);

do $$
declare
  t text;
begin
  foreach t in array array['seo_tasks', 'seo_metrics', 'geo_checks', 'seo_listings', 'seo_audits'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t || '_admin', t);
  end loop;
end $$;

grant usage, select on sequence public.seo_tasks_id_seq, public.seo_metrics_id_seq, public.geo_checks_id_seq,
  public.seo_listings_id_seq, public.seo_audits_id_seq to authenticated;

-- 5. Seed checklist (idempotent: re-running adds only missing keys).
insert into public.seo_tasks (key, area, title, detail, priority, status) values
  ('gsc', 'technical', 'Google Search Console verified', 'URL-prefix property https://orivions.com/ with the sitemap submitted.', 1, 'done'),
  ('bing', 'technical', 'Bing Webmaster Tools imported from GSC', 'Bing powers ChatGPT search and Copilot, so it matters for GEO too.', 1, 'done'),
  ('indexnow', 'technical', 'IndexNow on every deploy', 'Daily cron plus GitHub Action ping new and changed URLs.', 2, 'done'),
  ('sitemap', 'technical', 'sitemap.xml with real lastModified dates', 'Blog, glossary, tools and verified provider pages included automatically.', 1, 'done'),
  ('robots', 'technical', 'robots.txt allows search and AI crawlers', 'GPTBot, ClaudeBot, PerplexityBot, Google-Extended all allowed.', 1, 'done'),
  ('https', 'technical', 'HTTPS, HSTS preload, www to apex 308', 'Verified by the site audit.', 2, 'done'),
  ('canonical', 'technical', 'Canonical URL on every page', 'Checked by the site audit.', 1, 'done'),
  ('cwv', 'technical', 'Core Web Vitals pass on mobile', 'Check PageSpeed Insights for /, /providers, a blog post and a calculator. Target LCP < 2.5 s, CLS < 0.1.', 2, 'todo'),
  ('gsc-cwv', 'technical', 'Fix coverage warnings in GSC', 'Open Pages > Why pages are not indexed and clear every reason that is not intended.', 2, 'todo'),
  ('h1', 'onpage', 'One h1 on every page', '/smart-match and /insights had none. Fixed; the audit confirms.', 1, 'done'),
  ('titles', 'onpage', 'Titles 30 to 60 characters', 'Longer titles are cut in results. Run the audit for the list.', 2, 'todo'),
  ('descriptions', 'onpage', 'Meta descriptions 70 to 160 characters', 'Run the audit for the list of pages outside the range.', 2, 'todo'),
  ('og', 'onpage', 'OpenGraph and Twitter cards on every page', 'Unique 1200x630 image per page.', 2, 'done'),
  ('jsonld', 'onpage', 'Structured data: Organization, Article, FAQPage, DefinedTerm, WebApplication, BreadcrumbList', 'Validate samples in the Rich Results Test.', 1, 'done'),
  ('thin', 'onpage', 'No thin pages (under 250 words)', 'Hubs and tools need an intro and a short FAQ. The audit lists the thin ones.', 2, 'todo'),
  ('internal-links', 'onpage', 'Every blog post links to a tool or a category page', 'Keeps link equity flowing to pages that convert.', 2, 'todo'),
  ('img-alt', 'onpage', 'Alt text on every content image', 'Checked by the site audit.', 3, 'todo'),
  ('blog-cadence', 'content', 'Publish 2 articles per month', 'Target queries: audit cost, audit timeline, Anchor security, token launch, milestone payments.', 1, 'todo'),
  ('glossary', 'content', 'Glossary: 28 term pages live', 'Add terms from GSC queries that show impressions but no click.', 2, 'done'),
  ('calculators', 'content', 'Free calculators: audit cost and dApp cost', 'Linkable assets. Promote them in communities and answer sites.', 1, 'done'),
  ('case-content', 'content', 'First provider case study or interview', 'Needs a verified provider; publish with their approval.', 2, 'todo'),
  ('refresh', 'content', 'Refresh dateModified on posts every quarter', 'Update numbers and examples, then bump dateModified in lib/blog.ts.', 3, 'todo'),
  ('listings', 'authority', 'Submit to directories (see Listings below)', 'Alchemy dApp Store, The Grid, solana.com/ecosystem, MadeOnSol.', 1, 'doing'),
  ('x-profile', 'authority', 'X profile @Orivions linked in schema and footer', 'sameAs in Organization JSON-LD.', 2, 'done'),
  ('linkedin', 'authority', 'LinkedIn company page created and linked', 'Add to sameAs after creation.', 2, 'todo'),
  ('backlinks', 'authority', 'Earn 10 relevant backlinks', 'Guest posts, ecosystem newsletters, calculator mentions, provider pages linking back.', 1, 'todo'),
  ('llms', 'geo', 'llms.txt and llms-full.txt published', 'Plain-text map of the site for AI crawlers.', 1, 'done'),
  ('answer-first', 'geo', 'Answer-first block at the top of every article', 'One or two sentences that answer the title question with numbers.', 1, 'done'),
  ('geo-tables', 'geo', 'At-a-glance tables and FAQ sections', 'Tables and Q&A are the most quotable formats for AI answers.', 2, 'done'),
  ('entity', 'geo', 'Consistent brand entity everywhere', 'Same name, one-line description and URL on X, LinkedIn, directories, Crunchbase.', 1, 'todo'),
  ('geo-prompts', 'geo', 'Run the GEO prompt set weekly', 'Log results below; aim for a rising citation rate in ChatGPT, Perplexity, Gemini and Google AI.', 1, 'todo'),
  ('reddit-quora', 'geo', 'Answer questions on Reddit and Stack Exchange with sources', 'AI engines cite community answers; add a link only where it helps.', 3, 'todo')
on conflict (key) do nothing;

insert into public.seo_listings (key, name, url, kind, status, note) values
  ('alchemy', 'Alchemy dApp Store', 'https://www.alchemy.com/dapps', 'directory', 'submitted', 'Submission sent.'),
  ('thegrid', 'The Grid', 'https://thegrid.id', 'directory', 'todo', 'Register Orivions as an entity once the company email is final.'),
  ('solana-eco', 'solana.com/ecosystem', 'https://solana.com/ecosystem', 'directory', 'todo', 'Needs the X account login.'),
  ('madeonsol', 'MadeOnSol', 'https://madeonsol.com', 'directory', 'todo', 'Paid listing, EUR 49. Decision pending.'),
  ('x', 'X @Orivions', 'https://x.com/Orivions', 'profile', 'live', null),
  ('linkedin', 'LinkedIn company page', null, 'profile', 'todo', null),
  ('crunchbase', 'Crunchbase', 'https://www.crunchbase.com', 'profile', 'todo', null),
  ('producthunt', 'Product Hunt', 'https://www.producthunt.com', 'directory', 'todo', 'Launch with the calculators.'),
  ('superteam', 'Superteam ecosystem pages', null, 'directory', 'todo', 'Ask for a listing as a service marketplace.')
on conflict (key) do nothing;
