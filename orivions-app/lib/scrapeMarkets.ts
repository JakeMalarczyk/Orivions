// Where Orivions looks for web3 companies, by country. Planning data only: no company or contact data lives here.
// Tier = how relevant the country is for Solana B2B services (judgement, not a measured count).
// Mail = how safe cold B2B email is in that country (ok, check with a lawyer, or consent likely required). Not legal advice.
export type MarketTier = 1 | 2 | 3;
export type MailRule = 'ok' | 'check' | 'consent';
export interface Market {
  code: string;
  name: string;
  tier: MarketTier;
  hubs: string;
  focus: string;
  sources: string;
  mail: MailRule;
  mailNote: string;
  lang: string;
}

export const MARKETS: Market[] = [
  { code: "US", name: "United States", tier: 1, hubs: "San Francisco, New York, Miami, Austin", focus: "Largest pool of Solana protocols, wallets, infra and auditors; most Series A and seed rounds.", sources: "Solana ecosystem lists, DefiLlama protocols, Colosseum winners, GitHub orgs; FinCEN MSB registrant search and NYDFS BitLicense list for exchanges and custodians.", mail: "ok", mailNote: "B2B cold email allowed under CAN-SPAM if the sender is identified, the message is honest, there is a working opt-out and a valid postal address in the footer.", lang: "en" },
  { code: "GB", name: "United Kingdom", tier: 1, hubs: "London", focus: "Breakpoint 2026 is in London. Many exchanges, payment firms and law firms; strong legal and compliance supply.", sources: "FCA register of cryptoasset firms, CryptoUK members, Companies House; ecosystem lists.", mail: "ok", mailNote: "Companies can be emailed without prior consent under PECR if sender is identified and an opt-out exists. Sole traders and partnerships count as individuals and need consent. Named contacts fall under UK GDPR.", lang: "en" },
  { code: "SG", name: "Singapore", tier: 1, hubs: "Singapore", focus: "Asia hub for exchanges, market makers, foundations and payment firms.", sources: "MAS Financial Institutions Directory (payment token licensees), Singapore FinTech Association members; ecosystem lists.", mail: "ok", mailNote: "Spam Control Act needs a clear unsubscribe. B2B email is generally workable.", lang: "en" },
  { code: "CH", name: "Switzerland", tier: 1, hubs: "Zug (Crypto Valley), Zurich, Geneva", focus: "Foundations, protocol labs, banks and legal firms.", sources: "Crypto Valley Association member directory, Swiss commercial register (Zefix); ecosystem lists.", mail: "consent", mailNote: "Swiss unfair competition law restricts mass advertising email without consent. Prefer individual, relevant messages, introductions and events. Check with a lawyer.", lang: "en" },
  { code: "AE", name: "United Arab Emirates", tier: 1, hubs: "Dubai, Abu Dhabi", focus: "Fast-growing hub for exchanges, token issuers and marketing agencies.", sources: "VARA public register (Dubai), ADGM FSRA public register, DMCC Crypto Centre members; ecosystem lists.", mail: "check", mailNote: "Data protection and anti-spam rules differ between the mainland and free zones. Check before large batches.", lang: "en" },
  { code: "DE", name: "Germany", tier: 1, hubs: "Berlin, Munich, Frankfurt", focus: "Strong Solana developer and security scene; banks and custodians.", sources: "BaFin company database (crypto custody licence holders), Blockchain Bundesverband members; GitHub orgs.", mail: "consent", mailNote: "Unfair competition law (UWG) generally requires prior consent for advertising email, including B2B. Avoid cold email; use events, forms and warm intros.", lang: "en" },
  { code: "HK", name: "Hong Kong", tier: 1, hubs: "Hong Kong", focus: "Exchanges, market makers and funds serving Asia.", sources: "SFC register of licensed virtual asset trading platforms; ecosystem lists.", mail: "ok", mailNote: "Unsolicited Electronic Messages Ordinance needs sender identity and a working unsubscribe.", lang: "en" },
  { code: "FR", name: "France", tier: 2, hubs: "Paris", focus: "Dense web3 scene: wallets, infra, studios, law firms.", sources: "AMF register of digital asset service providers, Adan members; ecosystem lists.", mail: "ok", mailNote: "B2B prospecting by email is allowed if the message relates to the recipient's professional role and offers an opt-out (CNIL guidance).", lang: "en" },
  { code: "NL", name: "Netherlands", tier: 2, hubs: "Amsterdam", focus: "Exchanges, payment firms and legal advisers.", sources: "DNB register of crypto service providers; ecosystem lists.", mail: "check", mailNote: "Rules for emailing legal entities differ from those for individuals. Check before sending.", lang: "en" },
  { code: "CA", name: "Canada", tier: 2, hubs: "Toronto, Vancouver, Montreal", focus: "Funds, DeFi teams and exchanges; many Solana builders.", sources: "FINTRAC MSB registry, provincial securities regulators' registered platforms; ecosystem lists.", mail: "check", mailNote: "CASL needs consent. Implied consent can apply to a published business address if the message is relevant to the recipient's role. Check.", lang: "en" },
  { code: "AU", name: "Australia", tier: 2, hubs: "Sydney, Melbourne", focus: "Security researchers and auditors, exchanges.", sources: "AUSTRAC Digital Currency Exchange register; ecosystem lists.", mail: "check", mailNote: "Spam Act needs consent. Consent can be inferred for a published business address if the message is relevant. Check.", lang: "en" },
  { code: "PT", name: "Portugal", tier: 2, hubs: "Lisbon, Porto", focus: "Remote-first web3 builders and agencies.", sources: "Banco de Portugal register of virtual asset service providers; ecosystem lists.", mail: "ok", mailNote: "Emailing legal persons is allowed with an opt-out under the national e-privacy law.", lang: "en" },
  { code: "ES", name: "Spain", tier: 2, hubs: "Barcelona, Madrid", focus: "Active builder and agency scene.", sources: "Banco de España register of virtual asset service providers; ecosystem lists.", mail: "consent", mailNote: "The e-commerce law (LSSI) requires prior consent for commercial email, with an exception for existing customers. Prefer warm intros and events.", lang: "en" },
  { code: "PL", name: "Poland", tier: 2, hubs: "Warsaw, Krakow, Wroclaw", focus: "Home market: many dev shops, agencies and law firms. 45 leads already in our list.", sources: "KAS register of virtual currency activity, local web3 communities; ecosystem lists.", mail: "check", mailNote: "Telecom law requires consent for direct marketing by email and its reach to company addresses is debated. Check with a lawyer; keep opt-out wording.", lang: "pl+en" },
  { code: "LT", name: "Lithuania", tier: 2, hubs: "Vilnius", focus: "Many registered crypto firms and payment institutions.", sources: "Register of virtual asset service providers kept by the financial crime investigation service; ecosystem lists.", mail: "check", mailNote: "Check national e-privacy rules.", lang: "en" },
  { code: "EE", name: "Estonia", tier: 2, hubs: "Tallinn", focus: "Security firms and early crypto companies.", sources: "Estonian FIU register of virtual asset service providers; ecosystem lists.", mail: "check", mailNote: "Check national e-privacy rules.", lang: "en" },
  { code: "IL", name: "Israel", tier: 2, hubs: "Tel Aviv", focus: "Strong security and cryptography talent, infra startups.", sources: "Start-Up Nation Central finder; GitHub orgs; ecosystem lists.", mail: "check", mailNote: "Spam law requires consent or an opt-out depending on context. Check.", lang: "en" },
  { code: "TR", name: "Turkey", tier: 2, hubs: "Istanbul", focus: "Large user base and growing builder community.", sources: "Ecosystem lists, local developer communities.", mail: "ok", mailNote: "Commercial email to merchants and tradespeople is allowed with an opt-out under the electronic commerce law.", lang: "en" },
  { code: "IN", name: "India", tier: 2, hubs: "Bengaluru, Mumbai, Delhi", focus: "Large dev talent pool, many dev shops and auditors.", sources: "FIU-IND list of registered virtual digital asset service providers; ecosystem lists.", mail: "ok", mailNote: "No opt-in rule for B2B email. Keep it relevant and include an opt-out.", lang: "en" },
  { code: "KR", name: "South Korea", tier: 2, hubs: "Seoul", focus: "Exchanges, gaming and wallet teams.", sources: "FIU register of virtual asset service providers; ecosystem lists.", mail: "consent", mailNote: "Advertising email needs prior opt-in. Prefer warm intros and events.", lang: "en" },
  { code: "JP", name: "Japan", tier: 2, hubs: "Tokyo", focus: "Exchanges, wallets and payment firms.", sources: "FSA list of registered crypto-asset exchange service providers; ecosystem lists.", mail: "check", mailNote: "Opt-in is required for most advertising email, with exceptions for published business addresses. Check.", lang: "en" },
  { code: "BR", name: "Brazil", tier: 2, hubs: "Sao Paulo", focus: "Large crypto user base, growing builders and payments.", sources: "Ecosystem lists, local communities and conferences.", mail: "check", mailNote: "LGPD applies to personal data. Keep contacts role-based and include an opt-out.", lang: "en" },
  { code: "AR", name: "Argentina", tier: 2, hubs: "Buenos Aires", focus: "Active LATAM builder scene and stablecoin usage.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check personal data rules for named contacts.", lang: "en" },
  { code: "VN", name: "Vietnam", tier: 2, hubs: "Ho Chi Minh City, Hanoi", focus: "Many web3 teams and studios.", sources: "Ecosystem lists, local communities and conferences.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "NG", name: "Nigeria", tier: 2, hubs: "Lagos", focus: "Largest African builder and user base.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national data protection rules.", lang: "en" },
  { code: "CZ", name: "Czechia", tier: 3, hubs: "Prague", focus: "Blockchain studios and agencies.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national e-privacy rules.", lang: "en" },
  { code: "UA", name: "Ukraine", tier: 3, hubs: "Kyiv", focus: "Many engineering and audit teams, often registered abroad.", sources: "Ecosystem lists, GitHub orgs.", mail: "check", mailNote: "Match by team location, not by registration. Check rules for the registration country.", lang: "en" },
  { code: "GE", name: "Georgia", tier: 3, hubs: "Tbilisi", focus: "Growing crypto talent hub.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "TH", name: "Thailand", tier: 3, hubs: "Bangkok", focus: "Exchanges and builder communities.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "ID", name: "Indonesia", tier: 3, hubs: "Jakarta, Bali", focus: "Large user base and remote builders.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "PH", name: "Philippines", tier: 3, hubs: "Manila", focus: "Gaming and community-led web3.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "KE", name: "Kenya", tier: 3, hubs: "Nairobi", focus: "Growing builder community in East Africa.", sources: "Ecosystem lists, local communities.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "MT", name: "Malta", tier: 3, hubs: "Valletta", focus: "Licensed crypto firms and legal advisers.", sources: "MFSA register of virtual financial asset service providers.", mail: "check", mailNote: "Check national e-privacy rules.", lang: "en" },
  { code: "GI", name: "Gibraltar", tier: 3, hubs: "Gibraltar", focus: "Licensed distributed ledger technology providers.", sources: "GFSC register of DLT providers.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "CY", name: "Cyprus", tier: 3, hubs: "Limassol", focus: "Crypto firms and service providers, many with offshore parents.", sources: "CySEC register of crypto-asset service providers.", mail: "check", mailNote: "Check national e-privacy rules.", lang: "en" },
  { code: "IT", name: "Italy", tier: 3, hubs: "Milan, Rome", focus: "Exchanges and legal advisers.", sources: "OAM register of virtual asset service providers.", mail: "check", mailNote: "Rules for emailing legal entities are nuanced. Check.", lang: "en" },
  { code: "IE", name: "Ireland", tier: 3, hubs: "Dublin", focus: "European headquarters of several crypto firms.", sources: "Central Bank register of virtual asset service providers.", mail: "check", mailNote: "Check national e-privacy rules.", lang: "en" },
  { code: "BG", name: "Bulgaria", tier: 3, hubs: "Sofia", focus: "Auditors and engineering teams.", sources: "Ecosystem lists, GitHub orgs.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "RS", name: "Serbia", tier: 3, hubs: "Belgrade", focus: "Engineering and studio teams.", sources: "Ecosystem lists, GitHub orgs.", mail: "check", mailNote: "Check national rules.", lang: "en" },
  { code: "HR", name: "Croatia", tier: 3, hubs: "Zagreb", focus: "Small but active web3 teams.", sources: "Ecosystem lists, GitHub orgs.", mail: "check", mailNote: "Check national rules.", lang: "en" },
];

export const GLOBAL_SOURCES: string[] = [
  "Solana ecosystem directories and project lists",
  "DefiLlama public API (protocols, chains, categories, raises)",
  "Colosseum hackathon winners and finalists",
  "GitHub organisations with Anchor or Solana program repos",
  "Conference exhibitor and speaker lists (Breakpoint, Token2049, ETHDenver)",
  "Company websites: /contact, /about, footer"
];

export const SCRAPE_RULES: string[] = [
  "Use public APIs, registers and company websites. Do not scrape LinkedIn, X or paid databases against their terms.",
  "Respect robots.txt and rate limits. One request every few seconds per domain.",
  "Collect company data and role-based or published business addresses. No private personal data, no guessed addresses.",
  "Store the source URL and the country for every lead (ISO code).",
  "Country decides the channel: green countries get cold email, red countries get warm intros, events, forms and DMs."
];
