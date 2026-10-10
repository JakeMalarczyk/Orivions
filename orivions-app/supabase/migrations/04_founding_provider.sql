-- ============================================================
-- ORIVIONS - Migracja: Founding Provider (odznaka pierwszych 20)
-- Uruchom PO migration_security_fixes.sql.
-- Mechanika: patrz ORIVIONS_Founding20_Launch_Kit.md.
-- ============================================================

alter table public.companies
  add column if not exists founding_provider boolean not null default false;

comment on column public.companies.founding_provider is
  'Odznaka Founding Provider - pierwszych 20 zweryfikowanych firm. Ustawiana wyłącznie ręcznie (service_role), maks. 20 wierszy = true, nigdy więcej.';

-- Odznaka jest aktywem statusowym - rozszerzamy trigger ochronny z
-- migration_security_fixes.sql, żeby provider nie mógł jej sobie nadać
-- (ta sama klasa ryzyka co self-verified z audytu, znalezisko 2.5).
create or replace function public.prevent_privileged_column_changes()
returns trigger as $$
begin
  if (new.verified is distinct from old.verified)
     or (new.featured is distinct from old.featured)
     or (new.featured_until is distinct from old.featured_until)
     or (new.founding_provider is distinct from old.founding_provider) then
    if auth.role() is distinct from 'service_role' then
      raise exception 'verified/featured/founding_provider can only be changed by an administrator';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger guard_privileged_columns już istnieje (security fixes) i wskazuje
-- na tę funkcję - podmiana samej funkcji wystarczy, nie trzeba go odtwarzać.

-- (Wcześniej istniał tu widok companies_public - usunięty jako nieużywany.
-- referral_code jest teraz chroniony column-level GRANTem w 04_security_fixes.)
