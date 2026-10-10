-- ============================================================================
-- ORIVIONS ESCROW - samodzielna migracja modułu (V1: tracking, bez powiernictwa)
--
-- DOŁĄCZENIE:  uruchom ten plik w Supabase SQL Editor (po schema.sql głównej
--              aplikacji - wymaga public.companies i uuid_generate_v4).
-- ODŁĄCZENIE:  drop table escrow_events, escrow_milestones, escrow_deals cascade;
--              drop function escrow_guard_deal_transition, escrow_guard_milestone_transition;
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
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabele
-- ----------------------------------------------------------------------------

create table if not exists public.escrow_deals (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.companies(id) on delete restrict,
  client_email text not null check (client_email = lower(client_email)),
  title text not null check (char_length(title) between 3 and 200),
  description text,
  currency text not null default 'USD' check (currency in ('USD','USDC')),
  state text not null default 'draft'
    check (state in ('draft','proposed','active','completed','cancelled','disputed')),
  -- Stawka fee ZAMROŻONA w momencie propozycji (patrz core/types.ts: Deal.feeRate).
  -- Zmiana abonamentu w trakcie deala celowo NIE przecenia deala w locie.
  fee_rate numeric not null check (fee_rate = 0.10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.escrow_milestones (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.escrow_deals(id) on delete cascade,
  position int not null check (position >= 1),
  title text not null check (char_length(title) between 3 and 200),
  description text,
  amount numeric not null check (amount > 0),
  state text not null default 'pending'
    check (state in ('pending','delivered','approved','rejected')),
  delivered_at timestamptz,
  approved_at timestamptz,
  unique (deal_id, position)
);

-- Append-only dziennik zdarzeń: fundament audytowalności całego modułu.
create table if not exists public.escrow_events (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.escrow_deals(id) on delete cascade,
  milestone_id uuid references public.escrow_milestones(id) on delete set null,
  type text not null check (type in (
    'deal_created','deal_proposed','deal_accepted','deal_completed',
    'deal_cancelled','deal_disputed','dispute_resolved',
    'milestone_delivered','milestone_approved','milestone_rejected','milestone_reopened'
  )),
  actor text not null check (actor in ('provider','client','admin')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists escrow_deals_provider_idx on public.escrow_deals(provider_id);
create index if not exists escrow_deals_client_idx on public.escrow_deals(client_email);
create index if not exists escrow_events_deal_idx on public.escrow_events(deal_id);

-- ----------------------------------------------------------------------------
-- Trigger: strażnik przejść DEALA (lustro DEAL_TRANSITIONS + guardy)
-- ----------------------------------------------------------------------------

create or replace function public.escrow_guard_deal_transition()
returns trigger as $$
declare
  actor text := coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'escrow_actor', null);
  is_service boolean := auth.role() = 'service_role';
  unapproved int;
begin
  if new.state = old.state then
    return new; -- nie-stanowe update'y (opis itd.) przechodzą
  end if;

  -- service_role reprezentuje 'admin' (operacje wyłącznie przez API/panel operatora)
  if is_service then
    actor := 'admin';
  elsif actor is null then
    -- Bez jawnego aktora: wyprowadź go z tożsamości (provider = właściciel; klient = e-mail sesji)
    if auth.uid() = old.provider_id then actor := 'provider';
    elsif lower(coalesce(auth.jwt() ->> 'email','')) = old.client_email then actor := 'client';
    else raise exception 'escrow: cannot establish actor identity';
    end if;
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

  -- Guard strukturalny: completed z active wymaga wszystkich approved
  if old.state = 'active' and new.state = 'completed' then
    select count(*) into unapproved
      from public.escrow_milestones m
      where m.deal_id = old.id and m.state <> 'approved';
    if unapproved > 0 then
      raise exception 'escrow: cannot complete, % milestone(s) not approved', unapproved;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists escrow_deal_transition_guard on public.escrow_deals;
create trigger escrow_deal_transition_guard
  before update on public.escrow_deals
  for each row execute function public.escrow_guard_deal_transition();

-- ----------------------------------------------------------------------------
-- Trigger: strażnik przejść MILESTONE (lustro MILESTONE_TRANSITIONS + guardy)
-- ----------------------------------------------------------------------------

create or replace function public.escrow_guard_milestone_transition()
returns trigger as $$
declare
  deal record;
  actor text := coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'escrow_actor', null);
  is_service boolean := auth.role() = 'service_role';
  earlier_unapproved int;
begin
  if new.state = old.state then
    return new;
  end if;

  select * into deal from public.escrow_deals d where d.id = old.deal_id;

  if deal.state <> 'active' then
    raise exception 'escrow: milestones can change only in an active deal (deal is %)', deal.state;
  end if;

  if is_service then
    actor := 'admin';
  elsif actor is null then
    if auth.uid() = deal.provider_id then actor := 'provider';
    elsif lower(coalesce(auth.jwt() ->> 'email','')) = deal.client_email then actor := 'client';
    else raise exception 'escrow: cannot establish actor identity';
    end if;
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

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists escrow_milestone_transition_guard on public.escrow_milestones;
create trigger escrow_milestone_transition_guard
  before update on public.escrow_milestones
  for each row execute function public.escrow_guard_milestone_transition();

-- Append-only: zdarzeń nie wolno zmieniać ani kasować (poza service_role - i to tylko świadomie)
create or replace function public.escrow_events_append_only()
returns trigger as $$
begin
  raise exception 'escrow: events log is append-only';
end;
$$ language plpgsql;

drop trigger if exists escrow_events_no_update on public.escrow_events;
create trigger escrow_events_no_update
  before update or delete on public.escrow_events
  for each row execute function public.escrow_events_append_only();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.escrow_deals enable row level security;
alter table public.escrow_milestones enable row level security;
alter table public.escrow_events enable row level security;

drop policy if exists "provider reads own deals" on public.escrow_deals;
create policy "provider reads own deals" on public.escrow_deals
  for select using (auth.uid() = provider_id);

drop policy if exists "client reads own deals" on public.escrow_deals;
create policy "client reads own deals" on public.escrow_deals
  for select using (lower(coalesce(auth.jwt() ->> 'email','')) = client_email);

drop policy if exists "provider creates draft deals" on public.escrow_deals;
create policy "provider creates draft deals" on public.escrow_deals
  for insert with check (auth.uid() = provider_id and state = 'draft');

drop policy if exists "parties update deals (trigger enforces legality)" on public.escrow_deals;
create policy "parties update deals (trigger enforces legality)" on public.escrow_deals
  for update using (
    auth.uid() = provider_id
    or lower(coalesce(auth.jwt() ->> 'email','')) = client_email
  );

drop policy if exists "parties read milestones" on public.escrow_milestones;
create policy "parties read milestones" on public.escrow_milestones
  for select using (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or lower(coalesce(auth.jwt() ->> 'email','')) = d.client_email
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
  for update using (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or lower(coalesce(auth.jwt() ->> 'email','')) = d.client_email
    )
  ));

drop policy if exists "parties read events" on public.escrow_events;
create policy "parties read events" on public.escrow_events
  for select using (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or lower(coalesce(auth.jwt() ->> 'email','')) = d.client_email
    )
  ));

drop policy if exists "parties append events" on public.escrow_events;
create policy "parties append events" on public.escrow_events
  for insert with check (exists (
    select 1 from public.escrow_deals d where d.id = deal_id and (
      auth.uid() = d.provider_id
      or lower(coalesce(auth.jwt() ->> 'email','')) = d.client_email
    )
  ));

-- ----------------------------------------------------------------------------
-- Widok księgowy - lustro core/fees.ts (zaokrąglenie half-up do 2 miejsc)
-- ----------------------------------------------------------------------------

create or replace view public.escrow_deal_fees as
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

comment on view public.escrow_deal_fees is
  'Lustro computeFees() z core/fees.ts. Inwariant: fee_amount + provider_net = total_amount. Do faktur ręcznych w V1.';
