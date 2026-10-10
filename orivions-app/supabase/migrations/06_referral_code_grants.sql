-- ============================================================
-- ORIVIONS - Migration: actually hide companies.referral_code
-- Run AFTER 01-05.
-- ============================================================

-- 03_security_fixes.sql does `revoke select (referral_code) ...`, but Supabase
-- grants anon/authenticated SELECT on the whole table, and a column-level revoke
-- does not remove a table-level grant - so referral_code stayed publicly readable.
-- Fix: drop the table-level SELECT and grant it back column by column, without
-- referral_code. The provider dashboard reads its own code via my_referral_code().
-- When you add a public column to companies, add it to this grant too.

revoke select on public.companies from anon, authenticated;

grant select (
  id, name, description, category, chains, website, account_type, verified, created_at,
  location, team_size, founded_year, x_url, github_url, linkedin_url, discord_url,
  featured, featured_until, verification_requested, verification_requested_at,
  founding_provider
) on public.companies to anon, authenticated;
