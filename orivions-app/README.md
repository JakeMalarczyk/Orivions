# Orivions, Next.js

## ⚠️ Historia weryfikacji, przeczytaj, to ważne

**Wersja 1 tego kodu nie kompilowała się.** Zewnętrzny audyt (RAPORT_TESTOW_ORIVIONS.md,
17.07.2026) uruchomił prawdziwy `npm install` + `tsc` i znalazł 14 twardych błędów
kompilacji oraz 4 poważne problemy bezpieczeństwa/logiki. Przyczyna błędów kompilacji:
kod był weryfikowany offline na ręcznie napisanych stubach typów, które nieświadomie
odtworzyły składnię Supabase **v1** (`.from<T>()`), podczas gdy prawdziwy pakiet to v2.
Lekcja: weryfikacja była zgodna sama ze sobą, nie z rzeczywistością.

**Ta wersja naprawia wszystkie znaleziska audytu (szczegóły niżej), ale nadal powstała
w środowisku bez dostępu do npm**, poprawki są oparte o ustalenia audytu (zrobionego
na prawdziwych pakietach) i oficjalne wzorce Supabase v2 / @supabase/ssr, zweryfikowane
składniowo per-plik. **`npm install && npm run build` u Ciebie pozostaje pierwszym
prawdziwym testem, jeśli cokolwiek wyskoczy, wróć z pełnym błędem.**

## Poprawki po audycie (mapowanie 1:1 na znaleziska raportu)

| Znalezisko | Poprawka |
|---|---|
| 1.2/2.3, `.from<T>()` ×14, projekt się nie kompiluje | Usunięte wszystkie generyki v1; wyniki typowane jawnie przez rzutowanie (`as Company[]` itd.) |
| 2.1, middleware vs localStorage, pętla przekierowań | Przejście na `@supabase/ssr`: `createBrowserClient` w `lib/supabase.ts` (sesja w cookies) + `createServerClient` z prawdziwą walidacją `getUser()` w `middleware.ts`. Dodana zależność `@supabase/ssr` |
| 2.2, panel klienta zawsze pusty (RLS) | Nowa polityka w `orivions_backend/migration_security_fixes.sql`: klient czyta leady po e-mailu ze zweryfikowanej sesji (`auth.jwt() ->> 'email'`) |
| 2.4, otwarte proxy do API Anthropic | Oba endpointy przepisane: klient wysyła TYLKO dane wejściowe (`{need}` / `{brief, services, tone}`), prompt składany w całości server-side; `/api/ai-proposal` wymaga zalogowanej sesji (Bearer token weryfikowany przez `auth.getUser()`); rate limiting na obu (5/min per IP dla smart-match, 4/min per user dla proposal); `max_tokens` obniżone |
| 2.5, provider sam sobie ustawia verified/featured | Trigger `guard_privileged_columns` w `migration_security_fixes.sql`, zmiana `verified`/`featured`/`featured_until` tylko dla `service_role` |
| 2.6, publiczny wyciek `referral_code` | Wszystkie publiczne odczyty `companies` używają jawnych list kolumn zamiast `select('*')`; dodatkowo widok `companies_public` w migracji |
| 1.4, brak `.eslintrc.json` | Dodany (`next/core-web-vitals`) |
| 1.5, legacy backend bez oznaczenia | `orivions_backend/LEGACY_README.md` + CORS Edge Functions zawężony z `*` do konkretnej domeny |


## Refactor: EN-only + Blog + de-spaghetti (po decyzji produktowej)

Strona działa wyłącznie po angielsku, cała warstwa i18n usunięta świadomie:

- **Usunięte**: `lib/i18n.ts` (199 linii słowników), `components/LangSwitcher.tsx`, parametr `?lang=` z linków, `languages` alternates z metadata i sitemap. Stringi EN wpisane bezpośrednio tam, gdzie są używane.
- **Header** przepisany: był client componentem (useSearchParams dla locale) z ręcznie budowanymi linkami `withLang()`, teraz czysty server component z tablicą `NAV_LINKS` jako jednym źródłem nawigacji. Dodany link **Blog**. Zbędne wrappery `<Suspense>` wokół Headera usunięte ze wszystkich stron.
- **ProvidersCatalog**: słownik `t` był prop-drillowany przez 3 poziomy komponentów, teraz jedna stała modułowa, propsy komponentów-dzieci odchudzone.
- **Strony kategorii SEO zgeneralizowane**: zamiast kopiowania layoutu per kategoria, jeden `components/CategoryPage.tsx` (data-driven: sekcje, FAQ z auto-generowanym JSON-LD, CTA) + `components/CategoryProviders.tsx` z propem `category`. Trzy kategorie (audits / development / marketing) to teraz cienkie strony z samą treścią. Nowa kategoria = jeden plik z danymi.
- **Blog dodany**: `/blog` (rejestr postów jako prosta tablica, celowo bez CMS na tym etapie) + pierwszy wpis `/blog/why-we-are-building-orivions` (BlogPosting schema). Sitemap zaktualizowany.
- Apostrofy w tekście JSX zamienione na `&apos;` (react/no-unescaped-entities z next/core-web-vitals).

Weryfikacja: zero referencji do i18n w projekcie (grep), wszystkie importy `@/` wskazują na istniejące pliki, per-plikowy check składni czysty (npm nadal niedostępny w środowisku budowy, pełny `npm run build` po Twojej stronie pozostaje pierwszym prawdziwym testem, jak poprzednio).

## Znane, świadome ograniczenia (uczciwie)

- **Rate limiter jest in-memory**, na hostingu serverless każda instancja ma własny licznik,
  więc to miękki hamulec. Produkcyjnie: Upstash Ratelimit albo licznik w Supabase. (TODO)
- **`/api/smart-match` pozostaje publiczny** (bez logowania), to świadoma decyzja produktowa:
  Smart Match jest główną publiczną funkcją strony. Ochrona: prompt server-side (endpoint umie
  zrobić tylko matching, nic innego), limit 1500 znaków wejścia, rate limit, max_tokens 800.
- Kod po poprawkach **nadal nie przeszedł prawdziwego `npm run build`** w tym środowisku.

## Setup

```bash
npm install
cp .env.local.example .env.local   # uzupełnij 3 zmienne
npm run build
```

Zmienne środowiskowe: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`ANTHROPIC_API_KEY` (tylko server-side, nigdy z prefiksem NEXT_PUBLIC_).

Migracje SQL (uruchom w tej kolejności w Supabase SQL Editor):
`schema.sql` → `migration_revenue_streams.sql` → `migration_subscriptions.sql` → `migration_security_fixes.sql`
(wszystkie w folderze `orivions_backend/`).
