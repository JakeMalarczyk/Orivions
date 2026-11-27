-- Security audit 28.11.2026: Supabase grants anon and authenticated every table
-- privilege by default. RLS already blocks what matters through the API, but
-- TRUNCATE, REFERENCES and TRIGGER are never needed by the app, so they are
-- removed for existing tables and for tables created later. SELECT, INSERT,
-- UPDATE and DELETE stay, guarded by RLS policies as before.

revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
