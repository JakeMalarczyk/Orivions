-- ============================================================
-- ORIVIONS - Migracja: poprawki bezpieczeństwa po audycie zewnętrznym
-- (RAPORT_TESTOW_ORIVIONS.md, znaleziska 2.2 i 2.5)
-- Uruchom PO 01_schema.sql i 02_revenue_streams.sql.
-- ============================================================

-- ------------------------------------------------------------
-- ZNALEZISKO 2.2: panel klienta zawsze pusty.
-- Jedyna polityka SELECT na leads pozwalała czytać tylko providerowi
-- (auth.uid() = company_id). Klient - autor zapytania - nie miał ŻADNEJ
-- ścieżki odczytu własnych leadów, więc /client-dashboard zawsze pokazywał 0.
--
-- Poprawka: klient może czytać leady, w których client_email zgadza się
-- z e-mailem jego ZWERYFIKOWANEJ sesji (auth.jwt() ->> 'email' pochodzi
-- z Supabase Auth, nie z formularza - nie da się go podrobić z klienta).
--
-- Świadome ograniczenie (opisane też w raporcie): leads przyjmuje insert
-- od każdego (celowo - kontakt bez konta), więc client_email może być
-- adresem bez konta. Taki lead po prostu nie będzie widoczny w żadnym
-- panelu klienta, dopóki ktoś nie założy konta na ten adres - to akceptowalne
-- zachowanie, nie luka.
-- ------------------------------------------------------------
drop policy if exists "clients can view leads they submitted" on public.leads;
create policy "clients can view leads they submitted"
  on public.leads for select
  using (client_email = (auth.jwt() ->> 'email'));

-- ------------------------------------------------------------
-- ZNALEZISKO 2.5: provider mógł sam sobie ustawić verified/featured.
-- Polityka UPDATE na companies (auth.uid() = id) działa na poziomie wiersza,
-- nie kolumn - więc jedno wywołanie z konsoli przeglądarki:
--   supabase.from('companies').update({ verified: true, featured: true })...
-- omijało ręczną weryfikację i kuratorowane wyróżnienie (featured).
--
-- Poprawka: trigger BEFORE UPDATE odrzucający zmianę kolumn zaufanych,
-- jeśli wywołujący nie jest service_role (czyli: nie jest adminem działającym
-- przez klucz serwisowy / Supabase Dashboard).
-- ------------------------------------------------------------
create or replace function public.prevent_privileged_column_changes()
returns trigger as $$
begin
  if (new.verified is distinct from old.verified)
     or (new.featured is distinct from old.featured)
     or (new.featured_until is distinct from old.featured_until) then
    if auth.role() is distinct from 'service_role' then
      raise exception 'verified/featured can only be changed by an administrator';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists guard_privileged_columns on public.companies;
create trigger guard_privileged_columns
  before update on public.companies
  for each row execute function public.prevent_privileged_column_changes();

-- ------------------------------------------------------------
-- ZNALEZISKO 2.6 (niższa waga): publiczny odczyt companies zwracał wszystkie
-- ------------------------------------------------------------
-- referral_code lives on the companies table, which is publicly readable
-- (RLS using(true) lets any role read every row). Without protection, any
-- visitor - or any logged-in provider - could read every other provider's
-- referral code and farm their rewards. We revoke SELECT on this one column
-- from both anon and authenticated, so nobody can read it via the table.
-- A provider still needs to see THEIR OWN code in the dashboard, so we expose
-- it through a SECURITY DEFINER function scoped to auth.uid() - it returns only
-- the caller's own code and nothing else.
-- ------------------------------------------------------------
revoke select (referral_code) on public.companies from anon, authenticated;

create or replace function public.my_referral_code()
returns text
language sql
security definer
set search_path = public
as $$
  select referral_code from public.companies where id = auth.uid();
$$;

grant execute on function public.my_referral_code() to authenticated;
