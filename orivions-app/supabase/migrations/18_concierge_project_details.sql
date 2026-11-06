-- ============================================================
-- ORIVIONS - Migration: optional project details on shortlist requests
-- Run AFTER 17. Safe to run twice.
-- ============================================================
-- repo_url (website or GitHub) and chain already exist from migration 02.
alter table public.concierge_requests
  add column if not exists project_stage text default '',
  add column if not exists funding text default '',
  add column if not exists team_size text default '',
  add column if not exists need_category text default '';
