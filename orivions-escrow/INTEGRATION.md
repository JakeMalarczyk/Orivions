# Dołączenie modułu escrow do Orivions - ~30 minut

Moduł jest projektowany tak, żeby dołączenie było addytywne: **zero zmian
w istniejących plikach produktu poza dwoma wpięciami UI.**

## Krok 1 - Baza (5 min)
Supabase SQL Editor → wklej `sql/001_escrow.sql` → Run.
(Wymaga wcześniej: schema.sql głównej aplikacji. Kolejność względem pozostałych
migracji dowolna - moduł niczego w nich nie dotyka.)

## Krok 2 - Kod (5 min)
```
cp -r core  <app>/escrow/core          # czyste funkcje
cp api/route.ts <app>/app/api/escrow/route.ts
cp ui/DealTimeline.tsx <app>/components/escrow/DealTimeline.tsx
```
Alias w tsconfig już obejmuje `@/*`, więc importy `@/escrow/core` działają od razu.

## Krok 3 - Wpięcie UI (15 min)
1. **Provider dashboard**: nowa zakładka "Deals" w sidebarze → lista
   `escrow_deals` po `provider_id = auth.uid()` → dla wybranego deala renderuj
   `<DealTimeline viewer="provider" …>` i podepnij oba callbacki do
   `POST /api/escrow` (wzorzec fetch identyczny jak w ProposalGeneratorClient -
   Bearer token z sesji).
2. **Client dashboard**: sekcja "Deals" → lista po `client_email` (RLS załatwia
   filtrowanie samo) → `<DealTimeline viewer="client" …>`.
3. `fees` do komponentu: jedno zapytanie do widoku `escrow_deal_fees`
   (albo `computeFees()` z core na już pobranych milestone'ach - wynik
   identyczny, co gwarantują testy parzystości zaokrągleń).

## Krok 4 - Smoke test (5 min)
Dwa konta testowe (provider + klient):
draft → dodaj 2 milestones → proposed → (klient) accept → provider "Mark
delivered" #1 → klient "Approve" #1 → spróbuj Approve #2 przed delivered
(ma odmówić) → dostarczenie i akceptacja #2 → (admin, z panelu Supabase jako
service_role) complete → sprawdź `escrow_events`: komplet wpisów w kolejności.

## Odłączenie
```sql
drop view if exists public.escrow_deal_fees;
drop table if exists public.escrow_events, public.escrow_milestones, public.escrow_deals cascade;
drop function if exists public.escrow_guard_deal_transition, public.escrow_guard_milestone_transition, public.escrow_events_append_only;
```
+ usuń trzy skopiowane pliki/foldery. Produkt wraca do stanu sprzed dołączenia.

## Droga do V2 (partner płatniczy) - dla planowania, nie do roboty teraz
Jedyny plik do napisania: `core/partnerProvider.ts` implementujący
`PaymentProvider` (trzy hooki) + podmiana bindingu w `api/route.ts`
(1 linia importu). Tabele i UI bez zmian - `PaymentResult.reference` już ma
miejsce na id transferu.
