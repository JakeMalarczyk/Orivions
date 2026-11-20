-- ============================================================================
-- ORIVIONS ESCROW - samodzielna migracja modułu (V1: tracking, bez powiernictwa)
--
-- DOŁĄCZENIE:  uruchom ten plik w Supabase SQL Editor (po schema.sql głównej
--              aplikacji - wymaga public.companies; wymaga Postgres 15+ dla
--              widoków security_invoker, Supabase to spełnia).
-- ODŁĄCZENIE:  drop table escrow_invites, escrow_events, escrow_milestones, escrow_deals cascade;
--              drop function escrow_guard_deal_transition, escrow_guard_milestone_transition,
--              escrow_deal_created_event, escrow_touch_updated_at, escrow_events_append_only,
--              escrow_create_invite, escrow_claim_deal, escrow_transition_deal,
--              escrow_transition_milestone, escrow_actor_for, escrow_note;
-- Moduł nie modyfikuje ŻADNEJ istniejącej tabeli.
--
-- ZASADA PODWÓJNEJ WALIDACJI: przejścia stanów są walidowane w TypeScript
-- (core/stateMachine.ts - pierwsza linia, dobre komunikaty) ORAZ tutaj
-- w triggerach (ostatnia linia obrony - działa nawet gdy ktoś ominie API).
-- Tabela przejść PONIŻEJ musi być identyczna z DEAL_TRANSITIONS /
-- MILESTONE_TRANSITIONS w core/stateMachine.ts. Audytorze: porównaj je oczami.
--
--   DEAL:      draft     → proposed(provider) | cancelled(provider)
--              proposed  → active(client) | cancelled(provider,client)
--              active    → completed(admin*) | cancelled(admin) | disputed(provider,client)
--              disputed  → active(admin) | cancelled(admin) | completed(admin)
--              completed, cancelled → (terminalne)
--              *completed z active dodatkowo wymaga: wszystkie milestones approved
--
--   MILESTONE: pending   → delivered(provider)
--              delivered → approved(client) | rejected(client)
--              rejected  → pending(provider)
--              approved  → (terminalny)
--              + każde przejście wymaga deala w stanie 'active'
--              + approved wymaga: wszystkie WCZEŚNIEJSZE pozycje approved
--
-- MODEL TOŻSAMOŚCI (zmiana po audycie 6.11.2026):
--   provider = auth.uid() = escrow_deals.provider_id
--   client   = auth.uid() = escrow_deals.client_user_id, ustawiane WYŁĄCZNIE
--              przez escrow_claim_deal(deal, token) po okazaniu jednorazowego
--              tokenu zaproszenia (escrow_create_invite). Adres e-mail NIE
--              nadaje żadnych uprawnień (rejestracja nie wymaga potwierdzenia
--              e-maila, więc e-mail z sesji nie jest dowodem tożsamości).
--              client_email to tylko adresat zaproszenia (informacyjnie).
--   admin    = rola service_role.
--
-- ZDARZENIA: dziennik escrow_events zapisują WYŁĄCZNIE triggery (SECURITY
--   DEFINER). Użytkownicy nie mają INSERT/UPDATE/DELETE na tej tabeli.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabele
-- ----------------------------------------------------------------------------

create table if not exists public.escrow_deals (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.companies(id) on delete restrict,
  -- Adresat zaproszenia. NIE jest podstawą uprawnień (patrz MODEL TOŻSAMOŚCI).
  client_email text not null check (client_email = lower(client_email)),
  -- Konto klienta po przyjęciu zaproszenia. Ustawiane tylko przez escrow_claim_deal.
  client_user_id uuid,
  title text not null check (char_length(title) between 3 and 200),
  description text,
  currency text not null default 'USD' check (currency in ('USD','USDC')),
  state text not null default 'draft'
    check (state in ('draft','proposed','active','completed','cancelled','disputed')),
  -- Stawka fee ZAMROŻONA w momencie propozycji (patrz core/types.ts: Deal.feeRate).
  -- Zmiana abonamentu w trakcie deala celowo NIE przecenia deala w locie.
  fee_rate numeric not null default 0.10 check (fee_rate = 0.10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (client_user_id is null or client_user_id <> provider_id)
);

create table if not exists public.escrow_milestones (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.escrow_deals(id) on delete cascade,
  position int not null check (position >= 1),
  title text not null check (char_length(title) between 3 and 200),
  description text,
  -- Skala 2 miejsc: TS (core/fees.ts, grosze) i SQL liczą wtedy identycznie.
  amount numeric(14,2) not null check (amount > 0),
  state text not null default 'pending'
    check (state in ('pending','delivered','approved','rejected')),
  delivered_at timestamptz,
  approved_at timestamptz,
  unique (deal_id, position)
);

-- Jednorazowe tokeny zaproszeń (przechowujemy tylko hash). Brak polityk i
-- uprawnień dla użytkowników: dostęp wyłącznie przez funkcje SECURITY DEFINER.
create table if not exists public.escrow_invites (
  deal_id uuid primary key references public.escrow_deals(id) on delete cascade,
  token_hash bytea not null,
  created_at timestamptz not null default now()
);

-- Append-only dziennik zdarzeń: fundament audytowalności całego modułu.
create table if not exists public.escrow_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.escrow_deals(id) on delete cascade,
  milestone_id uuid references public.escrow_milestones(id) on delete set null,
  type text not null check (type in (
    'deal_created','deal_proposed','deal_accepted','deal_completed',
    'deal_cancelled','deal_disputed','dispute_resolved',
    'milestone_delivered','milestone_approved','milestone_rejected','milestone_reopened'
  )),
  actor text not null check (actor in ('provider','client','admin')),
  note text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists escrow_deals_provider_idx on public.escrow_deals(provider_id);
create index if not exists escrow_deals_client_idx on public.escrow_deals(client_user_id);
create index if not exists escrow_events_deal_idx on public.escrow_events(deal_id);

-- ----------------------------------------------------------------------------
-- Pomocnicze
-- ----------------------------------------------------------------------------

-- Aktor wyprowadzony z tożsamości sesji. Brak jawnego "escrow_actor" w JWT:
-- rola nie pochodzi z niczego, co użytkownik mógłby ustawić.
create or replace function public.escrow_actor_for(p_provider uuid, p_client uuid)
returns text
language plpgsql stable
set search_path = public, pg_temp
as $$
begin
  if auth.role() = 'service_role' then return 'admin'; end if;
  if auth.uid() is null then return null; end if;
  if auth.uid() = p_provider then return 'provider'; end if;
  if p_client is not null and auth.uid() = p_client then return 'client'; end if;
  return null;
end;
$$;

-- Notatka dołączana do zdarzenia (ustawiana przez RPC w tej samej transakcji).
create or replace function public.escrow_note()
returns text
language sql stable
set search_path = public, pg_temp
as $$ select nullif(current_setting('escrow.note', true), '') $$;

create or replace function public.escrow_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists escrow_deals_touch on public.escrow_deals;
create trigger escrow_deals_touch
  before update on public.escrow_deals
  for each row execute function public.escrow_touch_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: zdarzenie deal_created
-- ----------------------------------------------------------------------------

create or replace function public.escrow_deal_created_event()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.escrow_events (deal_id, type, actor)
  values (new.id, 'deal_created', 'provider');
  return new;
end;
$$;

drop trigger if exists escrow_deal_created on public.escrow_deals;
create trigger escrow_deal_created
  after insert on public.escrow_deals
  for each row execute function public.escrow_deal_created_event();

-- ----------------------------------------------------------------------------
-- Trigger: strażnik DEALA (przejścia + kolumny niezmienne + zdarzenie)
-- ----------------------------------------------------------------------------

create or replace function public.escrow_guard_deal_transition()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  actor text;
  is_service boolean := auth.role() = 'service_role';
  unapproved int;
  ev text;
begin
  -- Kolumny niezmienne dla każdego (także providera).
  if new.id is distinct from old.id
     or new.provider_id is distinct from old.provider_id
     or new.fee_rate is distinct from old.fee_rate
     or new.created_at is distinct from old.created_at then
    raise exception 'escrow: provider_id, fee_rate and created_at are immutable';
  end if;

  -- client_user_id: authenticated nie ma na tę kolumnę UPDATE (patrz granty niżej);
  -- ustawia ją tylko escrow_claim_deal (SECURITY DEFINER) albo service_role.
  -- Po przypisaniu nie można jej zmienić ani wyzerować.
  if old.client_user_id is not null and new.client_user_id is distinct from old.client_user_id then
    raise exception 'escrow: client_user_id cannot be changed once claimed';
  end if;

  -- Treść umowy zamarza po wyjściu z draft (poza service_role = admin).
  if old.state <> 'draft' and not is_service and (
       new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.currency is distinct from old.currency
    or new.client_email is distinct from old.client_email) then
    raise exception 'escrow: deal terms are frozen once the deal leaves draft';
  end if;

  if new.state = old.state then
    return new; -- zmiany treści w draft przechodzą
  end if;

  actor := public.escrow_actor_for(old.provider_id, old.client_user_id);
  if actor is null then
    raise exception 'escrow: cannot establish actor identity';
  end if;

  if not (
    (old.state = 'draft'    and new.state = 'proposed'  and actor = 'provider') or
    (old.state = 'draft'    and new.state = 'cancelled' and actor = 'provider') or
    (old.state = 'proposed' and new.state = 'active'    and actor = 'client') or
    (old.state = 'proposed' and new.state = 'cancelled' and actor in ('provider','client')) or
    (old.state = 'active'   and new.state = 'completed' and actor = 'admin') or
    (old.state = 'active'   and new.state = 'cancelled' and actor = 'admin') or
    (old.state = 'active'   and new.state = 'disputed'  and actor in ('provider','client')) or
    (old.state = 'disputed' and new.state in ('active','cancelled','completed') and actor = 'admin')
  ) then
    raise exception 'escrow: illegal deal transition % -> % by %', old.state, new.state, actor;
  end if;

  -- Guard strukturalny: proposed wymaga >=1 milestone
  if new.state = 'proposed' then
    if not exists (select 1 from public.escrow_milestones m where m.deal_id = old.id) then
      raise exception 'escrow: cannot propose a deal without milestones';
    end if;
  end if;

  -- Guard strukturalny: aktywacja wymaga przypisanego klienta (zaproszenie przyjęte)
  if new.state = 'active' and old.state = 'proposed' and old.client_user_id is null then
    raise exception 'escrow: the client has not claimed the invite yet';
  end if;

  -- Guard strukturalny: completed z active wymaga wszystkich approved
  if old.state = 'active' and new.state = 'completed' then
    select count(*) into unapproved
      from public.escrow_milestones m
      where m.deal_id = old.id and m.state <> 'approved';
    if unapproved > 0 then
      raise exception 'escrow: cannot complete, % milestone(s) not approved', unapproved;
    end if;
  end if;

  -- Zdarzenie (lustro dealEventFor w core/stateMachine.ts)
  ev := case
    when new.state = 'proposed' then 'deal_proposed'
    when new.state = 'active' and old.state = 'proposed' then 'deal_accepted'
    when new.state = 'active' and old.state = 'disputed' then 'dispute_resolved'
    when new.state = 'completed' and old.state = 'disputed' then 'dispute_resolved'
    when new.state = 'completed' then 'deal_completed'
    when new.state = 'cancelled' and old.state = 'disputed' then 'dispute_resolved'
    when new.state = 'cancelled' then 'deal_cancelled'
    when new.state = 'disputed' then 'deal_disputed'
  end;
  insert into public.escrow_events (deal_id, type, actor, note)
  values (old.id, ev, actor, public.escrow_note());

  return new;
end;
$$;

drop trigger if exists escrow_deal_transition_guard on public.escrow_deals;
create trigger escrow_deal_transition_guard
  before update on public.escrow_deals
  for each row execute function public.escrow_guard_deal_transition();

-- ----------------------------------------------------------------------------
-- Trigger: strażnik MILESTONE (przejścia + kolumny niezmienne + zdarzenie)
-- ----------------------------------------------------------------------------

create or replace function public.escrow_guard_milestone_transition()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  deal record;
  actor text;
  is_service boolean := auth.role() = 'service_role';
  earlier_unapproved int;
  ev text;
begin
  if new.id is distinct from old.id
     or new.deal_id is distinct from old.deal_id
     or new.position is distinct from old.position then
    raise exception 'escrow: milestone id, deal_id and position are immutable';
  end if;

  select * into deal from public.escrow_deals d where d.id = old.deal_id;
  actor := public.escrow_actor_for(deal.provider_id, deal.client_user_id);

  -- Treść i kwota tylko w draft i tylko przez providera (admin wyjątkowo).
  if new.title is distinct from old.title
     or new.description is distinct from old.description
     or new.amount is distinct from old.amount then
    if not is_service and (deal.state <> 'draft' or actor is distinct from 'provider') then
      raise exception 'escrow: milestone terms can be edited only by the provider while the deal is in draft';
    end if;
  end if;

  -- Znaczniki czasu ustawia wyłącznie trigger.
  if (new.delivered_at is distinct from old.delivered_at
      or new.approved_at is distinct from old.approved_at)
     and new.state = old.state and not is_service then
    raise exception 'escrow: timestamps are set by transitions only';
  end if;

  if new.state = old.state then
    return new;
  end if;

  if deal.state <> 'active' then
    raise exception 'escrow: milestones can change only in an active deal (deal is %)', deal.state;
  end if;

  if actor is null then
    raise exception 'escrow: cannot establish actor identity';
  end if;

  if not (
    (old.state = 'pending'   and new.state = 'delivered' and actor = 'provider') or
    (old.state = 'delivered' and new.state = 'approved'  and actor = 'client') or
    (old.state = 'delivered' and new.state = 'rejected'  and actor = 'client') or
    (old.state = 'rejected'  and new.state = 'pending'   and actor = 'provider')
  ) then
    raise exception 'escrow: illegal milestone transition % -> % by %', old.state, new.state, actor;
  end if;

  -- Guard: ścisła kolejność akceptacji (dostarczanie może być równoległe)
  if new.state = 'approved' then
    select count(*) into earlier_unapproved
      from public.escrow_milestones m
      where m.deal_id = old.deal_id and m.position < old.position and m.state <> 'approved';
    if earlier_unapproved > 0 then
      raise exception 'escrow: approve earlier milestones first (% unapproved before #%)',
        earlier_unapproved, old.position;
    end if;
    new.approved_at := now();
  end if;

  if new.state = 'delivered' then
    new.delivered_at := now();
  end if;

  -- Zdarzenie (lustro milestoneEventFor w core/stateMachine.ts)
  ev := case
    when new.state = 'delivered' then 'milestone_delivered'
    when new.state = 'approved' then 'milestone_approved'
    when new.state = 'rejected' then 'milestone_rejected'
    when new.state = 'pending' and old.state = 'rejected' then 'milestone_reopened'
  end;
  insert into public.escrow_events (deal_id, milestone_id, type, actor, note)
  values (old.deal_id, old.id, ev, actor, public.escrow_note());

  return new;
end;
$$;

drop trigger if exists escrow_milestone_transition_guard on public.escrow_milestones;
create trigger escrow_milestone_transition_guard
  before update on public.escrow_milestones
  for each row execute function public.escrow_guard_milestone_transition();

-- Append-only: zdarzeń nie wolno zmieniać, kasować ani czyścić (TRUNCATE).
-- Uwaga: właściciel tabeli/superuser może wyłączyć triggery - to granica zaufania
-- bazy, nie coś, co zamyka ten plik.
create or replace function public.escrow_events_append_only()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'escrow: events log is append-only';
end;
$$;

drop trigger if exists escrow_events_no_update on public.escrow_events;
create trigger escrow_events_no_update
  before update or delete on public.escrow_events
  for each row execute function public.escrow_events_append_only();

drop trigger if exists escrow_events_no_truncate on public.escrow_events;
create trigger escrow_events_no_truncate
  before truncate on public.escrow_events
  for each statement execute function public.escrow_events_append_only();

-- ----------------------------------------------------------------------------
-- Zaproszenie klienta (zastępuje tożsamość po e-mailu)
-- ----------------------------------------------------------------------------

-- Provider generuje jednorazowy token dla deala (draft/proposed, klient jeszcze
-- nieprzypisany). Zwraca token jawnie JEDEN raz; w bazie zostaje tylko hash.
-- Ponowne wywołanie unieważnia poprzedni token.
create or replace function public.escrow_create_invite(p_deal uuid)
returns text
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  d record;
  token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  select * into d from public.escrow_deals where id = p_deal;
  if not found or auth.uid() is null or auth.uid() <> d.provider_id then
    raise exception 'escrow: not your deal';
  end if;
  if d.state not in ('draft','proposed') or d.client_user_id is not null then
    raise exception 'escrow: invite not available for this deal';
  end if;
  insert into public.escrow_invites (deal_id, token_hash)
  values (p_deal, sha256(convert_to(token, 'UTF8')))
  on conflict (deal_id) do update set token_hash = excluded.token_hash, created_at = now();
  return token;
end;
$$;

-- Klient przyjmuje zaproszenie: token pasuje, deal jest 'proposed', konto != provider.
create or replace function public.escrow_claim_deal(p_deal uuid, p_token text)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  d record;
  h bytea;
begin
  if auth.uid() is null then raise exception 'escrow: authentication required'; end if;
  select * into d from public.escrow_deals where id = p_deal for update;
  select token_hash into h from public.escrow_invites where deal_id = p_deal;
  -- Jeden komunikat dla każdego błędu: bez wyroczni "deal istnieje / token zły".
  if d.id is null or h is null or d.state <> 'proposed' or d.client_user_id is not null
     or auth.uid() = d.provider_id
     or h is distinct from sha256(convert_to(coalesce(p_token, ''), 'UTF8')) then
    raise exception 'escrow: invalid or expired invite';
  end if;
  update public.escrow_deals set client_user_id = auth.uid() where id = p_deal;
  delete from public.escrow_invites where deal_id = p_deal;
end;
$$;

-- ----------------------------------------------------------------------------
-- Atomowe przejścia (RPC, SECURITY INVOKER: RLS i granty obowiązują wołającego)
-- ----------------------------------------------------------------------------
-- Jedno wywołanie = jedna transakcja: zmiana stanu i zdarzenie (z triggera)
-- zatwierdzają się razem albo wcale. p_expected chroni przed wyścigiem
-- (dwa równoległe żądania na tym samym stanie): drugie dostaje błąd.

create or replace function public.escrow_transition_deal(
  p_deal uuid, p_to text, p_expected text, p_note text default null
) returns text
language plpgsql
set search_path = public, pg_temp
as $$
declare
  n int;
begin
  perform set_config('escrow.note', coalesce(left(p_note, 2000), ''), true);
  update public.escrow_deals set state = p_to where id = p_deal and state = p_expected;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'escrow: deal not found, not visible, or no longer in state %', p_expected;
  end if;
  return p_to;
end;
$$;

create or replace function public.escrow_transition_milestone(
  p_milestone uuid, p_to text, p_expected text, p_note text default null
) returns text
language plpgsql
set search_path = public, pg_temp
as $$
declare
  n int;
begin
  perform set_config('escrow.note', coalesce(left(p_note, 2000), ''), true);
  update public.escrow_milestones set state = p_to where id = p_milestone and state = p_expected;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'escrow: milestone not found, not visible, or no longer in state %', p_expected;
  end if;
  return p_to;
end;
$$;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.escrow_deals enable row level security;
alter table public.escrow_milestones enable row level security;
alter table public.escrow_events enable row level security;
alter table public.escrow_invites enable row level security;  -- bez polityk: zero dostępu

drop policy if exists "provider reads own deals" on public.escrow_deals;
create policy "provider reads own deals" on public.escrow_deals
  for select using (auth.uid() = provider_id);

drop policy if exists "client reads own deals" on public.escrow_deals;
create policy "client reads own deals" on public.escrow_deals
  for select using (client_user_id is not null and auth.uid() = client_user_id);

drop policy if exists "provider creates draft deals" on public.escrow_deals;
create policy "provider creates draft deals" on public.escrow_deals
  for insert with check (auth.uid() = provider_id and state = 'draft' and client_user_id is null);

drop policy if exists "parties update deals (trigger enforces legality)" on public.escrow_deals;
create policy "parties update deals (trigger enforces legality)" on public.escrow_deals
  for update
  using (auth.uid() = provider_id or (client_user_id is not null and auth.uid() = client_user_id))
  with check (auth.uid() = provider_id or (client_user_id is not null and auth.uid() = client_user_id));

drop policy if exists "parties read milestones" on public.escrow_milestones;
create policy "parties read milestones" on public.escrow_milestones
  for select using (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or (d.client_user_id is not null and auth.uid() = d.client_user_id)
    )
  ));

drop policy if exists "provider manages milestones in draft" on public.escrow_milestones;
create policy "provider manages milestones in draft" on public.escrow_milestones
  for insert with check (exists (
    select 1 from public.escrow_deals d
    where d.id = deal_id and d.provider_id = auth.uid() and d.state = 'draft'
  ));

drop policy if exists "parties update milestones (trigger enforces legality)" on public.escrow_milestones;
create policy "parties update milestones (trigger enforces legality)" on public.escrow_milestones
  for update
  using (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or (d.client_user_id is not null and auth.uid() = d.client_user_id)
    )
  ))
  with check (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or (d.client_user_id is not null and auth.uid() = d.client_user_id)
    )
  ));

drop policy if exists "parties read events" on public.escrow_events;
create policy "parties read events" on public.escrow_events
  for select using (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or (d.client_user_id is not null and auth.uid() = d.client_user_id)
    )
  ));

-- UWAGA: celowo brak polityki INSERT na escrow_events (zdarzenia tylko z triggerów).
drop policy if exists "parties append events" on public.escrow_events;

-- ----------------------------------------------------------------------------
-- Uprawnienia (granty): najmniejsze możliwe dla anon/authenticated
-- ----------------------------------------------------------------------------
-- Supabase domyślnie nadaje anon/authenticated pełne prawa do nowych obiektów
-- w public. RLS to druga linia; granty zamykają to, czego RLS nie opisuje.

revoke all on public.escrow_deals, public.escrow_milestones,
              public.escrow_events, public.escrow_invites from anon, authenticated;

grant select on public.escrow_deals, public.escrow_milestones, public.escrow_events to authenticated;
-- Tworzenie deala: tylko kolumny treści (state=draft, fee_rate z defaultu).
grant insert (provider_id, client_email, title, description, currency)
  on public.escrow_deals to authenticated;
grant insert (deal_id, position, title, description, amount)
  on public.escrow_milestones to authenticated;
-- Aktualizacje: stan + treść (triggery pilnują kto, kiedy i co).
grant update (state, title, description, currency, client_email)
  on public.escrow_deals to authenticated;
grant update (state, title, description, amount)
  on public.escrow_milestones to authenticated;

revoke all on function public.escrow_create_invite(uuid), public.escrow_claim_deal(uuid, text)
  from public, anon;
grant execute on function public.escrow_create_invite(uuid), public.escrow_claim_deal(uuid, text)
  to authenticated;
revoke all on function public.escrow_transition_deal(uuid, text, text, text),
               public.escrow_transition_milestone(uuid, text, text, text) from public, anon;
grant execute on function public.escrow_transition_deal(uuid, text, text, text),
                          public.escrow_transition_milestone(uuid, text, text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Widok księgowy - lustro core/fees.ts (zaokrąglenie half-up do 2 miejsc)
-- ----------------------------------------------------------------------------
-- security_invoker: widok respektuje RLS wołającego (inaczej omijałby RLS jako właściciel).

create or replace view public.escrow_deal_fees
with (security_invoker = true) as
select
  d.id as deal_id,
  d.provider_id,
  d.state,
  d.fee_rate,
  round(sum(m.amount), 2) as total_amount,
  round(round(sum(m.amount), 2) * d.fee_rate, 2) as fee_amount,
  round(sum(m.amount), 2) - round(round(sum(m.amount), 2) * d.fee_rate, 2) as provider_net
from public.escrow_deals d
join public.escrow_milestones m on m.deal_id = d.id
group by d.id;

revoke all on public.escrow_deal_fees from anon, authenticated;
grant select on public.escrow_deal_fees to authenticated;

comment on view public.escrow_deal_fees is
  'Lustro computeFees() z core/fees.ts. Inwariant: fee_amount + provider_net = total_amount. Do faktur ręcznych w V1.';
