# V2 - wybór partnera płatniczego (decyzja biznesowa, nie kodowa)

Kod jest partner-agnostyczny: adapter = implementacja 3 metod `PartnerClient`
(createHold / release / refund) + mapowanie webhooków partnera na
`NormalizedWebhookEvent`. **Bramka: adapter musi przejść tests/payments.test.mjs
z podmienionym mockiem** - ta sama suita, prawdziwy sandbox partnera.

| Kandydat | Za | Przeciw | Dopasowanie |
|---|---|---|---|
| **Circle (USDC)** | natywne USDC, programmable wallets, escrow-like holds | onboarding compliance | ★★★ - zgodne z "USDC na Solanie" ze strategii |
| **Stripe (Connect + manual payouts)** | najdojrzalsze API, spory/refundy | fiat-first, krypto ograniczone geograficznie | ★★ - dobre dla klientów spoza krypto |
| **Sphere / Helio (Solana-native)** | on-chain od razu, niskie koszty | młodsze firmy, mniej precedensów escrow | ★★ - most do V3 |

Kryteria decyzji (w tej kolejności): 1) legalność trzymania środków za NAS
(partner MUSI być licencjonowanym custodianem - my nigdy nie dotykamy środków),
2) webhooki z podpisem + retry, 3) USDC, 4) koszt per transakcja przy dealach $2-20k.

Sekwencja: rozmowy z partnerami po 10-20 ręcznych dealach (M3), sandbox-adapter
→ suita zgodności → audyt → produkcja na JEDNEJ kategorii (audyty).
