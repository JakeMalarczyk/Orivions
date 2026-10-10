# Orivions Escrow - moduł V1 (standalone)

Samodzielny moduł escrow dla marketplace'u Orivions: **śledzenie deali z kamieniami
milowymi, maszyna stanów, księgowość fee i append-only dziennik zdarzeń.**
Leży z boku głównego projektu - dołączalny w każdym momencie, odłączalny jedną
komendą, audytowalny w izolacji.

## Zakres V1 - i czego świadomie NIE robi

**Robi:** pełny cykl życia deala (draft → proposed → active → completed /
cancelled / disputed), kamienie milowe z akceptacją w ścisłej kolejności,
zamrożenie stawki fee w momencie propozycji (10% flat - jedna stawka, bez abonamentów), niezmienny
dziennik zdarzeń, wyliczenia fee identyczne w TS i SQL.

**NIE robi (świadomie):** nie przechowuje ani nie przesyła pieniędzy. Środki
płyną poza platformą; moduł rejestruje i wymusza uzgodniony proces. Powiernictwo
to V2 (partner płatniczy) / V3 (program on-chain) - oba wpinają się przez JEDEN
interfejs `PaymentProvider` (core/types.ts), którego hooki core już dziś woła
(w V1 obsługiwane przez no-opowy `manualPaymentProvider`). Decyzja zgodna z
analizą ryzyk prawnych (Orivions_Ryzyka_i_Platnosci.docx).

## Architektura - 4 warstwy, zależności tylko w dół

```
ui/DealTimeline.tsx      React, zero fetchy - renderuje i woła callbacki
api/route.ts             cienki adapter Next.js: tożsamość → core → zapis → event
core/                    CZYSTE funkcje: typy, maszyna stanów, fee, payment seam
sql/001_escrow.sql       3 tabele, RLS, triggery-strażnicy, widok księgowy
```

Zasada nienaruszalna: **api/ i ui/ nie zawierają reguł biznesowych.** Każda
reguła mieszka w core/ (testowana) i lustrzanie w SQL (ostatnia linia obrony).

## Podwójna walidacja przejść - i jej mechaniczna gwarancja

Tabela przejść istnieje w dwóch miejscach celowo: `core/stateMachine.ts`
(dobre błędy, wcześnie) i triggery w `sql/001_escrow.sql` (działa nawet przy
ominięciu API). Żeby "identyczna" nie było deklaracją:
`tests/parity.test.mjs` **parsuje warunki triggerów z SQL i porównuje
mechanicznie z tabelami TS** - każda edycja jednej strony bez drugiej wywala test.

## Kluczowe decyzje projektowe (dla audytora)

1. **fee_rate zamrożone na dealu** w momencie propozycji - nawet przyszła
   zmiana cennika nie przecenia trwającego deala. Snapshot > join. (V1 to
   jedna płaska stawka 10%, bez abonamentów.)
2. **Akceptacja kamieni w ścisłej kolejności** (dostarczanie może być
   równoległe) - księga fee czyta się jednoznacznie.
3. **Dziennik zdarzeń append-only** - trigger odrzuca UPDATE/DELETE. Każde
   udane przejście emituje dokładnie jeden typ zdarzenia (mapowanie w
   stateMachine.ts, pokryte testami).
4. **Aktor wyprowadzany z tożsamości, nie z requestu**: provider = auth.uid()
   równe provider_id; klient = e-mail zweryfikowanej sesji (ten sam wzorzec co
   RLS leads w głównej aplikacji); admin = wyłącznie service_role.
5. **Kwoty w centach wewnętrznie** (core/fees.ts) - zero dryfu floatów;
   inwariant fee + net = total sfuzzowany 500 przypadkami.

## Weryfikacja - co zostało NAPRAWDĘ sprawdzone

- `tsc --strict`: kompilacja czysta (realny kompilator, realne emitowanie JS)
- **242 asercje testów TS wykonane, 0 porażek; 11 testów Rust zielonych (`cargo test`)**, w tym WYCZERPUJĄCA
  matryca 6×6×3 przejść deala (108) i 4×4×3 milestone (48) - każda kombinacja
  stan×stan×aktor porównana z tabelą
- **Test parzystości TS↔SQL wykonany** (12 tupli deal + 4 milestone, zgodne;
  test w trakcie budowy złapał zresztą prawdziwą pułapkę - nazwę funkcji w
  komentarzu - co potwierdza że nie jest atrapą)
- SQL: walidacja strukturalna (nawiasy, $$-pary, drop-before-create). UWAGA:
  **nie był uruchomiony na żywym Postgresie** (niedostępny w środowisku
  budowy) - pierwszy realny bieg migracji wykonaj na projekcie testowym
  Supabase przed produkcją.


## Przegląd jakości kodu (self-audit) - 5 znalezisk, wszystkie naprawione

| # | Znalezisko | Waga | Naprawa |
|---|---|---|---|
| 1 | **`core/payments.ts` nieosiągalny** - `index.ts` go nie re-eksportował, więc cały V2 był martwy dla hosta ("host importuje TYLKO z index") | **realny błąd** | index przepisany na `export *`; **dodany `tests/surface.test.mjs`**, który tę klasę błędu wyłapuje na stałe (potwierdzone: po usunięciu eksportu test daje 7 porażek i exit 1) |
| 2 | **Fałszywa wyczerpalność testów** - matryce iterowały po listach stanów zahardkodowanych w pliku testu, więc nowy stan w rdzeniu nie byłby pokryty | **realny błąd testów** | listy importowane z rdzenia (`DEAL_STATES`/`MILESTONE_STATES`/`ACTORS`); `Actor` zamieniony na listę runtime. Dowód: tymczasowe dodanie stanu poszerzyło matrycę 184 → 224 asercji automatycznie |
| 3 | **Duplikacja szkieletu w `api/route.ts`** - wyprowadzanie aktora, pobrania i insert zdarzenia w dwóch niemal identycznych kopiach | dług techniczny | jeden przepływ + helpery (`deriveActor`, `fetchDeal`, `fetchMilestones`, `fail`) |
| 4 | **Kod „kłamał" o tożsamości** - osoba spoza deala dostawała etykietę `actor: 'client'` i była odrzucana dopiero przez RLS | drobne, ale źle wygląda w audycie | `deriveActor` zwraca `null` → jawne **403** zamiast zgadywania roli |
| 5 | Artefakty budowy (`dist/`, `dist2/`) w drzewie roboczym | higiena | usunięte + `.gitignore` |

**Uczciwie o liczbach:** ten przegląd **nie był redukcją LOC** - `api/route.ts` urósł o 8 linii (deduplikacja zwróciła mniej, niż kosztowała ekstrakcja helperów i nowa ścieżka 403), `index.ts` schudł o 7, doszedł test powierzchni. Netto moduł: 2 375 → 2 411 LOC. **`cargo test` jest zielony (11/11), łącznie z parzystością SQL.** Następny krok to zastąpienie rdzenia TS wiązaniem do Rusta (albo zostawienie go wyłącznie jako warstwy regresji).

## Uruchomienie testów
```bash
npm install && npm test   # 242 asercje TS: surface, stateMachine, fees, payments, parity
cd rust && cargo test     # 11 testów Rust (jądro + parzystość SQL) - zielone
```

## Checklist audytowa (proponowana)

- [ ] Migracja przechodzi na czystym projekcie Supabase (po schema.sql głównej apki)
- [ ] Diff wzrokowy tabel przejść: komentarz w SQL ↔ DEAL_TRANSITIONS/MILESTONE_TRANSITIONS
- [ ] Próba nielegalnego przejścia bezpośrednio przez klienta Supabase (z pominięciem API) → trigger odrzuca
- [ ] Próba UPDATE/DELETE na escrow_events → odrzucone
- [ ] Klient A nie widzi deali klienta B (RLS, dwa konta testowe)
- [ ] Provider nie może zaakceptować własnego milestone'u (actor check)
- [ ] `escrow_deal_fees` = `computeFees()` dla 3 ręcznych przypadków, w tym groszowego
- [ ] Wszystkie 3 suity testów zielone na maszynie audytora

## Dołączenie do produktu - patrz INTEGRATION.md (30 min)
