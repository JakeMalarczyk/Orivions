-- Security audit 28.11.2026: "companies are publicly readable" let anyone with the
-- public anon key list every row, including client accounts (their names). Public
-- reads now cover provider rows only; signed-in users still read their own row and
-- admins read everything. Writes are unchanged.

drop policy if exists "companies are publicly readable" on public.companies;

create policy "provider companies are publicly readable"
  on public.companies for select
  using (account_type = 'provider');

create policy "users can read their own company row"
  on public.companies for select
  using (auth.uid() = id);

create policy "admins can read all companies"
  on public.companies for select
  using (public.is_admin());
