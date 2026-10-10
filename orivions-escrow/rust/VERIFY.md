# Protokół weryfikacji - PRZECZYTAJ PRZED UŻYCIEM

Ten crate powstał w środowisku **bez toolchaina Rust** (instalacja zablokowana -
sprawdzone: apt 403, rust-lang.org na deny-liście). Zgodnie z poaudytową zasadą
projektu ("nie używamy kodu niezweryfikowanego wykonaniem"):

## Bramka: `cargo test` u Ciebie

```bash
cd orivions-escrow/rust
cargo test
```

- Zero zależności → test pobiegnie bez sieci, bez crates.io.
- Oczekiwane: 12 testów (6 integracyjnych w tests/suite.rs + 6 jednostkowych w src/fees.rs), wszystkie zielone, w tym
  `sql_parity` czytający ../sql/001_escrow.sql przez include_str!.
- **Do zielonego biegu ten crate NIE istnieje dla produktu.** Aktywną,
  wykonaną-i-przetestowaną implementacją pozostaje ../core (TypeScript, 203
  testy odpalone w środowisku budowy).

## Co obniżyliśmy z ryzyka ślepego pisania
- Algorytm parsera SQL (test parzystości) był PROTOTYPOWANY i zweryfikowany na
  prawdziwym pliku SQL w Pythonie przed transkrypcją do Rusta (12+4 tuple).
- Tabele przejść to wyczerpujące `match` - kompilator wymusi rozważenie każdej
  pary stanów, czego wersja TS nie potrafi.
- Pieniądze: czyste liczby całkowite (centy, i64) + checked_add/mul - bez
  floatów w ogóle; zaokrąglenie half-up policzone na intach `(raw + 50) / 100`.
- Jeden błąd złapany jeszcze przed Tobą: nielegalny literał hex w seedzie
  fuzza (`0x0RIV`) - poprawiony; wspominam, bo pokazuje realny poziom ryzyka
  tego trybu pracy i czemu bramka jest twarda.

## Po zielonym `cargo test`
1. Zgłoś wynik - crate staje się kanoniczną implementacją.
2. Ścieżka wpięcia do TS: wasm-pack (target bundler) → podmiana importów w
   api/route.ts na wygenerowany pakiet; testy TS zostają jako regresja.
3. Ścieżka V3: ten sam moduł stanów wchodzi do programu Anchor (typy już są
   w reprezentacji on-chain: centy/base-units jako całkowite).
