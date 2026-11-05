-- ============================================================
-- ORIVIONS - Migration: newsletter consent records
-- Run AFTER 16. Safe to run twice.
-- ============================================================

-- Consent trail for GDPR: when the person agreed, to which text, from which page.
alter table public.newsletter_subscribers
  add column if not exists consent_at timestamptz,
  add column if not exists consent_text text,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists external_id text;

-- 'pending' = saved from the form but not yet handed to the sending tool, so it is
-- never mailed. 'active' = confirmed (or handed to a tool that confirms by itself).
alter table public.newsletter_subscribers
  drop constraint if exists newsletter_subscribers_status_check;
alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_status_check
  check (status in ('pending', 'active', 'unsubscribed'));

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, created_at);
