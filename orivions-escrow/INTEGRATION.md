# Dołączenie modułu escrow do Orivions - ~30 minut

Moduł jest projektowany tak, żeby dołączenie było addytywne: **zero zmian
w istniejących plikach produktu poza dwoma wpięciami UI.**

## Krok 1 - Baza (5 min)
Supabase SQL Editor → wklej `sql/001_escrow.sql` → Run.
(Wymaga wcześniej: schema.sql głównej aplikacji i Postgres 15+ - Supabase to ma.
Kolejność względem pozostałych migracji dowolna - moduł niczego w nich nie dotyka.)

Uwaga o tożsamości: klient NIE jest rozpoznawany po e-mailu (rejestracja w głównej
aplikacji nie wymaga potwierdzenia e-maila, więc każdy mógłby podszyć się pod cudzy
adres). Klient zostaje przypisany do deala przez **jednorazowy link z zaproszeniem**
(`create_invite` → `claim_invite`, patrz niżej). Potwierdzanie e-maili w Supabase Auth
nadal warto włączyć, ale bezpieczeństwo escrow od tego nie zależy.

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
2. **Client dashboard**: sekcja "Deals" → lista `escrow_deals` (RLS zwraca tylko deale,
   w których `client_user_id = auth.uid()`) → `<DealTimeline viewer="client" …>`.
   Zaproszenie: provider po `proposed` wywołuje `POST /api/escrow` z
   `{action:'create_invite', dealId}` i dostaje token JEDEN raz (w bazie zostaje tylko hash);
   wysyła klientowi link `/escrow/join?deal=<id>&token=<token>`; klient po zalogowaniu
   wywołuje `{action:'claim_invite', dealId, token}`. Token jest jednorazowy,
   a ponowne `create_invite` unieważnia poprzedni.
3. `fees` do komponentu: jedno zapytanie do widoku `escrow_deal_fees`
   (albo `computeFees()` z core na już pobranych milestone'ach - wynik
   identyczny, co gwarantują testy parzystości zaokrągleń).

## Krok 4 - Smoke test (5 min)
Dwa konta testowe (provider + klient):
draft → dodaj 2 milestones → proposed → (klient) accept → provider "Mark
delivered" #1 → klient "Approve" #1 → spróbuj Approve #2 przed delivered
(ma odmówić) → dostarczenie i akceptacja #2 → (admin, z panelu Supabase jako
service_role) complete → sprawdź `escrow_events`: komplet wpisów w kolejności.
Po stronie bazy te scenariusze (oraz próby ataków z audytu) pokrywa `node tests/sql.test.mjs`
(prawdziwy Postgres w WASM, bez Supabase).

## Odłączenie
```sql
drop view if exists public.escrow_deal_fees;
drop table if exists public.escrow_invites, public.escrow_events, public.escrow_milestones, public.escrow_deals cascade;
drop function if exists public.escrow_guard_deal_transition, public.escrow_guard_milestone_transition,
  public.escrow_deal_created_event, public.escrow_touch_updated_at, public.escrow_events_append_only,
  public.escrow_create_invite, public.escrow_claim_deal, public.escrow_transition_deal,
  public.escrow_transition_milestone, public.escrow_actor_for, public.escrow_note;
```
+ usuń trzy skopiowane pliki/foldery. Produkt wraca do stanu sprzed dołączenia.

## Zmienne środowiskowe i ograniczenia trasy
- `NEXT_PUBLIC_SUPABASE_URL` oraz klucz publiczny: `route.ts` czyta `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  albo `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (użyj nazwy, którą ma główna aplikacja).
- Trasa obsługuje tylko stronę provider/client. Akcje admina (complete, cancel aktywnego,
  rozstrzyganie sporów) wykonuj z osobnej trasy operatora na `service_role` z własnym
  uwierzytelnieniem - nigdy z tej trasy.
- Limit żądań w `route.ts` jest per instancja (30/min/użytkownik); w produkcji dodaj współdzielony limiter.
- Hook płatności uruchamia się PO zatwierdzeniu zmiany w bazie. Jeśli zwróci błąd, trasa odpowiada
  202 z `payment.ok=false` i loguje błąd; zmiana stanu zostaje (do uzgodnienia ręcznie).

## Droga do V2 (partner płatniczy) - dla planowania, nie do roboty teraz
Jedyny plik do napisania: `core/partnerProvider.ts` implementujący
`PaymentProvider` (trzy hooki) + podmiana bindingu w `api/route.ts`
(1 linia importu). Tabele i UI bez zmian - `PaymentResult.reference` już ma
miejsce na id transferu.
